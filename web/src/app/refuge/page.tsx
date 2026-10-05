"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/Shell";
import { SpoonTip } from "@/components/SpoonTip";
import { useWorkspace } from "@/lib/store";

export default function RefugePage() {
  const { selectRole } = useWorkspace();
  const router = useRouter();

  function startKit(role: "early-stage" | "admin") {
    selectRole(role);
    router.push("/pack");
  }

  return (
    <AppChrome>
      <div className="panel">
        <p className="eyebrow">Relay Refuge</p>
        <h1>HITL workflows without Relay.</h1>
        <p className="lede">
          Relay.app is shutting down. Stack Spoon keeps the part that mattered:
          humans approve before anything posts. No workflow canvas. Job title to
          working Inbox in minutes.
        </p>
        <SpoonTip>
          Install Early Stage or Admin pack, connect Slack + Calendar, approve in
          Inbox. That is the whole loop.
        </SpoonTip>

        <div className="refuge-grid">
          <article className="product-tile">
            <h3>Early Stage kit</h3>
            <p>Scribe + Mirror + cost caps. One reliable Monday workflow.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => startKit("early-stage")}
            >
              Install Early Stage
            </button>
          </article>
          <article className="product-tile">
            <h3>Admin kit</h3>
            <p>Calendar triage and briefing packs with approve-before-send.</p>
            <button
              type="button"
              className="btn btn-brass"
              onClick={() => startKit("admin")}
            >
              Install Admin
            </button>
          </article>
        </div>

        <ul className="kit-list" style={{ marginTop: "1.5rem" }}>
          <li>HITL Inbox (approve / edit / reject)</li>
          <li>Slack-shaped approval preview (Inbox in Slack addon)</li>
          <li>Context Lake stores decisions and why-not</li>
          <li>No MCP jargon. No agent army.</li>
        </ul>

        <div className="actions-row">
          <Link href="/start" className="btn btn-ghost">
            Back to start
          </Link>
        </div>
      </div>
    </AppChrome>
  );
}
