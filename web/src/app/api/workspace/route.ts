import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { getWorkspace, putWorkspace } from "@/lib/server/db";
import { requireDatabaseInProd } from "@/lib/server/env";
import type { WorkspaceState } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const dbErr = requireDatabaseInProd();
  if (dbErr) return NextResponse.json({ error: dbErr }, { status: 503 });
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  const state = await getWorkspace(auth.user.id);
  return NextResponse.json({ state });
}

export async function PUT(req: Request) {
  const dbErr = requireDatabaseInProd();
  if (dbErr) return NextResponse.json({ error: dbErr }, { status: 503 });
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  let state: WorkspaceState;
  try {
    state = (await req.json()) as WorkspaceState;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  await putWorkspace(auth.user.id, state);
  return NextResponse.json({ ok: true });
}
