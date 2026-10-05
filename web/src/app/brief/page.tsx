"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import { ROLES } from "@/lib/data";
import { useWorkspace } from "@/lib/store";

export default function BriefPage() {
  const {
    proposals,
    roleId,
    connectedCount,
    resetWorkspace,
    lake,
    writebacks,
    overnightDigest,
    setOvernightDigest,
    enabledAddons,
    packInstalled,
  } = useWorkspace();
  const router = useRouter();
  const role = ROLES.find((r) => r.id === roleId);

  useEffect(() => {
    if (!roleId) router.replace("/start");
    else if (!packInstalled) router.replace("/pack");
  }, [roleId, packInstalled, router]);

  const approved = useMemo(
    () => proposals.filter((p) => p.status === "approved" || p.status === "edited"),
    [proposals]
  );
  const rejected = useMemo(
    () => proposals.filter((p) => p.status === "rejected"),
    [proposals]
  );

  const decisions = approved.filter((p) => p.agent === "Scribe" || p.agent === "Scout");
  const nextMoves = approved.filter((p) => p.agent === "Spec" || p.agent === "Calendar");
  const priorities = approved.slice(0, 3);
  const driftItems = approved.filter((p) => p.agent === "Drift");
  const lakePreview = lake.slice(0, 6);

  return (
    <AppChrome step={4}>
      <div className="brief-hero">
        <p className="eyebrow">Monday Morning Brief</p>
        <h1>You’re ready for the week.</h1>
        <p className="lede" style={{ marginBottom: "0.5rem" }}>
          {role ? `${role.title} pack` : "Role pack"} · {connectedCount} apps connected ·{" "}
          {approved.length} approved · {rejected.length} left out on purpose
        </p>
        <SpoonTip>
          This is the payoff: decisions, priorities, and next moves, without
          re-briefing AI from zero.
        </SpoonTip>
      </div>

      <div className="brief-grid">
        <section className="brief-col">
          <h3>Decisions</h3>
          {decisions.length ? (
            <ul>
              {decisions.map((p) => (
                <li key={p.id}>{p.summary}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">Approve Scribe items in the Inbox to fill this.</p>
          )}
        </section>
        <section className="brief-col">
          <h3>Priorities</h3>
          {priorities.length ? (
            <ul>
              {priorities.map((p) => (
                <li key={p.id}>{p.title}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">Nothing approved yet.</p>
          )}
        </section>
        <section className="brief-col">
          <h3>Next moves</h3>
          {nextMoves.length ? (
            <ul>
              {nextMoves.map((p) => (
                <li key={p.id}>{p.summary}</li>
              ))}
            </ul>
          ) : approved.length ? (
            <ul>
              {approved.map((p) => (
                <li key={p.id}>{p.summary}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">Approve Spec proposals to populate next moves.</p>
          )}
        </section>
      </div>

      {enabledAddons.includes("drift") || driftItems.length > 0 ? (
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Drift</p>
          <h3 style={{ marginTop: 0 }}>Outcome loop</h3>
          {driftItems.length ? (
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--ink-soft)" }}>
              {driftItems.map((p) => (
                <li key={p.id}>{p.summary}</li>
              ))}
            </ul>
          ) : (
            <p className="empty">
              Approve a Drift proposal in Inbox to schedule T+30 / T+60 / T+90 checks.
            </p>
          )}
        </div>
      ) : null}

      {enabledAddons.includes("overnight") ? (
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Overnight Brief</p>
          <label className="addon-toggle">
            <input
              type="checkbox"
              checked={overnightDigest}
              onChange={(e) => setOvernightDigest(e.target.checked)}
            />
            Send a morning digest of pending Inbox items (demo toggle)
          </label>
        </div>
      ) : null}

      {writebacks.length > 0 ? (
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Write-backs</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--ink-soft)" }}>
            {writebacks.slice(0, 5).map((w) => (
              <li key={w.id}>
                {w.target} · {w.status}
                {w.externalRef ? ` · ${w.externalRef}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lakePreview.length > 0 ? (
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Context Lake</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--ink-soft)" }}>
            {lakePreview.map((e) => (
              <li key={e.id}>
                <strong>{e.kind}</strong> · {e.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rejected.length > 0 && (
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Why we said no</p>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--ink-soft)" }}>
            {rejected.map((p) => (
              <li key={p.id} style={{ marginBottom: "0.4rem" }}>
                <strong>{p.title}:</strong> {p.summary}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="actions-row">
        <Link href="/inbox" className="btn btn-ghost">
          Back to Inbox
        </Link>
        <Link href="/hub" className="btn btn-ghost">
          Connector Hub
        </Link>
        <Link href="/refuge" className="btn btn-ghost">
          Relay Refuge
        </Link>
        <button type="button" className="btn btn-primary" onClick={resetWorkspace}>
          Reset demo
        </button>
        <Link href="/" className="btn btn-brass">
          Back to landing
        </Link>
      </div>
    </AppChrome>
  );
}
