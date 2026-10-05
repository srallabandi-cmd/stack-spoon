import type { Proposal, RoleId } from "./types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const SPEC_TITLES: Partial<Record<RoleId, string>> = {
  "ai-pm": "Draft eval / launch gate scaffold",
  pm: "Draft decision log update",
  program: "Draft dependency risk note",
  project: "Draft milestone follow-up",
  "team-lead": "Draft priority sync note",
  scrum: "Draft impediment follow-up",
  sales: "Draft CRM next-step update",
  marketing: "Draft campaign brief revision",
  "customer-support": "Draft escalation reply",
  "customer-success": "Draft renewal risk note",
  finance: "Draft variance close checklist",
  "legal-compliance": "Draft approve-before-send review",
  "people-ops": "Draft recruiting scorecard note",
  admin: "Draft exec briefing follow-up",
  consultant: "Draft client-safe research note",
  "software-engineer": "Draft scoped engineering ticket",
  "data-analyst": "Draft numbers-with-citations note",
  "early-stage": "Draft founder Monday action",
  design: "Draft design critique follow-up",
  "it-security": "Draft security review gate",
};

/** Lightweight local agent that turns meeting notes into Inbox proposals. */
export function extractProposals(notes: string, roleId: RoleId | null): Proposal[] {
  const text = notes.trim();
  if (!text) return [];

  const now = new Date().toISOString();
  const proposals: Proposal[] = [];
  const specTitle = (roleId && SPEC_TITLES[roleId]) || "Draft follow-up from today's notes";

  const decisionBlock = text.match(/Decisions?:([\s\S]*?)(?:Open questions?|Action items?|$)/i);
  const actionBlock = text.match(/Action items?:([\s\S]*?)$/i);
  const killLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => /kill|sunset|stop/i.test(l));

  const decisions = (decisionBlock?.[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 12);

  decisions.slice(0, 3).forEach((d, i) => {
    proposals.push({
      id: uid("dec"),
      title: i === 0 ? "Log decision for Monday brief" : `Capture decision ${i + 1}`,
      summary: d,
      source: "Meeting notes · Scribe",
      agent: "Scribe",
      status: "pending",
      createdAt: now,
    });
  });

  if (killLine) {
    proposals.push({
      id: uid("kill"),
      title: "Record why we stopped it",
      summary: killLine.replace(/^[-*•]\s*/, ""),
      source: "Meeting notes · Scout",
      agent: "Scout",
      status: "pending",
      createdAt: now,
    });
  }

  const actions = (actionBlock?.[1] ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 8);

  if (actions[0]) {
    proposals.push({
      id: uid("spec"),
      title: specTitle,
      summary:
        actions.find((a) => /eval|action|draft|follow/i.test(a)) ??
        actions[0] ??
        "Propose a lightweight follow-up from today's discussion.",
      source: "Meeting notes · Spec",
      agent: "Spec",
      status: "pending",
      createdAt: now,
    });
  }

  if (proposals.length === 0) {
    proposals.push({
      id: uid("gen"),
      title: "Summarize for Monday Morning Brief",
      summary: text.slice(0, 220) + (text.length > 220 ? "…" : ""),
      source: "Notes · Scribe",
      agent: "Scribe",
      status: "pending",
      createdAt: now,
    });
  }

  return proposals;
}
