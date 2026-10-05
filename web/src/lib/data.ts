import type { ConnectorId, PressureLevel, RoleId, RoleStatus } from "./types";

export type RoleGroup =
  | "Product & Delivery"
  | "GTM"
  | "Operators"
  | "Builders"
  | "Startup";

export type Role = {
  id: RoleId;
  title: string;
  blurb: string;
  status: RoleStatus;
  group: RoleGroup;
  pressure: PressureLevel;
};

export const ROLE_GROUPS: RoleGroup[] = [
  "Product & Delivery",
  "GTM",
  "Operators",
  "Builders",
  "Startup",
];

export const ROLES: Role[] = [
  {
    id: "ai-pm",
    title: "AI Product Manager",
    blurb: "Evals, launches, and Monday clarity across a sprawling AI stack.",
    status: "live",
    group: "Product & Delivery",
    pressure: "critical",
  },
  {
    id: "pm",
    title: "Product Manager",
    blurb: "Decisions, specs, and stakeholder updates without the document theater.",
    status: "preview",
    group: "Product & Delivery",
    pressure: "critical",
  },
  {
    id: "program",
    title: "Program Manager",
    blurb: "Cross-team dependencies, risks, and status that stay honest.",
    status: "preview",
    group: "Product & Delivery",
    pressure: "high",
  },
  {
    id: "project",
    title: "Project Manager",
    blurb: "Milestones, blockers, and next actions from meetings that already happened.",
    status: "preview",
    group: "Product & Delivery",
    pressure: "high",
  },
  {
    id: "team-lead",
    title: "Team Lead",
    blurb: "Priorities, 1:1s, and delivery signals for a small engineering pod.",
    status: "preview",
    group: "Product & Delivery",
    pressure: "high",
  },
  {
    id: "scrum",
    title: "Scrum Master",
    blurb: "Standups, impediments, and sprint hygiene without the ritual tax.",
    status: "preview",
    group: "Product & Delivery",
    pressure: "rising",
  },
  {
    id: "sales",
    title: "Sales",
    blurb: "Pipeline hygiene, call follow-ups, and CRM updates you still approve.",
    status: "preview",
    group: "GTM",
    pressure: "critical",
  },
  {
    id: "marketing",
    title: "Marketing",
    blurb: "Drafts, campaigns, and brand-safe review before anything goes live.",
    status: "preview",
    group: "GTM",
    pressure: "critical",
  },
  {
    id: "customer-support",
    title: "Customer Support",
    blurb: "Ticket triage and reply drafts with escalation before autonomy.",
    status: "preview",
    group: "GTM",
    pressure: "critical",
  },
  {
    id: "customer-success",
    title: "Customer Success",
    blurb: "Renewal risk, QBR prep, and account notes that do not silently rewrite CRM.",
    status: "preview",
    group: "GTM",
    pressure: "high",
  },
  {
    id: "finance",
    title: "Finance & Accounting",
    blurb: "Close checklists, variance notes, and approvals with an audit trail.",
    status: "preview",
    group: "Operators",
    pressure: "high",
  },
  {
    id: "legal-compliance",
    title: "Legal & Compliance",
    blurb: "Contract review, policy drafts, and approve-before-send guardrails.",
    status: "preview",
    group: "Operators",
    pressure: "high",
  },
  {
    id: "people-ops",
    title: "People Ops",
    blurb: "Recruiting scorecards, offer follow-ups, and privacy-aware approvals.",
    status: "preview",
    group: "Operators",
    pressure: "high",
  },
  {
    id: "admin",
    title: "Admin / Executive Support",
    blurb: "Calendar triage, follow-ups, and briefing packs that write themselves.",
    status: "preview",
    group: "Operators",
    pressure: "rising",
  },
  {
    id: "consultant",
    title: "Consultant / Strategy",
    blurb: "Research and deck agents with client-safe approvals, not firm-only RAG.",
    status: "preview",
    group: "Operators",
    pressure: "critical",
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    blurb: "Stop tokenmaxxing. Route models, cap spend, keep eval loops tight.",
    status: "preview",
    group: "Builders",
    pressure: "critical",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "Notebook and BI synthesis with citations before numbers leave the room.",
    status: "preview",
    group: "Builders",
    pressure: "high",
  },
  {
    id: "design",
    title: "Design / UX",
    blurb: "Critique loops, research synthesis, and handoff notes without silent Figma edits.",
    status: "preview",
    group: "Builders",
    pressure: "high",
  },
  {
    id: "it-security",
    title: "IT / Security",
    blurb: "Access reviews, incident drafts, and approve-before-send on anything external.",
    status: "preview",
    group: "Operators",
    pressure: "critical",
  },
  {
    id: "early-stage",
    title: "Early Stage Startup",
    blurb: "1–10 people. Cheapest agent stack, hard daily caps, approve before anything posts.",
    status: "live",
    group: "Startup",
    pressure: "critical",
  },
];

export type Connector = {
  id: ConnectorId;
  name: string;
  action: string;
  detail: string;
  preview?: boolean;
};

export const CONNECTORS: Connector[] = [
  {
    id: "slack",
    name: "Slack",
    action: "Connect Slack",
    detail: "Channels where decisions actually happen",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    action: "Connect Calendar",
    detail: "Meetings that should become memory",
  },
  {
    id: "granola",
    name: "Granola",
    action: "Connect Granola",
    detail: "Notes from calls. No re-briefing",
  },
  {
    id: "linear",
    name: "Linear",
    action: "Connect Linear",
    detail: "Tickets agents may propose, never silent-write",
  },
  {
    id: "notion",
    name: "Notion",
    action: "Connect Notion",
    detail: "Specs and decision logs you already trust",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    action: "Connect HubSpot",
    detail: "Pipeline and account notes with approve-before-write",
    preview: true,
  },
  {
    id: "github",
    name: "GitHub",
    action: "Connect GitHub",
    detail: "PRs and issues for eng cost and delivery signals",
    preview: true,
  },
];

export const SAMPLE_MEETING = `Weekly AI PM sync, Aug 4
Attendees: Maya (PM), Jordan (Eng), Priya (Design)

Decisions:
- Ship eval gate for the assistant before public beta. No launch without pass rate ≥ 85% on the golden set.
- Kill the "smart reply" experiment: users found it noisy; keep the brief generator instead.
- Move pricing page rewrite to next sprint; legal still reviewing enterprise FAQ.

Open questions:
- Do we need SOC2 language in the AI features PRD this week?
- Should Linear tickets auto-create from approved Inbox items?

Action items:
- Maya: draft Monday brief with top 3 priorities by Friday EOD
- Jordan: scaffold eval harness in the repo
- Priya: attach usability clips to the kill decision for smart reply`;

export const PACK_STEPS = [
  {
    title: "Role Pack ready",
    body: "Skills, prompts, and approve-before-send defaults installed for your role.",
  },
  {
    title: "Agents on standby",
    body: "Specialist agents will propose. You approve what ships.",
  },
  {
    title: "Connect your apps",
    body: "Next: open the Connector Hub. One click per app. No terminals.",
  },
];

export function pressureLabel(level: PressureLevel): string {
  if (level === "critical") return "Critical pressure";
  if (level === "high") return "High pressure";
  return "Rising pressure";
}
