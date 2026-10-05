import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { getConnector, recordEvent } from "@/lib/server/db";
import { isWritebackDisabled, linearConfigured } from "@/lib/server/env";
import { createLinearIssue } from "@/lib/server/linear";
import { clientIp, rateLimited } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;

  if (isWritebackDisabled()) {
    return NextResponse.json(
      { error: "Write-back is paused (WRITEBACK_DISABLED)." },
      { status: 503 }
    );
  }
  if (rateLimited(`write:${auth.user.id}:${clientIp(req)}`, 20)) {
    return NextResponse.json({ error: "Too many write-backs. Slow down." }, { status: 429 });
  }

  let body: { proposalId?: string; title?: string; summary?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const title = (body.title ?? "").trim();
  const summary = (body.summary ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!linearConfigured()) {
    return NextResponse.json(
      { error: "Linear write-back is not configured. Set LINEAR_CLIENT_ID and LINEAR_CLIENT_SECRET." },
      { status: 503 }
    );
  }

  const connected = await getConnector(auth.user.id, "linear");
  if (!connected) {
    return NextResponse.json(
      { error: "Connect Linear before approving writes.", queued: true },
      { status: 409 }
    );
  }

  try {
    const issue = await createLinearIssue({
      userId: auth.user.id,
      title,
      description: summary,
    });
    await recordEvent(auth.user.id, "write", issue.identifier);
    return NextResponse.json({
      ok: true,
      status: "created",
      externalRef: issue.identifier,
      url: issue.url,
    });
  } catch (err) {
    console.error("writeback", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Linear write failed.", status: "failed" },
      { status: 502 }
    );
  }
}
