"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { extractProposals } from "./extract";
import { resolvePackRuntime } from "./pack-schema";
import type {
  ConnectorId,
  LakeEntry,
  Proposal,
  ProposalStatus,
  RoleId,
  WorkspaceState,
  WritebackRecord,
} from "./types";
import { resolveWritebackResult, writebackNote } from "./writeback-result";
import { defaultConnectors, emptyWorkspace } from "./workspace-default";

const STORAGE_KEY = "stack-spoon-workspace-v2";

const VALID_ROLES = new Set<RoleId>([
  "ai-pm",
  "pm",
  "program",
  "project",
  "team-lead",
  "scrum",
  "finance",
  "admin",
  "early-stage",
  "software-engineer",
  "sales",
  "marketing",
  "customer-support",
  "consultant",
  "legal-compliance",
  "people-ops",
  "customer-success",
  "data-analyst",
  "design",
  "it-security",
]);

const initialState: WorkspaceState = emptyWorkspace();

function migrateRoleId(raw: unknown): RoleId | null {
  if (raw === "smb") return "early-stage";
  if (typeof raw === "string" && VALID_ROLES.has(raw as RoleId)) {
    return raw as RoleId;
  }
  return null;
}

function hydrateState(parsed: Partial<WorkspaceState> & { roleId?: unknown }): WorkspaceState {
  const roleId = migrateRoleId(parsed.roleId);
  const runtime = resolvePackRuntime(roleId);
  return {
    ...initialState,
    ...parsed,
    roleId,
    connectors: {
      ...defaultConnectors,
      ...(parsed.connectors ?? {}),
    },
    lake: parsed.lake ?? [],
    writebacks: parsed.writebacks ?? [],
    enabledAddons: parsed.enabledAddons?.length
      ? parsed.enabledAddons
      : runtime.addons,
    overnightDigest: Boolean(parsed.overnightDigest),
  };
}

function lakeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type Store = WorkspaceState & {
  hydrated: boolean;
  proposing: boolean;
  proposeError: string | null;
  selectRole: (id: RoleId) => void;
  installPack: () => void;
  connectApp: (id: ConnectorId) => Promise<void>;
  setMeetingNotes: (notes: string) => void;
  runScribe: (notesOverride?: string) => Promise<void>;
  setProposalStatus: (id: string, status: ProposalStatus, summary?: string) => Promise<void>;
  markBriefReady: () => void;
  resetWorkspace: () => void;
  toggleAddon: (id: string) => void;
  setOvernightDigest: (on: boolean) => void;
  spawnCrewBridge: (proposalId: string) => void;
  connectedCount: number;
  sessionEmail: string | null;
  liveSlack: boolean;
  liveLinear: boolean;
};

const Ctx = createContext<Store | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [proposeError, setProposeError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [liveSlack, setLiveSlack] = useState(false);
  const [liveLinear, setLiveLinear] = useState(false);
  const signedIn = useRef(false);

  useEffect(() => {
    if (window.location.pathname.startsWith("/sample")) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        if (me.ok) {
          const data = await me.json();
          if (!cancelled) {
            setSessionEmail(data.user?.email ?? null);
            signedIn.current = true;
          }
          const [ws, status] = await Promise.all([
            fetch("/api/workspace"),
            fetch("/api/connectors/status"),
          ]);
          if (status.ok) {
            const live = await status.json();
            if (!cancelled) {
              setLiveSlack(Boolean(live.slack));
              setLiveLinear(Boolean(live.linear));
            }
          }
          if (ws.ok) {
            const payload = await ws.json();
            if (payload.state && !cancelled) {
              setState(hydrateState(payload.state));
              setHydrated(true);
              return;
            }
          }
        }
      } catch {
        /* fall through to localStorage */
      }
      try {
        const raw =
          localStorage.getItem(STORAGE_KEY) ??
          localStorage.getItem("stack-spoon-workspace-v1");
        if (raw && !cancelled) setState(hydrateState(JSON.parse(raw)));
      } catch {
        /* ignore */
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (window.location.pathname.startsWith("/sample")) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!signedIn.current) return;
    const t = window.setTimeout(() => {
      fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }).catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(t);
  }, [state, hydrated]);

  const selectRole = useCallback((id: RoleId) => {
    const runtime = resolvePackRuntime(id);
    setState((s) => ({
      ...s,
      roleId: id,
      packInstalled: s.roleId === id ? s.packInstalled : false,
      enabledAddons: runtime.addons,
    }));
  }, []);

  const installPack = useCallback(() => {
    setState((s) => {
      const runtime = resolvePackRuntime(s.roleId);
      const entry: LakeEntry = {
        id: lakeId("lake"),
        kind: "decision",
        title: `Installed ${s.roleId} Role Pack`,
        body: `Crew: ${runtime.crew.map((c) => c.id).join(", ")}. Addons: ${runtime.addons.join(", ")}.`,
        roleId: s.roleId ?? undefined,
        createdAt: new Date().toISOString(),
      };
      return {
        ...s,
        packInstalled: true,
        enabledAddons: runtime.addons,
        lake: [entry, ...s.lake],
      };
    });
  }, []);

  const connectApp = useCallback(async (id: ConnectorId) => {
    if ((id === "slack" && liveSlack) || (id === "linear" && liveLinear)) {
      window.location.href = `/api/connectors/${id}/authorize`;
      return;
    }
    setState((s) => ({
      ...s,
      connectors: { ...s.connectors, [id]: "connecting" },
    }));
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
    setState((s) => ({
      ...s,
      connectors: { ...s.connectors, [id]: "connected" },
    }));
  }, [liveLinear, liveSlack]);

  const setMeetingNotes = useCallback((notes: string) => {
    setState((s) => ({ ...s, meetingNotes: notes }));
  }, []);

  const runScribe = useCallback(async (notesOverride?: string) => {
    setProposeError(null);
    setProposing(true);
    let notes = notesOverride;
    let roleId: RoleId | null = null;
    setState((s) => {
      notes = notesOverride ?? s.meetingNotes;
      roleId = s.roleId;
      return notesOverride ? { ...s, meetingNotes: notesOverride } : s;
    });
    // Allow state flush for notesOverride
    await new Promise((r) => setTimeout(r, 0));
    try {
      const res = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes ?? "", roleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProposeError(data.error ?? "Propose failed");
        setState((s) => {
          const fresh = extractProposals(notes ?? s.meetingNotes, s.roleId).map(
            (p) => ({
              ...p,
              reflectionNotes:
                "Mirror local: API blocked or failed. Review carefully before approve.",
              confidence: 0.5,
            })
          );
          return {
            ...s,
            proposals: [
              ...fresh,
              ...s.proposals.filter((p) => p.status !== "pending"),
            ],
            briefReady: false,
            lastProposeMode: "quick",
          };
        });
        return;
      }

      const fresh = (data.proposals ?? []) as Proposal[];
      setState((s) => {
        const lakeEntry: LakeEntry = {
          id: lakeId("lake"),
          kind: "proposal",
          title: `Crew proposed ${fresh.length} items`,
          body: `mode=${data.mode} model=${data.model}`,
          roleId: s.roleId ?? undefined,
          createdAt: new Date().toISOString(),
        };
        return {
          ...s,
          proposals: [
            ...fresh,
            ...s.proposals.filter((p) => p.status !== "pending"),
          ],
          briefReady: false,
          lastProposeMode: data.mode,
          lake: [lakeEntry, ...s.lake].slice(0, 80),
        };
      });
    } catch (err) {
      setProposeError(err instanceof Error ? err.message : "Propose failed");
    } finally {
      setProposing(false);
    }
  }, []);

  const setProposalStatus = useCallback(
    async (id: string, status: ProposalStatus, summary?: string) => {
      const target = state.proposals.find((p) => p.id === id);
      if (!target) return;

      let writebacks = state.writebacks;
      let lake: LakeEntry[] = state.lake;
      let proposals = state.proposals.map((p) =>
        p.id === id ? { ...p, status, summary: summary ?? p.summary } : p
      );

      if (status === "approved" || status === "edited") {
        const wb: WritebackRecord = {
          id: lakeId("wb"),
          proposalId: id,
          target: "linear",
          status: "queued",
          createdAt: new Date().toISOString(),
        };

        try {
          const res = await fetch("/api/writeback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              proposalId: id,
              title: target.title,
              summary: summary ?? target.summary,
            }),
          });
          const data = await res.json();
          const outcome = resolveWritebackResult(res.status, data);
          wb.status = outcome.status;
          if (outcome.externalRef) wb.externalRef = outcome.externalRef;
        } catch {
          wb.status = "failed";
        }

        writebacks = [wb, ...writebacks];
        proposals = proposals.map((p) =>
          p.id === id ? { ...p, writeback: wb } : p
        );
        lake = [
          {
            id: lakeId("lake"),
            kind: "decision" as const,
            title: target.title,
            body: summary ?? target.summary,
            roleId: state.roleId ?? undefined,
            proposalId: id,
            provenance: target.evidence?.map((e) => e.quote) ?? [target.source],
            createdAt: new Date().toISOString(),
          },
          {
            id: lakeId("lake"),
            kind: "writeback" as const,
            title: `Write-back ${wb.status} → Linear`,
            body: writebackNote(wb),
            proposalId: id,
            createdAt: new Date().toISOString(),
          },
          ...lake,
        ].slice(0, 80);
      }

      if (status === "rejected") {
        lake = [
          {
            id: lakeId("lake"),
            kind: "why-not" as const,
            title: `Rejected: ${target.title}`,
            body: target.summary,
            roleId: state.roleId ?? undefined,
            proposalId: id,
            createdAt: new Date().toISOString(),
          },
          ...lake,
        ].slice(0, 80);
      }

      setState((s) => ({ ...s, proposals, writebacks, lake }));
    },
    [state]
  );

  const markBriefReady = useCallback(() => {
    setState((s) => {
      const entry: LakeEntry = {
        id: lakeId("lake"),
        kind: "brief",
        title: "Monday Morning Brief ready",
        body: `${s.proposals.filter((p) => p.status === "approved" || p.status === "edited").length} approved items`,
        roleId: s.roleId ?? undefined,
        createdAt: new Date().toISOString(),
      };
      return { ...s, briefReady: true, lake: [entry, ...s.lake].slice(0, 80) };
    });
  }, []);

  const resetWorkspace = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("stack-spoon-workspace-v1");
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setState((s) => {
      const on = s.enabledAddons.includes(id);
      return {
        ...s,
        enabledAddons: on
          ? s.enabledAddons.filter((a) => a !== id)
          : [...s.enabledAddons, id],
      };
    });
  }, []);

  const setOvernightDigest = useCallback((on: boolean) => {
    setState((s) => ({ ...s, overnightDigest: on }));
  }, []);

  const spawnCrewBridge = useCallback((proposalId: string) => {
    setState((s) => {
      const source = s.proposals.find((p) => p.id === proposalId);
      if (!source) return s;
      const bridged: Proposal = {
        id: lakeId("bridge"),
        title: `Eng handoff: ${source.title}`,
        summary: `Cross-role Crew Bridge from ${s.roleId} → software-engineer. ${source.summary}`,
        source: "Crew Bridge · Spec → Eng",
        agent: "Spec",
        status: "pending",
        createdAt: new Date().toISOString(),
        confidence: source.confidence ?? 0.65,
        reflectionNotes:
          "Mirror: eng pack HITL required before GitHub/Linear write.",
        bridgeRoleId: "software-engineer",
        evidence: source.evidence,
      };
      return {
        ...s,
        proposals: [bridged, ...s.proposals],
        lake: [
          {
            id: lakeId("lake"),
            kind: "proposal" as const,
            title: "Crew Bridge spawned eng handoff",
            body: bridged.title,
            roleId: "software-engineer" as const,
            createdAt: new Date().toISOString(),
          },
          ...s.lake,
        ].slice(0, 80),
      };
    });
  }, []);

  const connectedCount = useMemo(
    () =>
      Object.values(state.connectors).filter((c) => c === "connected").length,
    [state.connectors]
  );

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      proposing,
      proposeError,
      selectRole,
      installPack,
      connectApp,
      setMeetingNotes,
      runScribe,
      setProposalStatus,
      markBriefReady,
      resetWorkspace,
      toggleAddon,
      setOvernightDigest,
      spawnCrewBridge,
      connectedCount,
      sessionEmail,
      liveSlack,
      liveLinear,
    }),
    [
      state,
      hydrated,
      proposing,
      proposeError,
      selectRole,
      installPack,
      connectApp,
      setMeetingNotes,
      runScribe,
      setProposalStatus,
      markBriefReady,
      resetWorkspace,
      toggleAddon,
      setOvernightDigest,
      spawnCrewBridge,
      connectedCount,
      sessionEmail,
      liveSlack,
      liveLinear,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
