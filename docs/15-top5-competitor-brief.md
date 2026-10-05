# Top 5 competitor briefing (Stack Spoon)

**Date:** 2026-08-07  
**Lens:** Closest products to *role → Role Pack → connect apps → HITL Inbox → Monday brief*, suite-agnostic.  
**Note:** Relay.app (HITL peer) is shutting down Aug/Sep 2026; excluded from the living top 5.

---

## Snapshot

| Rank | Product | Center of gravity | Threat to us |
|---|---|---|---|
| 1 | **Product Console** | AI-native PM workspace + Inbox | Highest for AI-PM beachhead |
| 2 | **Dust** | Multiplayer org agents + company knowledge | Highest for enterprise expansion |
| 3 | **Lindy** | Pre-built "AI employees" for SMB | Highest for early-stage / admin wedge |
| 4 | **Relevance AI** | Custom AI workforce / multi-agent ops | Highest if we look "builder-y" |
| 5 | **Zapier Agents** | Widest connectors + agent layer | Highest for "just connect my apps" buyers |

---

## 1. Product Console (productconsole.ai)

**What it is:** "Cursor for PMs." AI-native workspace with Knowledge Index, PRD editor, Composer sync, Discovery/Sync agents, HITL Inbox.

### Top features
- Knowledge Index (pgvector + hybrid retrieval over product history)
- PM-native artifact editor (Metric, Decision Log, Dependency, User Evidence, Experiment blocks)
- Composer: change scope once, propagate to tickets/roadmap/briefs with diff approval
- Agents: Discovery (feedback patterns), Sync (scope → Jira/Linear), Drift (Phase 3)
- Inbox: agents propose, PMs approve/reject
- Integrations: Jira, Linear, Notion, Figma, Mixpanel, Amplitude, PostHog, Granola; Slack coming
- ChatPRD migration path

### Similarities to Stack Spoon
- HITL Inbox as primary control surface
- Agents propose; humans approve
- Product memory / context that compounds
- Granola in the stack; Linear/Notion adjacent
- Targets PMs who drown in blank-page PRDs

### Differences
- **Forces a new workspace SoR** (write PRDs inside Product Console)
- Deep PM IDE / artifact engine; we are a **conductor** across existing tools
- No job-title Role Pack install for non-PMs
- Outcome loop (T+30/60/90 Drift) is their claimed moat; ours is Role Pack + Hub + Monday Morning for many roles
- Slack still incomplete on their side

### Our misses (vs them)
- We do not yet have a real Knowledge Index / durable decision lake
- PRD/editor craft is thinner (preview path, not a PM IDE)
- Fewer live integrations; OAuth still mocked
- No outcome-tracking / Drift agent story shipped

### Their misses (vs us)
- Suite/workspace lock-in: not "keep Linear + Notion as SoR"
- No spoon-fed Role Pack for non-tech roles (finance, support, founders)
- No MCP-hidden Connector Hub as day-0 hero
- No cost-guardrail / early-stage cheap kit narrative
- PM-only beachhead; slower path to multi-role Platform

---

## 2. Dust (dust.tt)

**What it is:** Multiplayer AI workspace for human-agent collaboration. Org knowledge + connectors + no-code agents; raised ~$40M (Axios May 2026).

### Top features
- Shared workspace for people and agents
- Semantic layer over company knowledge (Slack, Notion, Drive, Salesforce, Zendesk, GitHub, etc.)
- Multi-model (OpenAI, Anthropic, Google, Mistral)
- Dual-layer permissions (what agents can access vs who can use them)
- Enterprise: SSO/SCIM, audit logs, HIPAA-ready path, SLA marketing
- MCP tool connections for power users

### Similarities to Stack Spoon
- Connect company tools → agents that act with context
- Human-agent collaboration framing
- Suite-agnostic relative to Notion/Productboard lock-in
- Ambition to rewire work, not just chat

### Differences
- DIY agent building for "AI Operators"; we install Role Packs
- Enterprise governance theater first; we optimize for simplest path
- MCP exposed to advanced users (fragile per community reports)
- No Monday Morning Brief / PM craft / eval-as-product
- Pricing/workspace model skewed enterprise, not 1–10 startup

### Our misses
- Real multiplayer org permissions and SSO
- Breadth/depth of knowledge connectors
- Production-grade agent runtime and model switching
- Brand trust with enterprise buyers

### Their misses
- No Role Pack ontology (job title → working kit in minutes)
- Builder friction; non-tech users still assemble agents
- MCP jargon and state bugs for advanced tools
- No HITL Decision Inbox + Monday closed loop as the product spine
- Weak cost-control story for tokenmaxxing backlash era

---

## 3. Lindy (lindy.ai)

**What it is:** No-code "AI employees" for email, calendar, meetings, follow-ups, research. Strong SMB/solo adoption; ~$49.99/mo entry.

### Top features
- Pre-built agent templates (email, scheduling, meeting notes, research)
- Plain-language agent creation
- Large integration surface (thousands of apps claimed)
- Messaging-native assistant UX (text Lindy to get work done)
- Compliance marketing (SOC2, GDPR, HIPAA on higher plans)
- Fast time-to-first-win for personal admin work

### Similarities to Stack Spoon
- "Don't build agents; hire them" packaging
- Template / role-like starting points
- Connect apps, automate daily work
- Strong early-stage / founder / admin appeal

### Differences
- Personal/admin assistant, not org Context Lake or decision audit
- No HITL Inbox as the product center (more autonomous sidekick)
- No multi-role enterprise kits (consultant, bank finance, eng cost caps)
- Weak PM methodology (evals, launch gates, Monday Brief OS)
- Credits/task pricing can climb with volume

### Our misses
- Polish and speed of personal email/calendar magic
- Integration breadth for everyday admin apps
- Brand recognition in SMB "AI employee" category
- Voice / multi-channel assist patterns

### Their misses
- No suite-agnostic decision memory across product tools
- No Role Pack → Hub → Inbox → Brief path
- Not built for regulated approve-before-send workflows
- Thin for engineering cost guardrails and consulting client-safe HITL
- Easy to become another chat sidekick in the sprawl

---

## 4. Relevance AI

**What it is:** Low-code AI workforce platform for multi-agent ops (research, inbound qual, support triage, GTM). Higher ceiling than Lindy; more builder effort.

### Top features
- Multi-agent teams with roles, steps, handoffs
- Tool/API integrations for GTM and ops workflows
- Evaluations and structured agent operations
- Better for measurable process ownership than personal assist
- Team deployment / workforce framing

### Similarities to Stack Spoon
- Role-named agents and workforce metaphor
- Business workflows (sales, support, research), not just chat
- Ambition to run repeatable agent processes with ownership

### Differences
- Builder/platform DNA: design the workflow yourself
- We ship ready Role Packs + product recommendations + HITL defaults
- Less "Monday Morning OS" / Context Lake product story
- Pricing and complexity skew mid-market ops, not spoon-fed install

### Our misses
- Mature multi-agent orchestration UI
- Eval tooling for agent quality at workforce scale
- GTM-specific agent libraries already battle-tested

### Their misses
- Not simplest path for non-builders
- No Connector Hub that hides MCP
- No editorial "best products per domain" kit (Granola vs Fireflies etc.)
- Weak AI-PM craft and decision provenance story
- Easy to recreate US Bank problem: tools without structure

---

## 5. Zapier Agents (Zapier Central / Agents)

**What it is:** Agent layer on the widest app graph in software. Deterministic automation DNA with newer agent behaviors.

### Top features
- 7,000–9,000+ app connectors
- Familiar OAuth connect UX
- Agents + classic Zaps; approval steps improving post-Relay
- Lowest friction for "connect these two apps"
- Huge distribution and trust with ops buyers

### Similarities to Stack Spoon
- Connector Hub as a first-class idea
- Templates to start agents without code
- Broad role coverage by accident of integrations
- Human approval steps increasingly available

### Differences
- Generic behaviors; no Role Pack methodology or Context Lake
- Agents often feel like "triggers wearing an agent costume"
- Task-metered pricing surprises at agentic volume
- No Monday Brief / PM eval craft / bank-style governance packs

### Our misses
- Connector count and OAuth reliability
- Distribution and brand in automation category
- Years of edge-case integration maintenance

### Their misses
- No job-title → governed kit narrative
- No durable cross-stack decision memory
- Weak differentiation once every suite ships an agent
- Cost anxiety as token/task meters spike (tokenmaxxing era)
- HITL Inbox is not the hero product (automation is)

---

## Cross-cut: our open wedge (none of the five combine)

1. Job title → Role Pack install (non-tech)
2. MCP-hidden OAuth Connector Hub as day-0 surface
3. Suite-agnostic Context Lake (keep Linear/Notion/Slack as SoR)
4. Single HITL Decision Inbox + Monday Morning closed loop
5. Editorial product picks + cost guardrails (esp. early-stage + eng)
6. Predictable seat/outcome framing vs opaque credits

**Positioning line:**  
*Lindy hires a sidekick. Zapier connects apps. Dust lets operators build. Relevance builds workforces. Product Console is a new PM IDE. Stack Spoon installs a Role Pack, connects your stack, and only ships what you approve.*

---

## Watch list (not top 5 now)

| Product | Why watch |
|---|---|
| ChatPRD | PLG PRD coach; shallow memory; migration target for Product Console |
| Productboard Spark | Suite AI; credit metering; lock-in |
| Linear Agent | Delivery/code native; partner not replace |
| Notion Custom Agents | Strong inside Notion; credits; DIY |
| Glean | Enterprise search + agents; price; not execution OS |
| Relay.app | HITL pioneer; **shutting down** 2026 — orphaned buyers are a wedge |
| Fleece / Gumloop | Post-Relay HITL / visual workflow alternatives |

---

## Implications for Stack Spoon build (ties to Roles RAG plan)

1. Ship Role Packs + diagnose search so we do not look like Dust DIY or Relevance builder.
2. Keep HITL Inbox hero (Product Console parity) without forcing a PM IDE SoR.
3. Early-stage pack must beat Lindy on structure + cost caps, not on email magic.
4. Connector Hub messaging must steal Zapier's clarity while staying curated (few tools per role).
5. Explicitly message Relay refugees: approvals without rebuilding in Zapier/Make.
