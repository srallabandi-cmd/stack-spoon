# Role Kits 2026: Pressure Ranking, Benchmarks, and Product Picks

**Research date:** 2026-08-07  
**Purpose:** Backing research for Stack Spoon Role Packs, diagnose search, and Early Stage Startup cost stack.  
**Companions:** `docs/14-competitive-union-intersection.md`, `docs/15-top5-competitor-brief.md`

---

## 1. Top 20 roles under AI pressure

Ranked by adoption pain + spend + board pressure (Writer Enterprise AI Adoption 2026, Microsoft Work Trend Index 2026, AP/TNW tokenmaxxing coverage, consulting/banking agent rollouts, role-tool roundups):

| Rank | Role | Pressure signal |
|---|---|---|
| 1 | Software Engineer / AI Engineer | Token budgets, Copilot vs Claude Code chaos, eval debt |
| 2 | AI Product Manager / Product Manager | Tool sprawl, launch gates, Monday clarity |
| 3 | Customer Support / Contact Center | Stalled projects, trust, escalation HITL |
| 4 | Sales (SDR/AE) + RevOps | Pipeline AI sprawl, CRM write fear |
| 5 | Marketing / Content | Brand risk, draft flood, attribution noise |
| 6 | Management Consultant / Strategy Analyst | Agent armies + fee model shock |
| 7 | Finance / FP&A / Accounting | Close audit trails, Copilot-in-sheets |
| 8 | Legal / Compliance / Risk | Long-context review + approve-before-send |
| 9 | Customer Success | Renewal risk, QBR prep, ticket leakage |
| 10 | People Ops / Recruiting | Candidate privacy, scorecard drift |
| 11 | Data Analyst / Analytics Engineer | Notebook + BI agent sprawl |
| 12 | Program / Project Manager | Dependency honesty, status theater |
| 13 | Ops / Business Operations | Automation without governance |
| 14 | Executive Support / Chief of Staff | Calendar + brief overload |
| 15 | Design / UX Research | Synthesis debt, clip sprawl |
| 16 | IT / Security / AI Governance | Shadow AI, kill switches |
| 17 | Early-stage Founder (1–10) | Cost + no structure |
| 18 | Healthcare Ops / Clinical Admin | Regulated workflow lag |
| 19 | Teacher / L&D | Content agents without pedagogy packs |
| 20 | Research Scientist (frontier labs) | Internal evals not productized |

**Highest pressure + biggest problems:** engineers (token budgets), support (trust), consultants (fee shock), PMs, sales/marketing, finance/legal (governance), founders (cost + chaos).

**Stack Spoon ships 18 roles in MVP** (PM cluster kept; high-pressure gaps added; Early Stage replaces SMB). Ranks 15–16 and 18–20 stay research-only for now (Design, IT/Security, Healthcare, Teacher, Research Scientist).

---

## 2. Token redaction and adoption failure patterns

### Cross-role failure patterns
- Skills gap, not model gap: employees do not know how to redesign workflows (Deloitte / Writer).
- Shadow AI + no kill switch for agents.
- Tool sprawl with no Role Pack / HITL structure (US Bank-style: VS Code + Copilot, no kit).
- Tokenmaxxing backlash: Uber burned 2026 Claude budget by April; Microsoft set division caps; Meta/Amazon token leaderboards then throttles; Atlassian/Citi capping usage.
- Geographies with daily new products (SF, NYC, Seattle, London, India, China) amplify FOMO buy → cost redaction cycle.

### Redaction signals by market / role
| Segment | What got redacted | Kit implication |
|---|---|---|
| Engineering | Uncapped coding agents, duplicate Copilot+Claude seats | Daily $ caps, model routing, circuit breakers |
| Consulting | Unbounded research agents eating partner margins | Client-safe HITL, reusable packs vs firm-only RAG |
| Banks | Open agents without Fence-style guardrails | Approve-before-send, audit trail packs |
| Support / Sales | Autopilot replies that damaged trust | Escalation HITL before autonomy |
| Early-stage | $99–999/mo multi-agent platforms before PMF | n8n/Make + cheap models + hard caps |

---

## 3. Company benchmarks

| Firm class | What they do | Gap Stack Spoon fills |
|---|---|---|
| McKinsey Lilli + ~25k agents | Firm knowledge RAG + agent army | HITL inbox + reusable Role Pack (not firm-only) |
| BCG value capture / Bain OpenAI+Sage | Deck + research agents for billable work | Client-safe proposals, pack install for mid-market |
| JPMC Fence / governance hiring | Guardrails + policy automation | Compliance-aware kits so mid-market is not stuck at “Copilot in VS Code” |
| BofA Erica / AET | Customer + employee agents at scale | Ready-made ops packs with audit trail |
| OpenAI / Anthropic / Google / Meta / NVIDIA / SpaceX / AMD | Internal evals, model routing, cost caps | Productize those habits for non-frontier companies |

---

## 4. Product recommendations (editorial Stack Spoon picks)

| Domain | Recommend | Why | Tier |
|---|---|---|---|
| Meeting notes (IC / founder / consulting) | Granola | Bot-free, already a Stack Spoon connector | pro |
| Meeting notes (sales / CRM) | Fireflies | CRM push | pro |
| Meeting notes (budget) | Fathom | Free-first; upgrade path to Granola | free |
| Coding | Cursor + Claude Code / Copilot | Route by task cost | pro |
| Research | Perplexity / Claude | Source-backed / long docs | cheap–pro |
| Sales | HubSpot AI or Apollo / Clay | Pipeline vs prospecting | pro |
| Marketing | Claude / ChatGPT + Canva + Jasper | Draft + visual + brand | cheap–pro |
| Support | Intercom Fin / Zendesk AI | Escalation + HITL | pro |
| Legal | Claude + contract review tool (goHeather class) | Long context + review | pro |
| Finance | Copilot / Gemini in sheets + close checklist agents | Audit trail | pro |
| Automation (startup cheap) | n8n / Make + cheap model routing | Avoid $99–999 agent platforms early | cheap |
| Knowledge | Notion AI | Already a connector | cheap |

Label in product UI: **Stack Spoon picks** (editorial, not affiliate in v1).

---

## 5. Early-stage cost stack (1–10 employees)

**Thesis:** founders fail AI adoption on cost and structure, not model quality.

| Band | Monthly | Stack |
|---|---|---|
| $0–50 | Survive | Fathom free, Gemini Flash-Lite / free tiers, n8n self-host or Make free, Slack+Calendar only |
| $50–200 | Focus | Granola or 1 paid seat, cheap model routing, one workflow (meetings → Inbox → Monday brief) |
| $200+ | Scale carefully | Add Linear/Notion + one domain tool; still no multi-agent platforms |

**Guardrails**
- Daily $ caps before autonomy.
- HITL before any send / ticket create.
- Single-workflow-first (meetings → decisions), not agent armies.
- Do not buy multi-agent platforms yet.
- Upgrade path: Fathom → Granola when notes become the decision lake.

---

## 6. Top-5 competitor briefing

Full write-up: [`docs/15-top5-competitor-brief.md`](15-top5-competitor-brief.md).

Relay.app is shutting down. That opens clearer whitespace for HITL inbox + Role Pack install for non-builders.

### Product Console
- **Features:** Knowledge Index, Composer, Discovery/Sync, HITL Inbox; Cursor-for-PMs workspace.
- **Similarities:** Inbox-first agents, PM-native framing.
- **Differences:** New workspace SoR; Slack incomplete; outcome loop still maturing.
- **Our misses vs them:** Less polished PM workspace chrome today.
- **Their misses vs us:** No non-tech Role Pack catalog across 16 jobs; weaker spoon-fed OAuth hub story; less cost-first early-stage pack.

### Dust
- **Features:** Org-tuned DIY agents, connectors, MCP for power users.
- **Similarities:** Connected company data + agents.
- **Differences:** Builder ontology; MCP fragility / feature flags.
- **Our misses:** Less DIY flexibility for power builders.
- **Their misses:** No job-title Role Pack → HITL path for non-tech; MCP is still developer UX.

### Lindy
- **Features:** Personal / admin multi-channel assistant, templates.
- **Similarities:** Ready-made assistant feel, fast personal onboarding.
- **Differences:** Not org product memory or role kits for GTM/ops teams.
- **Our misses:** Fewer consumer-channel automations.
- **Their misses:** No Context Lake / Monday Morning OS; not a team Role Pack product.

### Relevance AI
- **Features:** Multi-agent builder, workforce templates, tool wiring for ops teams.
- **Similarities:** Agent kits for business workflows.
- **Differences:** Builder-heavy canvas; less “install your role” for non-tech.
- **Our misses:** Fewer multi-agent orchestration primitives.
- **Their misses:** Weak HITL inbox + connector hub as the hero path; cost guardrails for early-stage underplayed.

### Zapier Agents
- **Features:** Widest app graph, plain-English agent builder, Central.
- **Similarities:** OAuth connectors, template agents.
- **Differences:** Generic behaviors; no PM/role methodology or decision lake.
- **Our misses:** Narrower connector count at MVP.
- **Their misses:** No role ontology, no eval craft, no suite-agnostic Context Lake conductor.

**Whitespace after Relay:** HITL checkpoints + fast small-team onboarding without forcing DIY agent design. Stack Spoon owns Role Pack → Hub → Inbox → Monday brief.

---

## 7. Per-role kit thesis (MVP 18)

| RoleId | Kit thesis |
|---|---|
| software-engineer | Stop tokenmaxxing; route Cursor/Copilot; circuit breakers; eval loops |
| ai-pm / pm | Evals, launches, Monday clarity; Scribe→Inbox |
| customer-support | Helpdesk AI + escalation HITL |
| sales | CRM-aware notes + pipeline proposals, never silent CRM writes |
| marketing | Draft + brand guardrails; Canva/Jasper adjacent |
| consultant | Lilli/Sage-style research+deck with client-safe HITL |
| finance | Close checklists, variance notes, audit trail |
| legal-compliance | Long-context review, approve-before-send |
| customer-success | QBR prep, renewal risk, ticket leakage → Inbox |
| people-ops | Scorecards + privacy-aware HITL |
| data-analyst | Notebook/BI synthesis with citation HITL |
| program / project / team-lead / scrum | Delivery hygiene without ritual tax |
| admin | Calendar triage + briefing packs |
| early-stage | Cheapest agent stack + hard caps + single workflow |

---

## 8. Sources (primary)

- Writer Enterprise AI Adoption 2026; Microsoft Work Trend Index 2026; AP/TNW tokenmaxxing coverage  
- Institute of AI PM / LangChain State of Agent Engineering 2026  
- Competitive synthesis in `docs/14-competitive-union-intersection.md`  
- Product Console, Dust, Lindy, Relevance AI, Zapier Agents public positioning (2026)  
- Relay.app shutdown / wind-down public notices (HITL whitespace)
