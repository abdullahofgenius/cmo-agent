# CMO Agent

An original, approval-first AI CMO MVP for startups and SaaS companies. Enter a public website URL and six coordinated specialist agents turn live website signals into a prioritized growth brief.

## What works now

- Live public-homepage fetch and analysis
- SEO, content, GEO, technical and distribution scoring
- Six specialist agent views: Strategy, SEO, GEO, Writer, Social and Technical
- Prioritized findings and an interactive human approval queue
- Optional OpenAI executive-summary enhancement
- Deterministic local strategy engine when no API key is configured
- Responsive dashboard for desktop and mobile
- SSRF controls, redirect validation, response-size caps and request timeouts

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Next.js route handler for the analysis API
- Phosphor icons and custom CSS
- No database yet; this first milestone is intentionally stateless

## Run locally

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open `http://localhost:3000`.

## Optional cloud AI

Set these server-side values in `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Never expose the key through a `NEXT_PUBLIC_` variable or commit `.env.local`.

Without a key, all website analysis and recommendations still work through the local rules engine.

## Useful commands

```bash
npm run typecheck
npm run build
npm audit
```

## Architecture

```text
Browser
  └── POST /api/analyze
        ├── safe-fetch.ts   URL validation, DNS checks, redirects, limits
        ├── analyzer.ts     metadata extraction, scoring, findings
        ├── agents.ts       specialist outputs and approval actions
        └── llm.ts          optional server-side cloud-model enhancement
```

## Product roadmap

### Milestone 2 — Accounts and persistent workspaces
- Auth, PostgreSQL and organization workspaces
- Saved scans, approval history and audit logs
- Brand profile, target personas and tone-of-voice memory

### Milestone 3 — Real data integrations
- Google Search Console and GA4
- GitHub App installation and technical-SEO pull requests
- Sitemap crawling and page-level opportunity maps

### Milestone 4 — Production agent execution
- Durable job queue and scheduled runs
- Content briefs, drafts and campaign assets
- Agent budgets, retries, observability and evaluation datasets

### Milestone 5 — Distribution
- LinkedIn, X and Reddit research/draft workflows
- CMS publishing with explicit approval gates
- Reporting, attribution and weekly founder brief

## Important production note

The MVP performs DNS checks before outbound requests and validates every redirect. A production deployment should additionally route fetches through an isolated outbound proxy to fully mitigate DNS-rebinding and parser risks. Social and search integrations should use OAuth with encrypted, scoped tokens.

## Originality

This project is inspired by the general AI CMO product category. It does not copy Okara's proprietary source code, brand, content or design assets.
