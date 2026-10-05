# 10.2 Frontier labs agent stacks — research brief (backup)

> Backup of plan §10.2 plus fetch notes. Written Aug 2026 from primary-doc curl research.
> Plan path: `~/.cursor/plans/ai_pm_agent_strategy_8926ac46.plan.md`
> Do not treat this as a product build spec.

## Plan subsection (current)

### 10.2 Frontier labs agent stacks (THERE / NOT THERE summary)

Labs sell **runtimes, models, and tool protocols** — not an AI PM operating system. Use them; don’t compete with them.

| Lab | THERE (use/partner) | NOT THERE (our whitespace) | Sources |
|---|---|---|---|
| **OpenAI** | [Agents SDK](https://openai.github.io/openai-agents-python/) + Responses API: tools, handoffs, guardrails, sessions, HITL interrupts, hosted/local **MCP**, sandbox agents, tracing/evals hooks | No org product memory / decision graph; no PM ontology (JTBD/OST/evals-as-PRD); no meeting→roadmap conductor; no fintech decision audit product | [Agents guide](https://platform.openai.com/docs/guides/agents) ([mirror](https://developers.openai.com/api/docs/guides/agents)), [MCP in SDK](https://openai.github.io/openai-agents-js/guides/mcp/), [Tools](https://platform.openai.com/docs/guides/tools) |
| **Anthropic** | Claude tool use + **Skills** (progressive expertise packs) + **MCP connector** + Computer Use (beta) + Claude Code as power-user loop | Same gaps: session/project memory ≠ cross-stack Context Lake; Skills ≠ org `.pmrules`; Computer Use is brittle/expensive for PM SoRs when APIs exist | [Skills](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview), [Tool use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview), [Computer use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool), [MCP (Anthropic)](https://docs.anthropic.com/en/docs/agents-and-tools/mcp), [MCP spec](https://modelcontextprotocol.io/), [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) |
| **Google** | [ADK](https://adk.dev/) 2.0: multi-agent, graph workflows, HITL, context management, MCP toolsets; Vertex / Gemini Enterprise Agent Platform for deploy + auth + Agent Garden | Enterprise agent platform ≠ PM craft; no Monday Morning OS; no suite-agnostic decision lake above Linear/Jira/Notion | [ADK](https://adk.dev/) / [ADK docs](https://google.github.io/adk-docs/), [ADK intro](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/), [Vertex Agent Engine](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview), [ADK on Vertex](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-development-kit/overview), [A2A](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/), [Agent Platform ADK](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/adk) |
| **Meta** | Llama Stack / Llama API: OpenAI-compatible Responses, tool calling, safety (Llama Guard), open run-anywhere contract; MCP-friendly ecosystem | Infrastructure/model layer only; no PM product surface; maturity lag vs hosted lab SDKs on some Responses features | [Llama tool calling](https://llama.developer.meta.com/docs/features/tool-calling), [Llama Stack → OGX](https://github.com/ogx-ai/ogx) (was [meta-llama/llama-stack](https://github.com/meta-llama/llama-stack)), [Llama Stack apps](https://github.com/llamastack/llama-stack-apps), [Red Hat on Llama Stack](https://www.redhat.com/en/blog/llama-stack-and-case-open-run-anywhere-contract-agents) |

**Cross-lab verdict (opinionated):** All four converged on **tools + MCP + multi-agent orchestration + short-term session memory**. None ship: durable **org decision memory**, **PM ontology**, **meetings/Slack → opportunity → spec → eval → outcome**, or **regulated write gates** as the product. That is exactly our layer.

**PM-tool overlay (labs alone miss this; suites own pieces):**
- **Productboard Spark:** strong methodology + citations *inside* Productboard; credit metering; forces PB center-of-gravity ([§4](#4-competitive-landscape--major-market-misses)).
- **Linear Agent:** strongest delivery/code agentic loop (Skills, MCP, coding sessions); weak discovery/decision audit.
- **ChatPRD:** best PLG PRD coach; shallow org memory; agentic ≈ drafting.
- **Dust / Notion Custom Agents:** best DIY org-tuned fleets; **no baked-in PM ontology**.

**Primary docs checked (curl, Aug 2026):** OpenAI Agents/SDK/Tools; Anthropic Skills / Tool use / Computer use / MCP / Claude Code; Google Vertex Agent Engine / ADK / A2A; Meta Llama Stack→OGX README. Failed/thin: `openai.com/index/new-tools-for-building-agents/` (403), `llama.meta.com/docs/llama-stack/` (404), `www.llama.com/products/llama-api/` (JS-thin).


## Catalog by lab (expanded notes from primary docs)

### OpenAI
- **Catalog:** Agents SDK (Python/JS; Swarm successor) — Agents, tools, handoffs, guardrails, sessions, HITL, tracing; Responses API; MCP support; sandbox/computer agents; tools guide (web, file, code, etc.).
- **HAVE:** Production agent primitives, multi-agent handoffs, MCP, evals/tracing hooks.
- **LACK (PM relevance):** No org product memory / decision graph; no PM ontology; no meetings→roadmap conductor; no fintech decision-audit product.
- **Sources fetched OK:** https://platform.openai.com/docs/guides/agents , https://openai.github.io/openai-agents-python/ , https://platform.openai.com/docs/guides/agents-sdk , https://platform.openai.com/docs/guides/tools
- **Failed:** https://openai.com/index/new-tools-for-building-agents/ (HTTP 403)

### Anthropic
- **Catalog:** Tool use (server tools, computer use, code execution, memory tool, etc.); **Agent Skills** (filesystem progressive disclosure expertise packs); **MCP** connector/servers; Claude Code agentic coding loop.
- **HAVE:** Strong tool + Skills + MCP composition; computer use for GUI automation; enterprise Skills packaging.
- **LACK (PM relevance):** Session/project memory ≠ cross-stack Context Lake; Skills ≠ org `.pmrules` / PM ontology; Computer Use brittle/expensive vs APIs for PM systems of record.
- **Sources fetched OK:** https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview , https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview , https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool , https://docs.anthropic.com/en/docs/agents-and-tools/mcp , https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview
- **Failed/alt:** `/computer-use/overview` 404 → use `tool-use/computer-use-tool`

### Google
- **Catalog:** **ADK** (Python/TS/Go/Java/Kotlin) — multi-agent, graph workflows, MCP tools, A2A protocol, memory/context, evaluation; **Vertex AI Agent Engine / Agent Platform** — managed runtime, sessions, memory bank, evals, sandbox code/computer use; Gemini prompting strategies.
- **HAVE:** Full build→deploy enterprise agent path; A2A interoperability; managed context/eval flywheel.
- **LACK (PM relevance):** Enterprise agent platform ≠ PM craft; no Monday Morning OS; no suite-agnostic decision lake above Linear/Jira/Notion.
- **Sources fetched OK:** https://google.github.io/adk-docs/ , https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/ , https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview , https://cloud.google.com/vertex-ai/generative-ai/docs/agent-development-kit/overview , https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/ , https://ai.google.dev/gemini-api/docs/prompting-strategies
- **Failed/alt:** old ADK blog slug 404; `prompting_strategies` underscore 404 → hyphenated URL

### Meta
- **Catalog:** Llama models + tool calling; **Llama Stack renamed/repositioned as OGX** — OpenAI-compatible agentic API server (Responses API, MCP, vector stores, Skills bundles), run-anywhere providers (Ollama/vLLM/etc.).
- **HAVE:** Open run-anywhere contract; Responses/MCP/Skills at infra layer; model/safety stack (Llama Guard — well-known public fact).
- **LACK (PM relevance):** Infrastructure/model layer only; no PM product surface; some hosted-lab SDK maturity lag on agent UX features.
- **Sources fetched OK:** https://github.com/meta-llama/llama-stack (→ OGX), https://github.com/ogx-ai/ogx README, https://www.llama.com/products/llama-api/ (HTTP 200 but content JS-thin)
- **Failed:** https://llama.meta.com/docs/llama-stack/ (404)
- **Labeled well-known fact:** Llama Guard / safety tooling exists in Meta’s open stack even when product pages are thin via curl.

## Cross-lab gaps for AI PMs (whitespace)

All four converged on **tools + MCP + multi-agent orchestration + short-term session memory**. None ship as product:

1. **Org memory** — durable cross-tool decision/context lake (not chat session memory)
2. **Meetings → roadmap** — Slack/meetings → opportunity → spec → eval → outcome conductor
3. **Fintech governance** — regulated write gates / decision audit for PM actions
4. **PM ontology** — JTBD/OST/evals-as-PRD / `.pmrules` craft layer
5. **Closed loop** — outcome feedback into next planning cycle as first-class product

## Fetch log (curl -sL -A Mozilla/5.0 --max-time 30)

| URL | Status |
|---|---|
| https://platform.openai.com/docs/guides/agents | 200 |
| https://openai.com/index/new-tools-for-building-agents/ | 403 |
| https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview | 200 |
| https://docs.anthropic.com/en/docs/agents-and-tools/computer-use/overview | 404 |
| https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool | 200 |
| https://docs.anthropic.com/en/docs/agents-and-tools/mcp | 200 |
| https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview | 200 |
| https://developers.googleblog.com/en/introducing-agent-development-kit/ | 404 |
| https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/ | 200 |
| https://ai.google.dev/gemini-api/docs/prompting_strategies | 404 |
| https://ai.google.dev/gemini-api/docs/prompting-strategies | 200 |
| https://llama.meta.com/docs/llama-stack/ | 404 |
| https://www.llama.com/products/llama-api/ | 200 (thin) |
| https://openai.github.io/openai-agents-python/ | 200 |
| https://google.github.io/adk-docs/ | 200 |
| https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/ | 200 |
| https://github.com/meta-llama/llama-stack / https://github.com/ogx-ai/ogx | 200 |

## Implication for AI PM OS thesis

Partner with lab runtimes/models/MCP; build the PM Context Lake + workflow conductor + ontology + governance above them. Do not compete with Agents SDK / ADK / Claude Skills+MCP / OGX.
