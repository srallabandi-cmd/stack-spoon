import type { ConnectorId, RoleId } from "./types";
import { getRolePack } from "./role-packs";

/** Installable addons on top of a Role Pack. */
export type AddonId =
  | "mirror"
  | "discovery"
  | "sync"
  | "drift"
  | "eval-craft"
  | "inbox-slack"
  | "overnight"
  | "crew-bridge"
  | "cost-breaker";

export type CrewSeatId =
  | "Scribe"
  | "Scout"
  | "Spec"
  | "Calendar"
  | "Mirror"
  | "Drift";

export type CrewSeat = {
  id: CrewSeatId;
  job: string;
  tools: ConnectorId[];
};

export type MirrorPolicy = {
  enabled: boolean;
  maxLoops: number;
  /** 0–1; below this, Mirror holds for human review with notes */
  minConfidence: number;
  checks: Array<"evidence" | "policy" | "cost" | "duplicate">;
};

export type PackRuntime = {
  roleId: RoleId;
  crew: CrewSeat[];
  addons: AddonId[];
  mirrorPolicy: MirrorPolicy;
  dailyProposalCap: number;
};

const DEFAULT_MIRROR: MirrorPolicy = {
  enabled: true,
  maxLoops: 2,
  minConfidence: 0.55,
  checks: ["evidence", "policy", "cost", "duplicate"],
};

const AI_PM_CREW: CrewSeat[] = [
  { id: "Scribe", job: "Turn meetings into decision + action proposals", tools: ["granola", "calendar"] },
  { id: "Scout", job: "Surface risks and themes across Slack", tools: ["slack"] },
  { id: "Spec", job: "Draft PRD slices with eval criteria stubs", tools: ["notion", "linear"] },
  { id: "Calendar", job: "Protect focus and flag low-value meetings", tools: ["calendar"] },
  { id: "Mirror", job: "Reflect and revise crew drafts before Inbox", tools: [] },
  { id: "Drift", job: "Compare predicted vs actual outcomes into Inbox", tools: ["linear", "notion"] },
];

const EARLY_CREW: CrewSeat[] = [
  { id: "Scribe", job: "Meetings → decisions and next actions", tools: ["granola", "calendar"] },
  { id: "Mirror", job: "Cheap quality gate before anything hits Inbox", tools: [] },
];

const DEFAULT_CREW: CrewSeat[] = [
  { id: "Scribe", job: "Turn notes into proposals", tools: ["granola"] },
  { id: "Scout", job: "Flag risks", tools: ["slack"] },
  { id: "Spec", job: "Draft follow-ups", tools: ["notion"] },
  { id: "Mirror", job: "Reflect before Inbox", tools: [] },
];

/** Resolve curated crew + addons for a role. No DIY canvas. */
export function resolvePackRuntime(roleId: RoleId | null): PackRuntime {
  const id = roleId ?? "ai-pm";
  const pack = getRolePack(id);

  if (id === "ai-pm") {
    return {
      roleId: id,
      crew: AI_PM_CREW,
      addons: [
        "mirror",
        "discovery",
        "sync",
        "drift",
        "eval-craft",
        "inbox-slack",
        "overnight",
        "crew-bridge",
        "cost-breaker",
      ],
      mirrorPolicy: { ...DEFAULT_MIRROR, minConfidence: 0.6 },
      dailyProposalCap: 40,
    };
  }

  if (id === "early-stage") {
    return {
      roleId: id,
      crew: EARLY_CREW,
      addons: ["mirror", "cost-breaker", "overnight", "inbox-slack"],
      mirrorPolicy: { ...DEFAULT_MIRROR, maxLoops: 1, minConfidence: 0.5 },
      dailyProposalCap: 15,
    };
  }

  const fromPack: CrewSeat[] = pack.agents.map((a) => ({
    id: (["Scribe", "Scout", "Spec", "Calendar"].includes(a.name)
      ? a.name
      : "Scribe") as CrewSeatId,
    job: a.job,
    tools: pack.connectors.slice(0, 2),
  }));

  const seats = fromPack.length > 0 ? fromPack : DEFAULT_CREW;
  if (!seats.some((s) => s.id === "Mirror")) {
    seats.push({
      id: "Mirror",
      job: "Reflect before Inbox",
      tools: [],
    });
  }

  return {
    roleId: id,
    crew: seats,
    addons: ["mirror", "cost-breaker"],
    mirrorPolicy: DEFAULT_MIRROR,
    dailyProposalCap: 25,
  };
}

export function addonLabel(id: AddonId): string {
  const labels: Record<AddonId, string> = {
    mirror: "Mirror reflection",
    discovery: "Discovery clustering",
    sync: "Sync to tickets",
    drift: "Drift outcomes",
    "eval-craft": "Eval Craft Kit",
    "inbox-slack": "Inbox in Slack",
    overnight: "Overnight Brief",
    "crew-bridge": "Cross-role Crew Bridge",
    "cost-breaker": "Cost circuit breaker",
  };
  return labels[id];
}
