import type { WorkspaceState } from "./types";

export const defaultConnectors: WorkspaceState["connectors"] = {
  slack: "idle",
  calendar: "idle",
  granola: "idle",
  linear: "idle",
  notion: "idle",
  hubspot: "idle",
  github: "idle",
};

export const emptyWorkspace = (): WorkspaceState => ({
  roleId: null,
  packInstalled: false,
  connectors: { ...defaultConnectors },
  proposals: [],
  briefReady: false,
  meetingNotes: "",
  lake: [],
  writebacks: [],
  enabledAddons: [],
  overnightDigest: false,
});
