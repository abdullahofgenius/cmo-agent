import type { AgentResult, GrowthAction, WebsiteSnapshot } from "./types";

export function buildAgents(scores: { seo: number; content: number; geo: number; technical: number }): AgentResult[] {
  return [
    {
      id: "strategy",
      name: "Strategy",
      specialty: "Plans the highest-leverage growth sprint",
      status: "ready",
      score: Math.round((scores.seo + scores.content + scores.geo + scores.technical) / 4),
      summary: "Prioritized roadmap is ready for review.",
      accent: "#9b8cff",
      tasks: 3,
    },
    {
      id: "seo",
      name: "SEO",
      specialty: "Finds search gaps and on-page fixes",
      status: "ready",
      score: scores.seo,
      summary: scores.seo >= 80 ? "Search foundations look healthy." : "High-impact search fixes were found.",
      accent: "#54d99a",
      tasks: scores.seo >= 80 ? 1 : 4,
    },
    {
      id: "geo",
      name: "GEO",
      specialty: "Improves visibility in AI answers",
      status: "ready",
      score: scores.geo,
      summary: scores.geo >= 75 ? "Brand facts are machine-readable." : "Entity and answer signals need strengthening.",
      accent: "#69b7ff",
      tasks: scores.geo >= 75 ? 2 : 5,
    },
    {
      id: "writer",
      name: "Writer",
      specialty: "Creates briefs and brand-voice drafts",
      status: "queued",
      score: scores.content,
      summary: "Waiting for your strategy approval.",
      accent: "#ffb25e",
      tasks: 2,
    },
    {
      id: "social",
      name: "Social",
      specialty: "Turns insights into channel-native posts",
      status: "queued",
      score: Math.round((scores.content + scores.geo) / 2),
      summary: "Ready to repurpose approved content.",
      accent: "#ff7bac",
      tasks: 3,
    },
    {
      id: "technical",
      name: "Technical",
      specialty: "Ships site and structured-data fixes",
      status: "ready",
      score: scores.technical,
      summary: scores.technical >= 80 ? "Core technical signals are strong." : "Technical improvements are ready to scope.",
      accent: "#64d8df",
      tasks: scores.technical >= 80 ? 1 : 3,
    },
  ];
}

export function buildActions(snapshot: WebsiteSnapshot, scores: { seo: number; content: number; geo: number; technical: number }): GrowthAction[] {
  const actions: GrowthAction[] = [];

  if (!snapshot.description || snapshot.description.length < 120) {
    actions.push({
      id: "meta-description",
      title: "Draft a sharper homepage search snippet",
      description: "Create a benefit-led 140–160 character description aligned with your primary intent.",
      agent: "SEO + Writer",
      impact: "High",
      effort: "Low",
      state: "needs approval",
      draft: draftMetaDescription(snapshot),
    });
  }
  if (snapshot.schemaCount === 0) {
    actions.push({
      id: "schema",
      title: "Add organization and product schema",
      description: "Give search engines and answer engines explicit, verifiable facts about the company and product.",
      agent: "GEO + Technical",
      impact: "High",
      effort: "Medium",
      state: "needs approval",
      draft: draftSchema(snapshot),
    });
  }
  if (snapshot.headings.h2.length < 2 || snapshot.wordCount < 500) {
    actions.push({
      id: "content-structure",
      title: "Build an intent-led homepage narrative",
      description: "Add problem, outcome, use-case and proof sections so visitors and crawlers understand the offer.",
      agent: "Strategy + Writer",
      impact: "High",
      effort: "Medium",
      state: "needs approval",
      draft: draftHomepage(snapshot),
    });
  }
  if (!snapshot.hasOpenGraph || !snapshot.hasTwitterCard) {
    actions.push({
      id: "social-preview",
      title: "Upgrade social sharing previews",
      description: "Add complete Open Graph and social-card metadata before the next launch campaign.",
      agent: "Social + Technical",
      impact: "Medium",
      effort: "Low",
      state: "ready",
      draft: draftSocialPreview(snapshot),
    });
  }
  if (scores.seo >= 80 && scores.content >= 80 && scores.geo >= 75) {
    actions.push({
      id: "distribution",
      title: "Turn the strongest use case into a distribution sprint",
      description: "Create one authority article, three founder posts and a launch-ready community narrative.",
      agent: "Strategy + Social",
      impact: "High",
      effort: "Medium",
      state: "needs approval",
      draft: draftDistribution(snapshot),
    });
  }
  if (actions.length < 3) {
    actions.push({
      id: "topic-map",
      title: "Create a 30-day topic opportunity map",
      description: "Cluster buyer questions into high-intent pages, educational posts and social narratives.",
      agent: "SEO + Strategy",
      impact: "High",
      effort: "Medium",
      state: "needs approval",
      draft: draftTopicMap(snapshot),
    });
  }

  return actions.slice(0, 5);
}

function brandName(snapshot: WebsiteSnapshot): string {
  return snapshot.host.replace(/^www\./, "");
}

function stripBrand(title: string): string {
  return title.replace(/^[\s\S]*?[–\-—|:|·]/, "").trim();
}

/** Real, site-aware deliverable drafts so "review & approve" shows actual work. */
function draftMetaDescription(snapshot: WebsiteSnapshot): string {
  const topic = stripBrand(snapshot.title) || "what we do";
  const brand = brandName(snapshot);
  return [
    `Draft search snippet (~150 chars):`,
    `“${brand} helps you ${topic.toLowerCase().replace(/^what we do$/, "get results")} — with a clear process, proven outcomes and support every step of the way. Start today and see the difference.”`,
    ``,
    `Why it works: leads with the audience benefit, names the outcome, and is inside the 120–170 character target Google usually displays. Keep one primary keyword natural (don’t stuff it).`,
  ].join("\n");
}

function draftSchema(snapshot: WebsiteSnapshot): string {
  const brand = brandName(snapshot);
  const url = snapshot.finalUrl.replace(/\/$/, "");
  return [
    `JSON-LD to paste into <head> (with your real logo, address, phone):`,
    `<script type="application/ld+json">`,
    `{`,
    `  "@context": "https://schema.org",`,
    `  "@type": "Organization",`,
    `  "name": "${brand}",`,
    `  "url": "${url}",`,
    `  "logo": "https://…/logo.png",`,
    `  "sameAs": ["https://linkedin.com/…", "https://x.com/…"]`,
    `}`,
    `</script>`,
    ``,
    `Also add a WebSite entity with potentialAction → SearchAction if you have a site search, and a Service or Product entity for your core offer. This makes the brand easier for Google and AI answers to cite accurately.`,
  ].join("\n");
}

function draftHomepage(snapshot: WebsiteSnapshot): string {
  const brand = brandName(snapshot);
  const topic = stripBrand(snapshot.title) || "what we offer";
  return [
    `Homepage narrative outline for ${brand}:`,
    `1. H1 — One clear promise. e.g. “${capitalize(topic)} for teams that want results without the guesswork.”`,
    `2. Problem — 2–3 sentences naming the pain your visitor feels today.`,
    `3. Solution — How your product/service removes that pain, in plain words.`,
    `4. Proof — one use-case story or number you can stand behind.`,
    `5. Objection — answer the top hesitation (“is it for me?” / “is it affordable?”).`,
    `6. CTA — one next step (Book a call · Start free · Get a quote).`,
    ``,
    `Current scan found only ${snapshot.wordCount} visible words — this structure would take the page from thin to persuasive and gives search engines the semantic headings they want.`,
  ].join("\n");
}

function draftSocialPreview(snapshot: WebsiteSnapshot): string {
  const brand = brandName(snapshot);
  const topic = stripBrand(snapshot.title) || "our work";
  return [
    `Open Graph + social card metadata for <head>:`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${snapshot.title || brand}" />`,
    `<meta property="og:description" content="A crisp line about ${topic}." />`,
    `<meta property="og:image" content="https://…/social-card-1200x630.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ``,
    `Use a 1200×630 PNG with the logo + value prop. This controls exactly how your link looks when shared on WhatsApp, LinkedIn, X and Facebook.`,
  ].join("\n");
}

function draftDistribution(snapshot: WebsiteSnapshot): string {
  const brand = brandName(snapshot);
  return [
    `Distribution sprint for ${brand} (one strong use case):`,
    `1. Authority article — title around your best keyword: “How [audience] can [outcome] without [common blocker].” ~1200 words, one clear answer.`,
    `2. LinkedIn post — a founder take: 3 lessons, ends with a question to drive comments.`,
    `3. X post — a single sharp insight from the article + link.`,
    `4. Community post — answer the same question in a niche Reddit/Slack/Discord where your audience lives (no link-dropping; be genuinely useful).`,
    ``,
    `Publish one per day across 4 days, then promote the winner. Start with the use case you already have proof for.`,
  ].join("\n");
}

function draftTopicMap(snapshot: WebsiteSnapshot): string {
  const brand = brandName(snapshot);
  const topic = stripBrand(snapshot.title) || "your niche";
  return [
    `30-day topic map for ${brand} — cluster: “${topic}”`,
    `Week 1 · Questions — “Is ${topic} worth it?”, “${topic} for beginners”, “How long does ${topic} take?”`,
    `Week 2 · How-to — “How to choose ${topic}”, “Step-by-step ${topic} setup”, “Common ${topic} mistakes”`,
    `Week 3 · Comparison — “${topic} vs alternatives”, “Free vs paid ${topic}”, “${topic} for small teams”`,
    `Week 4 · Authority — “${topic} in 2026: what changed”, a founder case study, an FAQ page`,
    ``,
    `Each becomes one page or one social post. Pick the question with the clearest buyer intent first.`,
  ].join("\n");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
