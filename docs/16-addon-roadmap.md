# Stack Spoon — Addon & Feature Roadmap

**Date:** 2026-08-08  
**North star:** Role → Pack → Hub → Approve Inbox → Monday Brief. Suite-agnostic conductor. Not a PM IDE. Not an agent canvas.

## Research refresh

| Source | Copy | Enhance |
|---|---|---|
| Product Console | Knowledge Index, Discovery/Sync, Drift, Inbox | Keep SoR external; Lake stores decisions + provenance |
| Specky | Product Graph, evidence cites, overnight Inbox | Role ontology + cost caps; hide MCP from customers |
| Liminal / CopilotKit Slack | Cross-app agent + Slack approve | Inbox-in-Slack as first write gate |
| Relay shutdown | HITL pause, Slack approve | Relay Refuge Kit (15-min pack, no canvas) |
| Reflexion practice | Actor → Evaluator → Reflector | Productize as **Mirror** pack addon |
| Dust / Relevance | Multi-agent ops | Curated Pack Crews only |

**Whitespace we own together:** job-title Role Pack + MCP-hidden Hub + suite-agnostic Context Lake + HITL Inbox + Monday loop + cost guardrails + visible reflection.

## Pack machinery

### Pack Crew seats

| Seat | Job |
|---|---|
| Scribe | Meetings/notes → proposals |
| Scout | Theme / signal clustering |
| Spec | PRD/ticket draft with citations |
| Calendar | Focus / conflict proposals |
| Mirror | Reflects on crew drafts before Inbox |
| Drift | Outcome check vs predicted (AI-PM+) |

**Rules:** one fixed crew per pack. Early-stage = Scribe + Mirror + Brief. AI-PM = full crew.

### Mirror (reflection)

1. Actor drafts  
2. Evaluator scores (evidence, policy, cost/risk, duplicate)  
3. Reflector critiques → Actor revises (max 2 loops)  
4. Lands in Inbox with `reflectionNotes` + confidence  

## Addon catalog

### Tier A — Credible spine
1. Live Connector Hub (role-filtered, no MCP jargon)  
2. LLM Proposal Engine (`/api/propose`) with citations  
3. Context Lake v0 (decisions, why-not, provenance)  
4. Approve → write-back (Linear / Notion / Slack drafts)

### Tier B — Competitive parity
5. Discovery · 6. Sync · 7. Evidence Cite · 8. Inbox-in-Slack  
9. Relay Refuge Pack · 10. Cost Circuit Breaker  

### Tier C — Differentiation
11. Mirror · 12. Crew Orchestrator · 13. Drift · 14. Eval Craft Kit · 15. Cross-role Crew Bridge  

### Tier D — Expansion
16. New packs (Design, IT/Security, …) · 17. Overnight Brief · 18. Seat pricing · 19. Audit Pack · 20. HubSpot/GitHub live  

## Ship phases

**Phase 1:** OAuth spine (demo-honest until keys exist), `/api/propose` + Mirror (`gemini-3.1-flash-lite`), Lake v0, Linear write-back queue.  
**Phase 2:** Pack Crew, Discovery/Sync toggles, Slack Inbox preview, Relay Refuge, cost breaker.  
**Phase 3:** Drift, Eval Craft, cross-role bridge, Design + IT/Security packs, overnight digest.

## Non-goals

No open multi-agent canvas · No Stack Spoon as PRD SoR · No MCP in customer UI · No 50-connector chase · No agent army on early-stage.

## Research backlog

Relay refugee interviews · Specky vs Product Console teardown · credit-fatigue sampling · seat vs outcome pricing · Mirror false-hold vs false-pass trust.
