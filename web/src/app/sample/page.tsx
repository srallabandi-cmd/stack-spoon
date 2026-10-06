"use client";

import { useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import {
  DEMO_LABEL,
  SAMPLE_STORAGE_KEY,
  SOURCE_BLOCKS,
  TASK_NAME,
  TICKET_PROPOSAL_ID,
  briefMarkdown,
  createSampleDemo,
  editProposal,
  includeInBrief,
  isSampleDemoState,
  rejectProposal,
  restartSample,
  simulateTicket,
  sourceBlock,
  ticketDraft,
  type SampleDemoState,
} from "@/lib/sample-demo";

export default function SampleWorkflowPage() {
  const [state, setState] = useState<SampleDemoState | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(SAMPLE_STORAGE_KEY);
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isSampleDemoState(parsed)) {
          setState(parsed);
          return;
        }
      } catch {
        /* fall through to a fresh sample */
      }
    }
    setState(createSampleDemo());
  }, []);

  useEffect(() => {
    if (!state) return;
    sessionStorage.setItem(SAMPLE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const markdown = useMemo(() => (state ? briefMarkdown(state) : ""), [state]);

  function restart() {
    sessionStorage.removeItem(SAMPLE_STORAGE_KEY);
    setState(restartSample());
    setTicketOpen(false);
    setCopyMessage(null);
    setDownloadMessage(null);
  }

  async function copyBrief() {
    setCopyMessage(null);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyMessage("Copied.");
      return;
    } catch {
      /* try the older copy command in the same action */
    }
    try {
      const area = document.createElement("textarea");
      area.value = markdown;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      setCopyMessage(copied ? "Copied." : "Copy failed.");
    } catch {
      setCopyMessage("Copy failed.");
    }
  }

  function downloadBrief() {
    setDownloadMessage(null);
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "prepare-a-project-update.md";
      link.click();
      URL.revokeObjectURL(url);
      setDownloadMessage("Downloaded Markdown.");
    } catch {
      setDownloadMessage("Download failed.");
    }
  }

  if (!state) {
    return (
      <AppChrome steps={["Sample"]} step={0}>
        <div className="panel sample-flow">
          <p className="demo-banner">{DEMO_LABEL}</p>
        </div>
      </AppChrome>
    );
  }

  const ticketProposal = state.proposals.find((item) => item.id === TICKET_PROPOSAL_ID);
  const draft = ticketProposal ? ticketDraft(ticketProposal) : null;
  const ticket = state.simulatedTicket;

  return (
    <AppChrome steps={["Sample"]} step={0}>
      <div className="panel sample-flow">
        <p className="demo-banner">{DEMO_LABEL}</p>
        <p className="eyebrow">Portfolio demo</p>
        <h1>{TASK_NAME}</h1>
        <p className="lede">
          Review prepared sample outputs from one fictional project check-in.
          Include what belongs in the update, and leave out what does not.
        </p>
        <SpoonTip>
          This sample stays on this page. It does not sign you in, call a model,
          or send anything.
        </SpoonTip>

        <section>
          <h2>Source notes</h2>
          <p className="kit-sub">Fictional project: Northwind launch.</p>
          {SOURCE_BLOCKS.map((block) => {
            const proposal = state.proposals.find((item) => item.sourceId === block.id);
            const quote = proposal?.evidence ?? "";
            const at = quote ? block.text.indexOf(quote) : -1;
            return (
              <p key={block.id} id={block.id}>
                <strong>{block.speaker}: </strong>
                {at >= 0 ? (
                  <>
                    {block.text.slice(0, at)}
                    <mark>{quote}</mark>
                    {block.text.slice(at + quote.length)}
                  </>
                ) : (
                  block.text
                )}
              </p>
            );
          })}
        </section>

        <section>
          <h2>Prepared sample outputs</h2>
          <p className="demo-banner">{DEMO_LABEL}</p>
          <div className="proposal-list">
            {state.proposals.map((proposal) => {
              const decision = state.decisions[proposal.id];
              const block = sourceBlock(proposal.sourceId);
              return (
                <article key={proposal.id} className="proposal">
                  <div className="proposal-top">
                    <h3>{proposal.title}</h3>
                    <span className="agent-tag">
                      {proposal.needsDecision ? "Needs review" : "Action"}
                    </span>
                  </div>
                  <p className="proposal-source">Prepared sample output</p>
                  {proposal.needsDecision ? (
                    <p className="mirror-note">
                      The notes do not name an owner. You decide what the update should say.
                    </p>
                  ) : null}
                  <textarea
                    className="edit-box"
                    rows={3}
                    aria-label={`Edit ${proposal.title}`}
                    value={proposal.summary}
                    onChange={(event) =>
                      setState((current) =>
                        current
                          ? editProposal(current, proposal.id, event.target.value)
                          : current
                      )
                    }
                  />
                  {block ? (
                    <p>
                      <a href={`#${block.id}`}>Source: “{proposal.evidence}”</a>
                    </p>
                  ) : null}
                  <div className="actions-row" style={{ marginTop: 0 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        setState((current) =>
                          current ? includeInBrief(current, proposal.id) : current
                        )
                      }
                    >
                      {decision === "included" ? "Included" : "Include in brief"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        setState((current) =>
                          current ? rejectProposal(current, proposal.id) : current
                        )
                      }
                    >
                      {decision === "rejected" ? "Left out" : "Reject"}
                    </button>
                    {proposal.id === TICKET_PROPOSAL_ID ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setTicketOpen(true)}
                      >
                        Preview Linear ticket
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {ticketOpen && draft ? (
          <section className="panel" style={{ marginTop: "1.25rem" }}>
            <p className="demo-banner">{DEMO_LABEL}</p>
            <h2>Ticket preview</h2>
            <p className="kit-sub">Fictional destination. Nothing is sent.</p>
            <p>
              <strong>Title: </strong>
              {ticket?.title ?? draft.title}
            </p>
            <p>
              <strong>Body</strong>
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{ticket?.body ?? draft.body}</p>
            <p>
              <strong>Destination: </strong>
              {ticket?.destination ?? draft.destination}
            </p>
            {ticket ? (
              <p className="demo-banner">Simulated ticket; nothing sent.</p>
            ) : (
              <div className="actions-row">
                <button
                  type="button"
                  className="btn btn-brass"
                  onClick={() =>
                    setState((current) =>
                      current ? simulateTicket(current, TICKET_PROPOSAL_ID) : current
                    )
                  }
                >
                  Simulate approval
                </button>
              </div>
            )}
          </section>
        ) : null}

        <section>
          <h2>Project update brief</h2>
          <p className="demo-banner">{DEMO_LABEL}</p>
          <pre className="edit-box sample-output">
            {markdown}
          </pre>
          <div className="actions-row">
            <button type="button" className="btn btn-primary" onClick={copyBrief}>
              Copy
            </button>
            <button type="button" className="btn btn-ghost" onClick={downloadBrief}>
              Download Markdown
            </button>
            <button type="button" className="btn btn-ghost" onClick={restart}>
              Restart sample
            </button>
          </div>
          {copyMessage ? <p role="status">{copyMessage}</p> : null}
          {downloadMessage ? <p role="status">{downloadMessage}</p> : null}
        </section>
      </div>
    </AppChrome>
  );
}
