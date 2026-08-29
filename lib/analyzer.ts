import { buildActions, buildAgents } from "./agents";
import { enhanceSummary } from "./llm";
import { fetchWebsite } from "./safe-fetch";
import type { AnalysisReport, Finding, WebsiteSnapshot } from "./types";

function decodeEntities(value: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };
  return value
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/gi, (match) => entities[match.toLowerCase()] || match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " "));
}

function getAttribute(tag: string, name: string): string {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:["']([^"']*)["']|([^\\s>]+))`, "i");
  const match = tag.match(pattern);
  return decodeEntities(match?.[1] || match?.[2] || "");
}

function getMeta(html: string, key: string): string {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const identifier = getAttribute(tag, "name") || getAttribute(tag, "property") || getAttribute(tag, "http-equiv");
    if (identifier.toLowerCase() === key.toLowerCase()) return getAttribute(tag, "content");
  }
  return "";
}

function getLink(html: string, rel: string): string {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rels = getAttribute(tag, "rel").toLowerCase().split(/\s+/);
    if (rels.includes(rel.toLowerCase())) return getAttribute(tag, "href");
  }
  return "";
}

function extractElements(html: string, tag: string, limit = 20): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const items: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && items.length < limit) {
    const value = cleanText(match[1]);
    if (value) items.push(value);
  }
  return items;
}

function inspectLinks(html: string, pageUrl: string) {
  const tags = html.match(/<a\b[^>]*>/gi) || [];
  const origin = new URL(pageUrl).origin;
  let internal = 0;
  let external = 0;
  for (const tag of tags) {
    const href = getAttribute(tag, "href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const destination = new URL(href, pageUrl);
      if (!["http:", "https:"].includes(destination.protocol)) continue;
      if (destination.origin === origin) internal += 1;
      else external += 1;
    } catch {
      // Ignore malformed links; the audit should still complete.
    }
  }
  return { internal, external };
}

function snapshotFromHtml(
  inputUrl: string,
  finalUrl: string,
  html: string,
  statusCode: number,
  loadTimeMs: number,
): WebsiteSnapshot {
  const title = cleanText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || "";
  const h1 = extractElements(html, "h1", 10);
  const h2 = extractElements(html, "h2", 30);
  const h3Count = (html.match(/<h3\b/gi) || []).length;
  const contentOnly = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
  const visibleText = cleanText(contentOnly);
  const words = visibleText.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];

  return {
    url: inputUrl,
    finalUrl,
    host: new URL(finalUrl).hostname.replace(/^www\./, ""),
    title,
    description: getMeta(html, "description"),
    canonical: getLink(html, "canonical"),
    robots: getMeta(html, "robots"),
    language: getAttribute(htmlTag, "lang") || "unknown",
    headings: { h1, h2, h3Count },
    links: inspectLinks(html, finalUrl),
    wordCount: words.length,
    hasViewport: Boolean(getMeta(html, "viewport")),
    hasOpenGraph: Boolean(getMeta(html, "og:title") && getMeta(html, "og:description")),
    hasTwitterCard: Boolean(getMeta(html, "twitter:card")),
    schemaCount: (html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/gi) || []).length,
    loadTimeMs,
    statusCode,
  };
}

const clamp = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

function scoreSnapshot(snapshot: WebsiteSnapshot) {
  let seo = 100;
  let content = 100;
  let geo = 100;
  let technical = 100;

  if (!snapshot.title) seo -= 24;
  else if (snapshot.title.length < 30 || snapshot.title.length > 65) seo -= 10;
  if (!snapshot.description) seo -= 20;
  else if (snapshot.description.length < 120 || snapshot.description.length > 170) seo -= 8;
  if (snapshot.headings.h1.length === 0) seo -= 18;
  if (snapshot.headings.h1.length > 1) seo -= 8;
  if (!snapshot.canonical) seo -= 10;
  if (/noindex/i.test(snapshot.robots)) seo -= 25;
  if (snapshot.links.internal < 3) seo -= 8;

  if (snapshot.wordCount < 250) content -= 30;
  else if (snapshot.wordCount < 500) content -= 15;
  if (snapshot.headings.h2.length < 2) content -= 18;
  if (!snapshot.description) content -= 12;
  if (snapshot.headings.h1[0]?.length < 18) content -= 8;
  if (snapshot.links.external === 0) content -= 5;

  if (snapshot.schemaCount === 0) geo -= 30;
  if (!snapshot.description) geo -= 15;
  if (snapshot.headings.h2.length < 3) geo -= 12;
  if (snapshot.wordCount < 500) geo -= 12;
  if (!snapshot.hasOpenGraph) geo -= 8;
  if (snapshot.language === "unknown") geo -= 5;

  if (!snapshot.hasViewport) technical -= 22;
  if (!snapshot.finalUrl.startsWith("https://")) technical -= 25;
  if (snapshot.loadTimeMs > 3000) technical -= 18;
  else if (snapshot.loadTimeMs > 1800) technical -= 8;
  if (!snapshot.hasOpenGraph) technical -= 8;
  if (!snapshot.hasTwitterCard) technical -= 5;
  if (snapshot.statusCode !== 200) technical -= 15;

  return { seo: clamp(seo), content: clamp(content), geo: clamp(geo), technical: clamp(technical) };
}

function buildFindings(snapshot: WebsiteSnapshot): Finding[] {
  const findings: Finding[] = [];
  const add = (id: string, title: string, detail: string, severity: Finding["severity"], agent: string) =>
    findings.push({ id, title, detail, severity, agent });

  if (!snapshot.title) add("title-missing", "Page title is missing", "Add a distinct title that combines the core outcome with the brand.", "high", "SEO");
  else if (snapshot.title.length < 30 || snapshot.title.length > 65)
    add("title-length", "Page title needs tightening", `Current title is ${snapshot.title.length} characters; aim for roughly 30–65.`, "medium", "SEO");
  if (!snapshot.description) add("description-missing", "Meta description is missing", "Write a compelling search snippet with audience, outcome and differentiation.", "high", "SEO");
  else if (snapshot.description.length < 120 || snapshot.description.length > 170)
    add("description-length", "Search snippet can be stronger", `Current description is ${snapshot.description.length} characters; aim for 120–170.`, "medium", "Writer");
  if (snapshot.headings.h1.length === 0) add("h1-missing", "No primary heading detected", "Use one clear H1 that explains what the product does and for whom.", "high", "Writer");
  if (snapshot.headings.h1.length > 1) add("h1-multiple", "Multiple primary headings detected", `The page has ${snapshot.headings.h1.length} H1 elements; create one dominant page topic.`, "medium", "SEO");
  if (snapshot.wordCount < 500) add("thin-copy", "The homepage narrative is light", `About ${snapshot.wordCount} words were detected; deepen use cases, proof and objections.`, "medium", "Strategy");
  if (snapshot.schemaCount === 0) add("schema-missing", "No structured data detected", "Add Organization, WebSite and Product or SoftwareApplication schema where accurate.", "high", "GEO");
  if (!snapshot.canonical) add("canonical-missing", "Canonical URL is not declared", "Declare the preferred homepage URL to consolidate indexing signals.", "medium", "Technical");
  if (!snapshot.hasOpenGraph) add("og-missing", "Social preview metadata is incomplete", "Add Open Graph title, description and image for consistent sharing.", "low", "Social");
  if (!snapshot.hasViewport) add("viewport-missing", "Mobile viewport is missing", "Add a responsive viewport declaration for mobile rendering.", "high", "Technical");

  if (!findings.length) {
    add("expansion", "Foundations look strong", "The next opportunity is expanding high-intent topic coverage and distribution.", "low", "Strategy");
  }
  return findings.slice(0, 8);
}

export async function analyzeWebsite(inputUrl: string): Promise<AnalysisReport> {
  const fetched = await fetchWebsite(inputUrl);
  const snapshot = snapshotFromHtml(inputUrl, fetched.finalUrl, fetched.html, fetched.statusCode, fetched.loadTimeMs);
  const scores = scoreSnapshot(snapshot);
  const findings = buildFindings(snapshot);
  const overallScore = Math.round(scores.seo * 0.3 + scores.content * 0.25 + scores.geo * 0.2 + scores.technical * 0.25);
  const fallbackSummary =
    overallScore >= 80
      ? `${snapshot.host} has a solid growth foundation. The strongest upside now is turning clear product signals into an authority and distribution program.`
      : `${snapshot.host} has promising fundamentals, with ${findings.filter((item) => item.severity === "high").length} high-priority opportunities. Fix the clearest discovery and messaging gaps before scaling content distribution.`;
  const enhancedSummary = await enhanceSummary(snapshot, scores);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    snapshot,
    overallScore,
    summary: enhancedSummary || fallbackSummary,
    scores,
    findings,
    actions: buildActions(snapshot, scores),
    agents: buildAgents(scores),
    llmEnhanced: Boolean(enhancedSummary),
  };
}
