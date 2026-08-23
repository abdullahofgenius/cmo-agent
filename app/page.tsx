"use client";

import {
  ArrowRight,
  Article,
  Brain,
  Check,
  CheckCircle,
  Code,
  Compass,
  Gauge,
  Globe,
  House,
  Lightning,
  LinkSimple,
  ListChecks,
  MagnifyingGlass,
  Megaphone,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
  SquaresFour,
  Target,
  TrendUp,
  UsersThree,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AgentResult, AnalysisReport, Finding } from "@/lib/types";

const previewAgents = [
  { id: "strategy", name: "Strategy", specialty: "Builds your growth roadmap", accent: "#9b8cff", icon: Compass },
  { id: "seo", name: "SEO", specialty: "Finds demand and search gaps", accent: "#54d99a", icon: MagnifyingGlass },
  { id: "geo", name: "GEO", specialty: "Earns visibility in AI answers", accent: "#69b7ff", icon: Sparkle },
  { id: "writer", name: "Writer", specialty: "Creates useful, on-brand content", accent: "#ffb25e", icon: Article },
  { id: "social", name: "Social", specialty: "Turns insights into distribution", accent: "#ff7bac", icon: Megaphone },
  { id: "technical", name: "Technical", specialty: "Ships measurable site fixes", accent: "#64d8df", icon: Code },
];

const progressSteps = [
  "Connecting to the website…",
  "Mapping search and content signals…",
  "Checking answer-engine readiness…",
  "Building your prioritized growth plan…",
];

function AgentGlyph({ id, size = 20 }: { id: string; size?: number }) {
  const icons = { strategy: Compass, seo: MagnifyingGlass, geo: Sparkle, writer: Article, social: Megaphone, technical: Code };
  const Icon = icons[id as keyof typeof icons] || Brain;
  return <Icon size={size} weight="duotone" />;
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="score-ring" style={{ background: `conic-gradient(#9b8cff ${score * 3.6}deg, #242532 0deg)` }}>
      <div className="score-ring-inner">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function MiniScore({ label, score, accent }: { label: string; score: number; accent: string }) {
  return (
    <div className="mini-score">
      <div className="mini-score-head">
        <span>{label}</span>
        <strong>{score}</strong>
      </div>
      <div className="progress-track"><div style={{ width: `${score}%`, background: accent }} /></div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Finding["severity"] }) {
  const label = severity === "high" ? "Priority" : severity === "medium" ? "Improve" : "Polish";
  return <span className={`severity ${severity}`}>{severity === "high" && <WarningCircle size={13} weight="fill" />}{label}</span>;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + 1, progressSteps.length - 1)), 1700);
    return () => window.clearInterval(timer);
  }, [loading]);

  const priorityCount = useMemo(() => report?.findings.filter((item) => item.severity === "high").length || 0, [report]);

  async function analyze(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setApproved(new Set());
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "We could not analyze that website.");
      setReport(data);
      window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not analyze that website.");
    } finally {
      setLoading(false);
    }
  }

  function toggleApproval(id: string) {
    setApproved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><TrendUp size={19} weight="bold" /></div>
          <div><strong>CMO Agent</strong><span>Growth OS</span></div>
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <nav className="nav-list">
          <a className="active" href="#overview"><House size={19} weight="duotone" />Overview</a>
          <a href="#agents"><UsersThree size={19} weight="duotone" />AI team<span className="nav-count">6</span></a>
          <a href="#approvals"><ListChecks size={19} weight="duotone" />Approvals{report && <span className="nav-count hot">{report.actions.length - approved.size}</span>}</a>
          <a href="#results"><Target size={19} weight="duotone" />Opportunities</a>
          <a href="#integrations"><SquaresFour size={19} weight="duotone" />Integrations</a>
        </nav>

        <div className="sidebar-divider" />
        <p className="nav-label">Workspace</p>
        <button className="workspace-switcher"><span className="workspace-avatar">S</span><span><strong>Startup workspace</strong><small>Website intelligence</small></span><ArrowRight size={16} /></button>

        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><RocketLaunch size={18} weight="duotone" /></div>
            <div><strong>MVP workspace</strong><p>Cloud AI adapter is ready.</p></div>
            <span>DEV</span>
          </div>
          <div className="profile-row"><div className="profile-avatar">A</div><div><strong>Founder</strong><span>Admin workspace</span></div><span className="online-dot" /></div>
        </div>
      </aside>

      {menuOpen && <button className="backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="main-content" id="overview">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><SquaresFour size={21} /></button>
          <div className="crumb"><span>Startup workspace</span><span>/</span><strong>Overview</strong></div>
          <div className="top-actions">
            <span className="system-state"><span /> All systems ready</span>
            <button className="icon-button" aria-label="Activity"><Lightning size={19} /></button>
            <div className="top-avatar">A</div>
          </div>
        </header>

        <div className="page-wrap">
          <section className="hero-section">
            <div className="eyebrow"><span><Sparkle size={13} weight="fill" /></span> Your AI growth command center</div>
            <div className="hero-grid">
              <div>
                <h1>Turn your website into<br /><em>a growth plan.</em></h1>
                <p>Six specialist agents inspect your positioning, search visibility, content and technical foundations—then bring you the next best moves to approve.</p>
              </div>
              <div className="hero-proof">
                <div><strong>6</strong><span>Specialist<br />agents</span></div>
                <i />
                <div><strong>1</strong><span>Prioritized<br />plan</span></div>
                <i />
                <div><ShieldCheck size={25} weight="duotone" /><span>Approval<br />first</span></div>
              </div>
            </div>

            <form className="analyze-card" onSubmit={analyze}>
              <div className="analyze-icon"><Globe size={24} weight="duotone" /></div>
              <div className="input-wrap">
                <label htmlFor="website">Company website</label>
                <input
                  id="website"
                  type="text"
                  inputMode="url"
                  placeholder="yourstartup.com"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  disabled={loading}
                  required
                  autoComplete="url"
                />
              </div>
              <button className="primary-button" type="submit" disabled={loading || !url.trim()}>
                {loading ? <><span className="spinner" />Analyzing</> : <>Build my growth plan<ArrowRight size={17} weight="bold" /></>}
              </button>
            </form>
            <div className="scan-note"><ShieldCheck size={14} />Public homepage data only · No login required · You approve every action</div>
            {error && <div className="error-banner"><WarningCircle size={18} weight="fill" /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}
          </section>

          {loading && (
            <section className="loading-panel" aria-live="polite">
              <div className="scanner-visual"><Globe size={32} weight="duotone" /><span className="orbit one" /><span className="orbit two" /></div>
              <div><span className="loading-kicker">LIVE ANALYSIS</span><h2>{progressSteps[progress]}</h2><p>The agent team is collecting signals. This usually takes a few seconds.</p></div>
              <div className="step-dots">{progressSteps.map((_, index) => <span key={index} className={index <= progress ? "done" : ""}>{index < progress ? <Check size={12} weight="bold" /> : index + 1}</span>)}</div>
            </section>
          )}

          {!report && !loading && (
            <>
              <section className="section-block" id="agents">
                <div className="section-heading">
                  <div><span className="section-kicker">MEET THE TEAM</span><h2>One goal. Six specialists.</h2><p>Each agent owns a growth function. The strategy agent keeps their work focused on one shared plan.</p></div>
                  <div className="agent-connection"><span /><span /><span />Coordinated, not siloed</div>
                </div>
                <div className="agent-grid preview">
                  {previewAgents.map((agent, index) => {
                    const Icon = agent.icon;
                    return (
                      <article className="agent-card" key={agent.id} style={{ "--agent-accent": agent.accent } as React.CSSProperties}>
                        <div className="agent-top"><div className="agent-icon"><Icon size={22} weight="duotone" /></div><span className="agent-index">0{index + 1}</span></div>
                        <h3>{agent.name}</h3><p>{agent.specialty}</p>
                        <div className="agent-ready"><span />Ready after first scan</div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="workflow-card">
                <div className="workflow-copy"><span className="section-kicker">HOW IT WORKS</span><h2>From signal to shipped work.</h2><p>The agents research and prepare. You stay in control of what goes live.</p></div>
                <div className="workflow-steps">
                  <div><span><Gauge size={20} weight="duotone" /></span><strong>Analyze</strong><small>Read real website signals</small></div><ArrowRight size={17} />
                  <div><span><Brain size={20} weight="duotone" /></span><strong>Plan</strong><small>Rank work by impact</small></div><ArrowRight size={17} />
                  <div><span><ListChecks size={20} weight="duotone" /></span><strong>Approve</strong><small>Keep a human in the loop</small></div><ArrowRight size={17} />
                  <div><span><RocketLaunch size={20} weight="duotone" /></span><strong>Ship</strong><small>Publish through integrations</small></div>
                </div>
              </section>
            </>
          )}

          {report && !loading && (
            <div id="results" className="results-wrap">
              <section className="results-header">
                <div>
                  <div className="domain-chip"><span className="favicon-fallback">{report.snapshot.host.charAt(0).toUpperCase()}</span>{report.snapshot.host}<CheckCircle size={15} weight="fill" /></div>
                  <h2>Your growth brief is ready.</h2>
                  <p>Analyzed {report.snapshot.wordCount.toLocaleString()} words, {report.snapshot.links.internal + report.snapshot.links.external} links and {report.snapshot.headings.h1.length + report.snapshot.headings.h2.length + report.snapshot.headings.h3Count} headings.</p>
                </div>
                <button className="secondary-button" onClick={() => { setReport(null); setUrl(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Globe size={17} />Analyze another site</button>
              </section>

              <section className="score-layout">
                <article className="overall-card">
                  <div className="card-label"><Gauge size={17} weight="duotone" />GROWTH READINESS</div>
                  <div className="overall-body"><ScoreRing score={report.overallScore} /><div><h3>{report.overallScore >= 80 ? "Strong foundation" : report.overallScore >= 60 ? "Ready to improve" : "Big upside ahead"}</h3><p>{report.summary}</p><span className="engine-badge"><Brain size={13} />{report.llmEnhanced ? "AI-enhanced strategy" : "Local strategy engine"}</span></div></div>
                </article>
                <article className="score-breakdown">
                  <div className="card-label"><Target size={17} weight="duotone" />SIGNAL BREAKDOWN</div>
                  <div className="mini-grid">
                    <MiniScore label="SEO" score={report.scores.seo} accent="#54d99a" />
                    <MiniScore label="Content" score={report.scores.content} accent="#ffb25e" />
                    <MiniScore label="GEO" score={report.scores.geo} accent="#69b7ff" />
                    <MiniScore label="Technical" score={report.scores.technical} accent="#64d8df" />
                  </div>
                </article>
              </section>

              <section className="section-block findings-section">
                <div className="section-heading compact"><div><span className="section-kicker">OPPORTUNITY MAP</span><h2>{priorityCount ? `${priorityCount} priority ${priorityCount === 1 ? "move" : "moves"} surfaced` : "Your strongest next moves"}</h2><p>Ranked by likely impact, not by vanity metrics.</p></div><span className="live-data"><span />Live website data</span></div>
                <div className="findings-list">
                  {report.findings.map((finding, index) => (
                    <article className="finding-row" key={finding.id}>
                      <span className="finding-number">{String(index + 1).padStart(2, "0")}</span>
                      <div className="finding-copy"><div><h3>{finding.title}</h3><SeverityBadge severity={finding.severity} /></div><p>{finding.detail}</p></div>
                      <span className="owner-chip"><AgentGlyph id={finding.agent.toLowerCase()} size={16} />{finding.agent}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section-block" id="agents">
                <div className="section-heading compact"><div><span className="section-kicker">AGENT TEAM</span><h2>Specialists aligned on one plan</h2><p>Each score reflects the signals found in this scan.</p></div></div>
                <div className="agent-grid report-grid">
                  {report.agents.map((agent: AgentResult) => (
                    <article className="agent-card report" key={agent.id} style={{ "--agent-accent": agent.accent } as React.CSSProperties}>
                      <div className="agent-top"><div className="agent-icon"><AgentGlyph id={agent.id} size={22} /></div><span className={`status-pill ${agent.status}`}><i />{agent.status}</span></div>
                      <div className="agent-score"><strong>{agent.score}</strong><span>/100</span></div>
                      <h3>{agent.name}</h3><p>{agent.specialty}</p>
                      <div className="agent-footer"><span>{agent.summary}</span><b>{agent.tasks} tasks</b></div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="approvals-section" id="approvals">
                <div className="section-heading compact"><div><span className="section-kicker">APPROVAL QUEUE</span><h2>Ready when you are.</h2><p>No autonomous publishing. Review the work before an agent moves forward.</p></div><div className="approval-progress"><strong>{approved.size}/{report.actions.length}</strong><span>approved</span></div></div>
                <div className="approval-list">
                  {report.actions.map((action) => {
                    const isApproved = approved.has(action.id);
                    return (
                      <article className={`approval-row ${isApproved ? "approved" : ""}`} key={action.id}>
                        <button className="approval-check" onClick={() => toggleApproval(action.id)} aria-label={isApproved ? "Undo approval" : "Approve action"}>{isApproved && <Check size={15} weight="bold" />}</button>
                        <div className="approval-copy"><div><h3>{action.title}</h3><span>{action.agent}</span></div><p>{action.description}</p><div className="action-meta"><span className={`impact ${action.impact.toLowerCase()}`}>{action.impact} impact</span><span>{action.effort} effort</span></div></div>
                        <button className={`approve-button ${isApproved ? "done" : ""}`} onClick={() => toggleApproval(action.id)}>{isApproved ? <><CheckCircle size={17} weight="fill" />Approved</> : <>Review & approve<ArrowRight size={15} /></>}</button>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          <section className="integrations-strip" id="integrations">
            <div><span className="section-kicker">BUILT TO CONNECT</span><h3>Your data in. Approved work out.</h3></div>
            <div className="integration-list">
              <span><Globe size={18} />Website<strong>LIVE</strong></span>
              <span><LinkSimple size={18} />Search Console<small>NEXT</small></span>
              <span><Code size={18} />GitHub<small>NEXT</small></span>
              <span><Megaphone size={18} />Social<small>LATER</small></span>
            </div>
          </section>

          <footer><div className="brand-mark small"><TrendUp size={14} weight="bold" /></div><span>CMO Agent · Original MVP for startup growth teams</span><span>Approval-first by design</span></footer>
        </div>
      </main>
    </div>
  );
}
