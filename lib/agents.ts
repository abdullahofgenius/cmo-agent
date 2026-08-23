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
    });
  }

  return actions.slice(0, 5);
}
