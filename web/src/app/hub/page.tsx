"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import { CONNECTORS, SAMPLE_MEETING } from "@/lib/data";
import { getRolePack } from "@/lib/role-packs";
import { useWorkspace } from "@/lib/store";
import type { ConnectorId } from "@/lib/types";

export default function HubPage() {
  const {
    roleId,
    packInstalled,
    connectors,
    connectApp,
    connectedCount,
    meetingNotes,
    setMeetingNotes,
    runScribe,
    liveSlack,
    liveLinear,
    proposing,
  } = useWorkspace();
  const router = useRouter();
  const [oauthFor, setOauthFor] = useState<ConnectorId | null>(null);

  const packConnectors = useMemo(() => {
    const pack = getRolePack(roleId);
    const allowed = new Set(pack.connectors);
    const preferred = CONNECTORS.filter((c) => allowed.has(c.id));
    return preferred.length ? preferred : CONNECTORS.slice(0, 5);
  }, [roleId]);

  useEffect(() => {
    if (!packInstalled) router.replace("/pack");
  }, [packInstalled, router]);

  async function onConnect(id: ConnectorId) {
    const live = (id === "slack" && liveSlack) || (id === "linear" && liveLinear);
    if (!live) setOauthFor(id);
    await connectApp(id);
    if (!live) setTimeout(() => setOauthFor(null), 1200);
  }

  async function loadSampleAndRun() {
    setMeetingNotes(SAMPLE_MEETING);
    router.push("/inbox");
    await runScribe(SAMPLE_MEETING);
  }

  return (
    <AppChrome
      step={2}
      aside={
        <div className="panel">
          <p className="eyebrow">Working memory</p>
          <h1 style={{ fontSize: "1.55rem" }}>Feed the Scribe</h1>
          <p className="lede">
            Paste meeting notes (or load a sample). Agents turn them into Inbox
            proposals. Writes stay pending until you approve.
          </p>
          <textarea
            className="notes-area"
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            placeholder="Paste a meeting transcript or decision notes…"
          />
          <div className="actions-row">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={proposing}
              onClick={loadSampleAndRun}
            >
              Use sample meeting
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!meetingNotes.trim() || proposing}
              onClick={async () => {
                router.push("/inbox");
                await runScribe();
              }}
            >
              {proposing ? "Running Pack Crew…" : "Run Pack Crew → Inbox"}
            </button>
          </div>
        </div>
      }
    >
      <div className="panel">
        <p className="eyebrow">Step 3 · Connector Hub</p>
        <h1>Connect the apps you already use</h1>
        <p className="lede">
          Slack and Linear are live when keys are set. Other tiles stay Preview
          or demo. Agents still cannot write until you approve in Inbox.
        </p>
        <div className="demo-banner">
          {liveSlack || liveLinear
            ? "Live: Slack read and/or Linear write use real OAuth. Calendar, Granola, Notion, HubSpot, and GitHub stay demo or Preview."
            : "Demo mode until Slack and Linear OAuth apps are configured. Connects are simulated so you can walk the approve path."}
        </div>
        <SpoonTip>
          {connectedCount === 0
            ? "Start with Slack. That’s where most decisions leak today."
            : `${connectedCount} connected (demo). Agents can read; they still can’t write without you.`}
        </SpoonTip>

        <div className="hub-grid">
          {packConnectors.map((c) => {
            const status = connectors[c.id] ?? "idle";
            const live =
              (c.id === "slack" && liveSlack) || (c.id === "linear" && liveLinear);
            const preview = c.preview || (!live && c.id !== "slack" && c.id !== "linear");
            return (
              <div key={c.id} className="hub-tile">
                <div className="hub-meta">
                  <h3>
                    {c.name}
                    {preview ? (
                      <span className="badge badge-muted" style={{ marginLeft: "0.5rem" }}>
                        Preview
                      </span>
                    ) : live ? (
                      <span className="badge" style={{ marginLeft: "0.5rem" }}>
                        Live
                      </span>
                    ) : null}
                  </h3>
                  <p>{c.detail}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span className={`status-chip is-${status}`}>
                    {status === "idle" && "Not connected"}
                    {status === "connecting" && "Connecting…"}
                    {status === "connected" && "Connected"}
                  </span>
                  {status !== "connected" && (
                    <button
                      type="button"
                      className="btn btn-primary btn-compact"
                      disabled={status === "connecting"}
                      onClick={() => onConnect(c.id)}
                    >
                      {status === "connecting"
                        ? live
                          ? "Redirecting…"
                          : "Demo connecting…"
                        : live
                          ? c.action
                          : `Demo ${c.action}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {oauthFor && (
          <div className="oauth-sheet">
            <h3>
              Demo connect{" "}
              {packConnectors.find((c) => c.id === oauthFor)?.name ??
                CONNECTORS.find((c) => c.id === oauthFor)?.name}
            </h3>
            <p>
              Simulated sign-in for this walkthrough. In production you would pick
              what we can read. We never post or create tickets until you approve
              in the Inbox.
            </p>
            <div className="channel-pills">
              <span className="pill">#product</span>
              <span className="pill">#eng</span>
              <span className="pill">#launches</span>
            </div>
            <span className="status-chip is-connecting">Finishing demo connect…</span>
          </div>
        )}

        <div className="actions-row">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.push("/inbox")}
          >
            Skip to Inbox
          </button>
        </div>
      </div>
    </AppChrome>
  );
}
