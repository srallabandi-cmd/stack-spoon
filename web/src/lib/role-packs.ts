import type { ConnectorId, PressureLevel, RoleId } from "./types";

export type ProductTier = "free" | "cheap" | "pro";

export type RecommendedProduct = {
  job: string;
  product: string;
  why: string;
  tier: ProductTier;
};

export type CompanyBenchmark = {
  firm: string;
  whatTheyDo: string;
  gapWeFill: string;
};

export type PackAgent = {
  name: string;
  job: string;
};

export type CostBand = {
  band: "$0–50" | "$50–200" | "$200+";
  stack: string;
};

export type RolePack = {
  roleId: RoleId;
  pressure: PressureLevel;
  painPoints: string[];
  companyBenchmarks: CompanyBenchmark[];
  agents: PackAgent[];
  connectors: ConnectorId[];
  recommendedProducts: RecommendedProduct[];
  costGuardrails: string[];
  keywords: string[];
  /** Early-stage only */
  costBands?: CostBand[];
  earlyStageNote?: string;
};

const baseMeetingProducts: RecommendedProduct[] = [
  {
    job: "meeting notes",
    product: "Granola",
    why: "Bot-free notes that feed the Context Lake without killing candor.",
    tier: "pro",
  },
  {
    job: "knowledge",
    product: "Notion AI",
    why: "Decision logs and specs you already trust.",
    tier: "cheap",
  },
];

export const ROLE_PACKS: RolePack[] = [
  {
    roleId: "ai-pm",
    pressure: "critical",
    painPoints: [
      "Tool sprawl: Claude + Granola + Linear + Notion with no conductor",
      "Launch gates and eval craft live in slides, not the product",
      "Monday briefs still written by hand after a week of meetings",
    ],
    companyBenchmarks: [
      {
        firm: "Frontier labs (OpenAI, Anthropic, Google)",
        whatTheyDo: "Internal evals, model routing, cost caps before ship",
        gapWeFill: "Productize eval gates and Approve Inbox for non-lab PMs",
      },
      {
        firm: "Product Console",
        whatTheyDo: "PM workspace + Inbox",
        gapWeFill: "Role Pack install + spoon-fed Hub without switching SoR",
      },
    ],
    agents: [
      { name: "Scribe", job: "Turn meetings into decision + action proposals" },
      { name: "Scout", job: "Surface risks and open questions across Slack" },
      { name: "Spec", job: "Draft PRD slices with eval criteria stubs" },
      { name: "Calendar", job: "Protect focus and flag low-value meetings" },
    ],
    connectors: ["slack", "calendar", "granola", "linear", "notion"],
    recommendedProducts: [
      ...baseMeetingProducts,
      {
        job: "research",
        product: "Perplexity / Claude",
        why: "Source-backed competitive and customer research",
        tier: "cheap",
      },
      {
        job: "coding handoff",
        product: "Cursor + Linear",
        why: "Specs become tickets; eng keeps the coding loop",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Cap research agent runs per day until eval gate is green",
      "Approve Linear writes in Inbox; never silent ticket create",
      "Prefer one meeting-notes vendor (Granola) over bot sprawl",
    ],
    keywords: [
      "ai pm",
      "product manager",
      "evals",
      "launch",
      "prd",
      "roadmap",
      "monday brief",
      "agents",
    ],
  },
  {
    roleId: "pm",
    pressure: "critical",
    painPoints: [
      "Document theater: specs that nobody reads",
      "Stakeholder updates rebuilt from scratch every week",
      "Decisions leak in Slack and never land in a system of record",
    ],
    companyBenchmarks: [
      {
        firm: "Productboard Spark",
        whatTheyDo: "Methodology + citations inside Productboard",
        gapWeFill: "Suite-agnostic conductor with Role Pack + Approve Inbox",
      },
      {
        firm: "ChatPRD",
        whatTheyDo: "PLG PRD coaching",
        gapWeFill: "Cross-stack memory and Monday closed loop, not just drafts",
      },
    ],
    agents: [
      { name: "Scribe", job: "Capture decisions and action items from meetings" },
      { name: "Spec", job: "Draft crisp problem/solution slices" },
      { name: "Scout", job: "Cluster feedback themes for prioritization" },
    ],
    connectors: ["slack", "calendar", "granola", "linear", "notion"],
    recommendedProducts: baseMeetingProducts.concat([
      {
        job: "feedback",
        product: "BuildBetter or Zeda (partner)",
        why: "VoC clustering; Stack Spoon conducts the decision loop",
        tier: "pro",
      },
    ]),
    costGuardrails: [
      "One drafting model + one notes tool; kill duplicate seats",
      "Approve before roadmap or ticket writes",
    ],
    keywords: [
      "product manager",
      "pm",
      "prd",
      "roadmap",
      "stakeholders",
      "prioritization",
      "specs",
    ],
  },
  {
    roleId: "program",
    pressure: "high",
    painPoints: [
      "Cross-team dependencies tracked in decks, not reality",
      "Risk registers stale by Tuesday",
      "Status meetings recreate the same narrative weekly",
    ],
    companyBenchmarks: [
      {
        firm: "Large bank PMO + Copilot",
        whatTheyDo: "Status automation without dependency truth",
        gapWeFill: "Approval-gated risk proposals wired to Slack + Calendar + Linear",
      },
    ],
    agents: [
      { name: "Scout", job: "Flag dependency slips and conflicting dates" },
      { name: "Scribe", job: "Turn steering meetings into honest status" },
      { name: "Calendar", job: "Collapse redundant syncs" },
    ],
    connectors: ["slack", "calendar", "granola", "linear", "notion"],
    recommendedProducts: baseMeetingProducts,
    costGuardrails: [
      "Limit status-generation runs to once per workday",
      "Approve external stakeholder updates before send",
    ],
    keywords: [
      "program manager",
      "dependencies",
      "portfolio",
      "risk",
      "steering",
      "cross-team",
    ],
  },
  {
    roleId: "project",
    pressure: "high",
    painPoints: [
      "Milestones drift after meetings without a single owner view",
      "Blockers live in chat threads",
      "Next actions get lost between notes tools",
    ],
    companyBenchmarks: [
      {
        firm: "Linear Agent",
        whatTheyDo: "Strong delivery loop inside Linear",
        gapWeFill: "Meetings → Inbox → tickets with human approval across tools",
      },
    ],
    agents: [
      { name: "Scribe", job: "Extract milestones, blockers, owners" },
      { name: "Scout", job: "Detect stale blockers across Slack" },
    ],
    connectors: ["slack", "calendar", "granola", "linear", "notion"],
    recommendedProducts: baseMeetingProducts,
    costGuardrails: [
      "Propose tickets; never auto-assign without approval",
      "Reuse one notes connector per project",
    ],
    keywords: [
      "project manager",
      "milestones",
      "blockers",
      "gantt",
      "delivery",
      "timeline",
    ],
  },
  {
    roleId: "team-lead",
    pressure: "high",
    painPoints: [
      "1:1 notes never become coaching actions",
      "Priority thrash across Slack and standup",
      "Delivery signals buried in PR noise",
    ],
    companyBenchmarks: [
      {
        firm: "Eng orgs with Copilot only",
        whatTheyDo: "Coding help without people/ops kit",
        gapWeFill: "Lead pack: priorities + 1:1s + approve path delivery signals",
      },
    ],
    agents: [
      { name: "Calendar", job: "Protect 1:1 and focus blocks" },
      { name: "Scribe", job: "Turn 1:1s into follow-ups you approve" },
      { name: "Scout", job: "Surface delivery risk for the pod" },
    ],
    connectors: ["slack", "calendar", "granola", "linear", "github"],
    recommendedProducts: [
      ...baseMeetingProducts,
      {
        job: "coding",
        product: "Cursor + Copilot (routed)",
        why: "Team keeps coding agents; you keep cost and priority control",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Publish a team daily token budget; kill silent overages",
      "Approve any cross-team status before it ships",
    ],
    keywords: [
      "team lead",
      "engineering manager",
      "1:1",
      "pod",
      "priorities",
      "people manager",
    ],
  },
  {
    roleId: "scrum",
    pressure: "rising",
    painPoints: [
      "Standups that restate tickets without removing impediments",
      "Sprint hygiene lives in facilitator memory",
      "Retro actions evaporate",
    ],
    companyBenchmarks: [
      {
        firm: "Jira + meeting bots",
        whatTheyDo: "Capture without facilitation craft",
        gapWeFill: "Impediment Inbox with approve-before-ticket changes",
      },
    ],
    agents: [
      { name: "Scribe", job: "Capture impediments and retro actions" },
      { name: "Scout", job: "Flag aging blockers before standup" },
    ],
    connectors: ["slack", "calendar", "granola", "linear"],
    recommendedProducts: [
      {
        job: "meeting notes",
        product: "Fathom",
        why: "Cheap capture for ceremonies; upgrade to Granola later",
        tier: "free",
      },
      {
        job: "delivery",
        product: "Linear",
        why: "Sprint board agents propose; Scrum Master approves",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "No auto-move of tickets without human confirm",
      "Cap ceremony summarization to one run per meeting",
    ],
    keywords: [
      "scrum",
      "agile",
      "standup",
      "sprint",
      "retro",
      "impediment",
      "kanban",
    ],
  },
  {
    roleId: "sales",
    pressure: "critical",
    painPoints: [
      "Call notes never reach CRM cleanly",
      "Fear of agents writing wrong pipeline stages",
      "Prospecting tools multiply while follow-ups slip",
    ],
    companyBenchmarks: [
      {
        firm: "HubSpot AI / Apollo / Clay stacks",
        whatTheyDo: "Prospecting and CRM AI in silos",
        gapWeFill: "Approve before CRM writes + meeting → next-step Inbox",
      },
    ],
    agents: [
      { name: "Scribe", job: "Turn calls into CRM field proposals" },
      { name: "Scout", job: "Flag stale deals and missing next steps" },
      { name: "Calendar", job: "Protect selling time vs internal syncs" },
    ],
    connectors: ["slack", "calendar", "granola", "hubspot", "notion"],
    recommendedProducts: [
      {
        job: "meeting notes (CRM)",
        product: "Fireflies",
        why: "CRM push for AE call workflows",
        tier: "pro",
      },
      {
        job: "pipeline",
        product: "HubSpot AI",
        why: "Pipeline AI with Stack Spoon approve-before-write",
        tier: "pro",
      },
      {
        job: "prospecting",
        product: "Apollo or Clay",
        why: "Outbound enrichment; keep Approval on messaging",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Never auto-update deal stage without AE approval",
      "Cap outbound sequence AI until reply-rate baseline exists",
      "One CRM AI seat per AE before adding enrichment tools",
    ],
    keywords: [
      "sales",
      "sdr",
      "ae",
      "pipeline",
      "crm",
      "quota",
      "outbound",
      "revops",
      "deals",
    ],
  },
  {
    roleId: "marketing",
    pressure: "critical",
    painPoints: [
      "Draft flood without brand review",
      "Campaign briefs rebuilt from Slack threads",
      "Attribution noise drives tool FOMO buys",
    ],
    companyBenchmarks: [
      {
        firm: "Jasper + Canva + ChatGPT stacks",
        whatTheyDo: "Content velocity without governance pack",
        gapWeFill: "Brand-safe Approve before publish + campaign decision lake",
      },
    ],
    agents: [
      { name: "Spec", job: "Draft campaign briefs and messaging variants" },
      { name: "Scribe", job: "Capture creative reviews into decisions" },
      { name: "Scout", job: "Flag brand-risk language before publish" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "drafting",
        product: "Claude / ChatGPT",
        why: "Long-form drafts with human brand edit",
        tier: "cheap",
      },
      {
        job: "visual",
        product: "Canva",
        why: "Fast creative without a full design suite day one",
        tier: "cheap",
      },
      {
        job: "brand copy",
        product: "Jasper",
        why: "Brand voice templates when volume requires it",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Approve all external publish from Inbox",
      "One drafting seat + one design seat before adding brand AI",
      "Kill unused image-gen subscriptions monthly",
    ],
    keywords: [
      "marketing",
      "content",
      "campaign",
      "brand",
      "copy",
      "demand gen",
      "social",
    ],
  },
  {
    roleId: "customer-support",
    pressure: "critical",
    painPoints: [
      "Autopilot replies erode trust",
      "Escalation paths unclear when AI is wrong",
      "Macros and helpdesk AI stall in pilot hell",
    ],
    companyBenchmarks: [
      {
        firm: "Intercom Fin / Zendesk AI",
        whatTheyDo: "Helpdesk deflection at scale",
        gapWeFill: "Escalation approvals + Role Pack so pilots reach production",
      },
    ],
    agents: [
      { name: "Scribe", job: "Draft replies with citation to macros/docs" },
      { name: "Scout", job: "Cluster recurring defects for product" },
    ],
    connectors: ["slack", "calendar", "notion", "linear"],
    recommendedProducts: [
      {
        job: "helpdesk AI",
        product: "Intercom Fin or Zendesk AI",
        why: "Deflection with clear escalate-to-human path",
        tier: "pro",
      },
      {
        job: "knowledge",
        product: "Notion AI",
        why: "Macro and policy source of truth",
        tier: "cheap",
      },
    ],
    costGuardrails: [
      "Approval on first contact for VIP and billing topics",
      "No full autonomy until escalation SLA is green for 2 weeks",
      "Cap bot deflection experiments with a kill switch",
    ],
    keywords: [
      "support",
      "customer support",
      "helpdesk",
      "tickets",
      "contact center",
      "cx",
      "zendesk",
      "intercom",
    ],
  },
  {
    roleId: "customer-success",
    pressure: "high",
    painPoints: [
      "Renewal risk spotted too late",
      "QBR decks rebuilt from scratch",
      "Account notes diverge from CRM truth",
    ],
    companyBenchmarks: [
      {
        firm: "CRM CS AI modules",
        whatTheyDo: "Health scores without decision Inbox",
        gapWeFill: "QBR + risk proposals with approve-before-CRM-write",
      },
    ],
    agents: [
      { name: "Scout", job: "Flag renewal risk from Slack + call notes" },
      { name: "Scribe", job: "Draft QBR outlines from meetings" },
      { name: "Spec", job: "Propose success plan updates" },
    ],
    connectors: ["slack", "calendar", "granola", "hubspot", "notion"],
    recommendedProducts: [
      {
        job: "meeting notes",
        product: "Granola",
        why: "Bot-free customer calls",
        tier: "pro",
      },
      {
        job: "CRM",
        product: "HubSpot AI",
        why: "Account context with approved writes",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Approve health-score changes before exec visibility",
      "One QBR generation run per account per quarter cycle",
    ],
    keywords: [
      "customer success",
      "csm",
      "renewal",
      "qbr",
      "churn",
      "account",
      "onboarding",
    ],
  },
  {
    roleId: "finance",
    pressure: "high",
    painPoints: [
      "Close checklists live in email",
      "Variance notes lack audit trail",
      "Sheet copilots invent numbers without review",
    ],
    companyBenchmarks: [
      {
        firm: "Banks (JPMC Fence, BofA)",
        whatTheyDo: "Governance automation and guardrails at scale",
        gapWeFill: "Mid-market close kits with approve-before-send audit trail",
      },
    ],
    agents: [
      { name: "Scribe", job: "Turn close meetings into checklist updates" },
      { name: "Scout", job: "Flag variance outliers for review" },
      { name: "Spec", job: "Draft variance commentary with sources" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "spreadsheets",
        product: "Copilot or Gemini in Sheets",
        why: "Assist formulas; humans own the numbers",
        tier: "pro",
      },
      {
        job: "meeting notes",
        product: "Granola",
        why: "Close call decisions with provenance",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Approve every external number before it leaves Finance",
      "No autonomous email to auditors or board",
      "Log model + prompt version on variance drafts",
    ],
    keywords: [
      "finance",
      "fp&a",
      "accounting",
      "close",
      "variance",
      "audit",
      "budget",
      "forecast",
    ],
  },
  {
    roleId: "legal-compliance",
    pressure: "high",
    painPoints: [
      "Long contracts overwhelm review bandwidth",
      "Policy drafts circulate without version control",
      "Fear of agents sending advice externally",
    ],
    companyBenchmarks: [
      {
        firm: "Banking risk + Fence-style guardrails",
        whatTheyDo: "Policy automation with hard send blocks",
        gapWeFill: "Contract/review kits with approve-before-send for mid-market",
      },
    ],
    agents: [
      { name: "Spec", job: "Draft redlines and issue lists for counsel review" },
      { name: "Scribe", job: "Capture negotiation decisions" },
      { name: "Scout", job: "Flag missing clauses against playbooks" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "long-context review",
        product: "Claude",
        why: "Long contracts with human counsel in the loop",
        tier: "pro",
      },
      {
        job: "contract tool",
        product: "goHeather-class contract AI",
        why: "Structured clause review; Stack Spoon owns approve-before-send gate",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Approve-before-send on every external legal communication",
      "Never auto-accept counterpart redlines",
      "Keep privileged docs out of consumer free tiers",
    ],
    keywords: [
      "legal",
      "compliance",
      "contract",
      "policy",
      "risk",
      "counsel",
      "gdpr",
      "soc2",
    ],
  },
  {
    roleId: "people-ops",
    pressure: "high",
    painPoints: [
      "Scorecards drift across interviewers",
      "Candidate privacy vs AI note tools",
      "Offer follow-ups fall through calendar cracks",
    ],
    companyBenchmarks: [
      {
        firm: "ATS AI add-ons",
        whatTheyDo: "Resume screening without a privacy-aware approval pack",
        gapWeFill: "Scorecard + follow-up Inbox with privacy guardrails",
      },
    ],
    agents: [
      { name: "Scribe", job: "Normalize interview notes into scorecard drafts" },
      { name: "Calendar", job: "Keep interview loops and offer deadlines honest" },
      { name: "Scout", job: "Flag missing interviewer feedback" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "meeting notes",
        product: "Granola",
        why: "Interview notes without bot join when possible",
        tier: "pro",
      },
      {
        job: "knowledge",
        product: "Notion AI",
        why: "Rubrics and offer templates with approval",
        tier: "cheap",
      },
    ],
    costGuardrails: [
      "No autonomous candidate emails",
      "Strip sensitive fields before any model call when possible",
      "Human approve scorecard writes to ATS",
    ],
    keywords: [
      "people ops",
      "hr",
      "recruiting",
      "talent",
      "interview",
      "hiring",
      "people",
      "hrbp",
    ],
  },
  {
    roleId: "admin",
    pressure: "rising",
    painPoints: [
      "Calendar triage eats the day",
      "Briefing packs assembled at midnight",
      "Follow-ups depend on memory",
    ],
    companyBenchmarks: [
      {
        firm: "Lindy / personal assistants",
        whatTheyDo: "Multi-channel personal automation",
        gapWeFill: "Exec support pack tied to org decision lake + Hub",
      },
    ],
    agents: [
      { name: "Calendar", job: "Triage and propose schedule changes" },
      { name: "Scribe", job: "Build briefing packs from notes" },
      { name: "Scout", job: "Chase open follow-ups" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "meeting notes",
        product: "Granola",
        why: "Clean exec notes without bot theater",
        tier: "pro",
      },
      {
        job: "personal automation",
        product: "Lindy (adjacent)",
        why: "Channel chores; Stack Spoon owns org briefs + approve path",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Approve external invites and declines",
      "One assistant platform; avoid duplicate personal-agent seats",
    ],
    keywords: [
      "admin",
      "executive assistant",
      "chief of staff",
      "calendar",
      "briefing",
      "ea",
      "exec support",
    ],
  },
  {
    roleId: "consultant",
    pressure: "critical",
    painPoints: [
      "Agent armies threaten fee models without client-safe approvals",
      "Research + deck work recreates Lilli/Sage privately",
      "Client data leakage risk across consumer tools",
    ],
    companyBenchmarks: [
      {
        firm: "McKinsey Lilli (~25k agents)",
        whatTheyDo: "Firm knowledge RAG + agent army",
        gapWeFill: "Reusable Role Pack + Approve Inbox for firms without Lilli",
      },
      {
        firm: "BCG / Bain Sage + OpenAI",
        whatTheyDo: "Research and deck agents for billable work",
        gapWeFill: "Client-safe approvals and pack install for mid-market consultancies",
      },
    ],
    agents: [
      { name: "Scout", job: "Research packs with source list for partner review" },
      { name: "Spec", job: "Draft slide outlines and exhibit stubs" },
      { name: "Scribe", job: "Turn client workshops into decision logs" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "research",
        product: "Perplexity / Claude",
        why: "Source-backed research before partner edit",
        tier: "cheap",
      },
      {
        job: "meeting notes",
        product: "Granola",
        why: "Client workshops without bot join when trust matters",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Client-safe mode: approve every external artifact",
      "Cap research agent spend per engagement week",
      "No consumer free tiers for client-confidential docs",
    ],
    keywords: [
      "consultant",
      "consulting",
      "strategy",
      "mckinsey",
      "bcg",
      "bain",
      "deck",
      "engagement",
      "partner",
    ],
  },
  {
    roleId: "software-engineer",
    pressure: "critical",
    painPoints: [
      "Tokenmaxxing burns annual budgets by Q2",
      "Copilot + Claude Code + Cursor with no routing policy",
      "Evals and circuit breakers missing outside frontier labs",
    ],
    companyBenchmarks: [
      {
        firm: "OpenAI / Anthropic / Meta eng",
        whatTheyDo: "Internal evals, model routing, cost caps",
        gapWeFill: "Same habits as a Role Pack for everyone else",
      },
      {
        firm: "Uber / Microsoft / Atlassian / Citi (token caps)",
        whatTheyDo: "Reactive throttles after overspend",
        gapWeFill: "Proactive daily caps + routing before the fire drill",
      },
    ],
    agents: [
      { name: "Scout", job: "Flag spend spikes and duplicate tool seats" },
      { name: "Spec", job: "Draft eval harness checklists for features" },
      { name: "Scribe", job: "Turn design reviews into actionable tickets" },
    ],
    connectors: ["slack", "calendar", "linear", "github", "notion"],
    recommendedProducts: [
      {
        job: "coding",
        product: "Cursor + Claude Code / Copilot",
        why: "Route by task cost: cheap model for boilerplate, strong model for hard bugs",
        tier: "pro",
      },
      {
        job: "delivery",
        product: "Linear + GitHub",
        why: "PR and issue signals without silent merges",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Set a daily $ cap per engineer; hard stop at 80% with alert",
      "Route: Flash-Lite / mini for tests; frontier only for hard tasks",
      "One primary IDE agent; delete idle second seats monthly",
      "Circuit breaker: pause agents if eval suite fails",
    ],
    keywords: [
      "software engineer",
      "developer",
      "engineering",
      "coding",
      "copilot",
      "cursor",
      "tokens",
      "claude code",
      "sre",
      "ai engineer",
    ],
  },
  {
    roleId: "data-analyst",
    pressure: "high",
    painPoints: [
      "Notebook and BI agents invent metrics",
      "Stakeholder questions recreate the same SQL",
      "Citations missing when numbers leave the room",
    ],
    companyBenchmarks: [
      {
        firm: "Enterprise BI copilots",
        whatTheyDo: "Chat-to-SQL without analyst approval",
        gapWeFill: "Citation-required proposals before exec distribution",
      },
    ],
    agents: [
      { name: "Scout", job: "Detect metric definition conflicts" },
      { name: "Spec", job: "Draft analysis plans with data sources" },
      { name: "Scribe", job: "Turn analytics reviews into decisions" },
    ],
    connectors: ["slack", "calendar", "granola", "notion", "github"],
    recommendedProducts: [
      {
        job: "research",
        product: "Claude / Perplexity",
        why: "Long-doc and source-backed synthesis",
        tier: "cheap",
      },
      {
        job: "spreadsheets",
        product: "Gemini or Copilot in Sheets",
        why: "Assist transforms; analyst owns definitions",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "No number leaves Inbox without source citation",
      "Cap exploratory agent SQL until warehouse cost alert is wired",
    ],
    keywords: [
      "data analyst",
      "analytics",
      "sql",
      "bi",
      "metrics",
      "dashboard",
      "analytics engineer",
      "warehouse",
    ],
  },
  {
    roleId: "early-stage",
    pressure: "critical",
    painPoints: [
      "Bought a $99–999/mo multi-agent platform before a single reliable workflow",
      "Meetings and Slack are the whole company OS",
      "No structure: tools multiply, decisions do not",
      "Token and SaaS bills spike with headcount still under 10",
    ],
    companyBenchmarks: [
      {
        firm: "Relay.app (shutting down)",
        whatTheyDo: "Approval checkpoints + fast small-team onboarding",
        gapWeFill: "Role Pack + Hub + Inbox whitespace they leave behind",
      },
      {
        firm: "Zapier Agents / Lindy",
        whatTheyDo: "Templates and connectors without cost-first founder kit",
        gapWeFill: "Cheapest stack bands + daily caps + single-workflow-first",
      },
    ],
    agents: [
      { name: "Scribe", job: "Meetings → decisions and next actions" },
      { name: "Calendar", job: "Protect founder focus blocks" },
      { name: "Scout", job: "One daily risk digest, not an agent army" },
    ],
    connectors: ["slack", "calendar", "granola", "notion"],
    recommendedProducts: [
      {
        job: "meeting notes (budget)",
        product: "Fathom",
        why: "Free-first capture; upgrade to Granola when notes become the lake",
        tier: "free",
      },
      {
        job: "meeting notes (upgrade)",
        product: "Granola",
        why: "Bot-free notes when you can afford one quality seat",
        tier: "pro",
      },
      {
        job: "automation",
        product: "n8n or Make",
        why: "Cheap workflows; avoid multi-agent platforms early",
        tier: "cheap",
      },
      {
        job: "models",
        product: "Gemini Flash-Lite / gpt-4o-mini routing",
        why: "Route cheap by default; spend frontier only on hard tasks",
        tier: "cheap",
      },
      {
        job: "knowledge",
        product: "Notion AI",
        why: "One doc home for decisions",
        tier: "cheap",
      },
    ],
    costGuardrails: [
      "Daily $ cap on model spend before any autonomy",
      "Approve before send, ticket create, or CRM write",
      "Single-workflow-first: meetings → Inbox → Monday brief",
      "Do not buy multi-agent platforms yet",
      "Fathom → Granola only when notes quality blocks decisions",
      "Review SaaS seats every Friday; kill idle tools",
    ],
    keywords: [
      "founder",
      "startup",
      "early stage",
      "series a",
      "seed",
      "smb",
      "small business",
      "bootstrapped",
      "1-10",
      "solo",
      "cofounder",
      "cheap",
      "budget",
    ],
    costBands: [
      {
        band: "$0–50",
        stack: "Fathom free, Flash-Lite / free tiers, n8n self-host or Make free, Slack + Calendar only",
      },
      {
        band: "$50–200",
        stack: "Granola or one paid seat, cheap model routing, one workflow (meetings → Inbox → Monday brief)",
      },
      {
        band: "$200+",
        stack: "Add Linear/Notion + one domain tool; still no multi-agent platforms",
      },
    ],
    earlyStageNote:
      "Do not buy multi-agent platforms yet. Install one Role Pack, connect Slack and Calendar, and earn autonomy by approving before anything posts.",
  },
  {
    roleId: "design",
    pressure: "high",
    painPoints: [
      "Critique feedback scatters across Figma comments, Slack, and decks",
      "Research insights never reach the Monday brief",
      "Handoffs to eng lose acceptance criteria",
    ],
    companyBenchmarks: [
      {
        firm: "Figma AI / suite agents",
        whatTheyDo: "In-canvas assists",
        gapWeFill: "Cross-stack conductor + HITL before anything ships to eng",
      },
    ],
    agents: [
      { name: "Scribe", job: "Critique sessions → decision and follow-up proposals" },
      { name: "Scout", job: "Cluster research themes from Slack and notes" },
      { name: "Spec", job: "Draft handoff notes with acceptance criteria" },
    ],
    connectors: ["slack", "calendar", "granola", "notion", "linear"],
    recommendedProducts: [
      ...baseMeetingProducts,
      {
        job: "design",
        product: "Figma",
        why: "Keep design SoR; Stack Spoon conducts decisions around it",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Approve eng handoffs in Inbox",
      "No silent Figma or Linear writes",
    ],
    keywords: ["design", "ux", "ui", "figma", "critique", "research", "handoff"],
  },
  {
    roleId: "it-security",
    pressure: "critical",
    painPoints: [
      "Access reviews stall in spreadsheets",
      "Incident notes lack an approve-before-send gate",
      "Policy drafts leak before legal/security sign-off",
    ],
    companyBenchmarks: [
      {
        firm: "Enterprise ITSM + SIEM suites",
        whatTheyDo: "Tickets and alerts",
        gapWeFill: "HITL Decision Inbox + audit-friendly why-not lake",
      },
    ],
    agents: [
      { name: "Scribe", job: "Incidents and reviews → gated action proposals" },
      { name: "Scout", job: "Flag risky access or policy drift" },
      { name: "Spec", job: "Draft remediation tickets with evidence" },
    ],
    connectors: ["slack", "calendar", "notion", "linear", "github"],
    recommendedProducts: [
      {
        job: "knowledge",
        product: "Notion",
        why: "Policy and runbook SoR with approve-before-send",
        tier: "cheap",
      },
      {
        job: "tickets",
        product: "Linear / Jira",
        why: "Remediation work you still approve",
        tier: "pro",
      },
    ],
    costGuardrails: [
      "Every external send requires Inbox approve",
      "Log why-not rejections in Context Lake",
    ],
    keywords: [
      "security",
      "it",
      "access",
      "incident",
      "compliance",
      "soc",
      "policy",
    ],
  },
];

export const ROLE_PACK_BY_ID: Record<RoleId, RolePack> = ROLE_PACKS.reduce(
  (acc, pack) => {
    acc[pack.roleId] = pack;
    return acc;
  },
  {} as Record<RoleId, RolePack>
);

export function getRolePack(roleId: RoleId | null | undefined): RolePack {
  if (roleId && ROLE_PACK_BY_ID[roleId]) return ROLE_PACK_BY_ID[roleId];
  return ROLE_PACK_BY_ID["ai-pm"];
}

export function scoreRolePacks(query: string): { pack: RolePack; score: number }[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9+&/-]+/)
    .filter((t) => t.length > 1);

  return ROLE_PACKS.map((pack) => {
    let score = 0;
    const hay = [
      pack.roleId,
      ...pack.keywords,
      ...pack.painPoints,
      ...pack.agents.map((a) => a.job),
      ...pack.recommendedProducts.map((p) => `${p.job} ${p.product}`),
    ]
      .join(" ")
      .toLowerCase();

    for (const token of tokens) {
      if (hay.includes(token)) score += 2;
      if (pack.keywords.some((k) => k.includes(token) || token.includes(k))) {
        score += 3;
      }
    }

    // Light phrase bonuses
    if (/founder|seed|series a|bootstrapp|early stage|1-10|startup/.test(query.toLowerCase())) {
      if (pack.roleId === "early-stage") score += 8;
    }
    if (/engineer|developer|coding|copilot|cursor|token/.test(query.toLowerCase())) {
      if (pack.roleId === "software-engineer") score += 6;
    }
    if (/support|zendesk|intercom|ticket/.test(query.toLowerCase())) {
      if (pack.roleId === "customer-support") score += 6;
    }
    if (/sales|sdr|pipeline|quota/.test(query.toLowerCase())) {
      if (pack.roleId === "sales") score += 6;
    }
    if (/design|ux|figma|critique/.test(query.toLowerCase())) {
      if (pack.roleId === "design") score += 6;
    }
    if (/security|soc|incident|access review|it ops/.test(query.toLowerCase())) {
      if (pack.roleId === "it-security") score += 6;
    }

    return { pack, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
