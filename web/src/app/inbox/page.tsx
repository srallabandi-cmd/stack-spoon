"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import { SAMPLE_MEETING } from "@/lib/data";
import { useWorkspace } from "@/lib/store";

export default function InboxPage() {
  const {
    proposals,
    setProposalStatus,
    runScribe,
    setMeetingNotes,
    meetingNotes,
    markBriefReady,
    proposing,
    proposeError,
    lastProposeMode,
    enabledAddons,
    spawnCrewBridge,
    roleId,
    packInstalled,
  } = useWorkspace();
  const router = useRouter();
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [slackPreviewId, setSlackPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) router.replace("/start");
    else if (!packInstalled) router.replace("/pack");
  }, [roleId, packInstalled, router]);

  const pending = proposals.filter((p) => p.status === "pending");
  const decided = proposals.filter((p) => p.status !== "pending");
  const slackAddon = enabledAddons.includes("inbox-slack");
  const bridgeAddon = enabledAddons.includes("crew-bridge");

  function finishBrief() {
    markBriefReady();
    router.push("/brief");
  }

  async function loadSample() {
    setMeetingNotes(SAMPLE_MEETING);
    await runScribe(SAMPLE_MEETING);
  }

  return (
    <AppChrome step={3}>
      <div className="panel">
        <p className="eyebrow">Step 4 · Approve Inbox</p>
        <h1>Agents propose. You approve.</h1>
        <p className="lede">
          Mirror reflects before anything lands here. Nothing posts to Slack,
          Linear, or Notion until you say so.
        </p>
        <SpoonTip>
          Approve what belongs in Monday’s brief. Reject noise. Edit when the agent
          almost had it.
        </SpoonTip>

        {lastProposeMode ? (
          <p className="diagnose-mode">
            Pack Crew · {lastProposeMode}
            {proposing ? " · running…" : ""}
          </p>
        ) : null}
        {proposeError ? <p className="diagnose-error">{proposeError}</p> : null}

        {proposals.length === 0 ? (
          <div className="empty-inbox">
            <h2>No proposals yet</h2>
            <p>
              Paste notes in the Hub, or load a sample meeting to see Mirror and
              the Pack Crew propose.
            </p>
            <div className="actions-row">
              <button
                type="button"
                className="btn btn-brass"
                disabled={proposing}
                onClick={loadSample}
              >
                {proposing ? "Diagnosing…" : "Load sample meeting"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push("/hub")}
              >
                Back to Hub
              </button>
              {meetingNotes.trim() ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={proposing}
                  onClick={() => runScribe()}
                >
                  {proposing ? "Running crew…" : "Generate from my notes"}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="proposal-list">
              {pending.map((p) => (
                <article key={p.id} className="proposal">
                  <div className="proposal-top">
                    <h3>{p.title}</h3>
                    <span className="agent-tag">{p.agent}</span>
                  </div>
                  <p className="proposal-source">{p.source}</p>
                  <p>{p.summary}</p>
                  {p.reflectionNotes ? (
                    <p className="mirror-note">Mirror · {p.reflectionNotes}</p>
                  ) : null}
                  {p.evidence?.length ? (
                    <ul className="evidence-list">
                      {p.evidence.map((e, i) => (
                        <li key={i}>“{e.quote}”</li>
                      ))}
                    </ul>
                  ) : null}
                  {p.confidence != null ? (
                    <p className="proposal-source">
                      Confidence {(p.confidence * 100).toFixed(0)}%
                    </p>
                  ) : null}
                  <textarea
                    className="edit-box"
                    rows={2}
                    placeholder="Optional edit before approve…"
                    value={editing[p.id] ?? ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, [p.id]: e.target.value }))
                    }
                  />
                  <div className="actions-row" style={{ marginTop: 0 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        setProposalStatus(
                          p.id,
                          editing[p.id]?.trim() ? "edited" : "approved",
                          editing[p.id]?.trim() || p.summary
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setProposalStatus(p.id, "rejected")}
                    >
                      Reject
                    </button>
                    {slackAddon ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          setSlackPreviewId((id) => (id === p.id ? null : p.id))
                        }
                      >
                        Slack card
                      </button>
                    ) : null}
                    {bridgeAddon && roleId === "ai-pm" && p.agent === "Spec" ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => spawnCrewBridge(p.id)}
                      >
                        Bridge to eng
                      </button>
                    ) : null}
                  </div>
                  {slackPreviewId === p.id ? (
                    <div className="slack-card-preview">
                      <p className="eyebrow">Inbox in Slack (preview)</p>
                      <p>
                        <strong>{p.title}</strong>
                      </p>
                      <p>{p.summary}</p>
                      <div className="actions-row">
                        <span className="agent-tag">Approve</span>
                        <span className="agent-tag">Edit</span>
                        <span className="agent-tag">Reject</span>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            {decided.length > 0 && (
              <div className="panel" style={{ marginTop: "1.25rem" }}>
                <p className="eyebrow">Already decided</p>
                <div className="proposal-list">
                  {decided.map((p) => (
                    <article
                      key={p.id}
                      className={`proposal ${
                        p.status === "rejected" ? "is-rejected" : "is-approved"
                      }`}
                    >
                      <div className="proposal-top">
                        <h3>{p.title}</h3>
                        <span className="agent-tag">{p.status}</span>
                      </div>
                      <p>{p.summary}</p>
                      {p.writeback ? (
                        <p className="proposal-source">
                          Write-back · Linear · {p.writeback.status}
                          {p.writeback.externalRef
                            ? ` · ${p.writeback.externalRef}`
                            : ""}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="actions-row">
              <button
                type="button"
                className="btn btn-brass"
                disabled={pending.length > 0}
                onClick={finishBrief}
              >
                Build Monday Morning Brief
              </button>
              {pending.length > 0 ? (
                <>
                  <span className="link-quiet">{pending.length} still pending</span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={finishBrief}
                  >
                    Skip remaining
                  </button>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </AppChrome>
  );
}
