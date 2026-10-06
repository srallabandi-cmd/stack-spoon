export type RoleId =
  | "ai-pm"
  | "pm"
  | "program"
  | "project"
  | "team-lead"
  | "scrum"
  | "finance"
  | "admin"
  | "early-stage"
  | "software-engineer"
  | "sales"
  | "marketing"
  | "customer-support"
  | "consultant"
  | "legal-compliance"
  | "people-ops"
  | "customer-success"
  | "data-analyst"
  | "design"
  | "it-security";

export type RoleStatus = "live" | "preview";

export type PressureLevel = "critical" | "high" | "rising";

export type ConnectorId =
  | "slack"
  | "calendar"
  | "granola"
  | "linear"
  | "notion"
  | "hubspot"
  | "github";

export type ConnectorStatus = "idle" | "connecting" | "connected";

export type ProposalStatus = "pending" | "approved" | "edited" | "rejected";

export type ProposalAgent =
  | "Scribe"
  | "Scout"
  | "Spec"
  | "Calendar"
  | "Mirror"
  | "Drift";

export type ProposalEvidence = {
  quote: string;
  sourceId?: string;
};

export type WritebackTarget = "linear" | "notion" | "slack";

export type WritebackRecord = {
  id: string;
  proposalId: string;
  target: WritebackTarget;
  status: "queued" | "paused" | "created" | "failed" | "demo_created";
  externalRef?: string;
  createdAt: string;
};

export type LakeEntryKind =
  | "decision"
  | "why-not"
  | "proposal"
  | "writeback"
  | "drift"
  | "brief";

export type LakeEntry = {
  id: string;
  kind: LakeEntryKind;
  title: string;
  body: string;
  roleId?: RoleId;
  proposalId?: string;
  provenance?: string[];
  createdAt: string;
};

export type Proposal = {
  id: string;
  title: string;
  summary: string;
  source: string;
  agent: ProposalAgent;
  status: ProposalStatus;
  createdAt: string;
  confidence?: number;
  reflectionNotes?: string;
  evidence?: ProposalEvidence[];
  writeback?: WritebackRecord;
  /** Cross-role bridge target */
  bridgeRoleId?: RoleId;
};

export type WorkspaceState = {
  roleId: RoleId | null;
  packInstalled: boolean;
  connectors: Record<ConnectorId, ConnectorStatus>;
  proposals: Proposal[];
  briefReady: boolean;
  meetingNotes: string;
  lake: LakeEntry[];
  writebacks: WritebackRecord[];
  enabledAddons: string[];
  overnightDigest: boolean;
  lastProposeMode?: string;
};
