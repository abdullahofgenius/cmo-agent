export type Severity = "high" | "medium" | "low";
export type AgentStatus = "ready" | "working" | "queued";

export interface WebsiteSnapshot {
  url: string;
  finalUrl: string;
  host: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  language: string;
  headings: { h1: string[]; h2: string[]; h3Count: number };
  links: { internal: number; external: number };
  wordCount: number;
  hasViewport: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  schemaCount: number;
  loadTimeMs: number;
  statusCode: number;
}

export interface Finding {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  agent: string;
}

export interface GrowthAction {
  id: string;
  title: string;
  description: string;
  agent: string;
  impact: "High" | "Medium";
  effort: "Low" | "Medium" | "High";
  state: "needs approval" | "ready";
}

export interface AgentResult {
  id: string;
  name: string;
  specialty: string;
  status: AgentStatus;
  score: number;
  summary: string;
  accent: string;
  tasks: number;
}

export interface AnalysisReport {
  id: string;
  createdAt: string;
  snapshot: WebsiteSnapshot;
  overallScore: number;
  summary: string;
  scores: { seo: number; content: number; geo: number; technical: number };
  findings: Finding[];
  actions: GrowthAction[];
  agents: AgentResult[];
  llmEnhanced: boolean;
}
