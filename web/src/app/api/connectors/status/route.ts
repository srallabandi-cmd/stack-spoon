import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { linearConfigured, slackConfigured } from "@/lib/server/env";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  return NextResponse.json({
    slack: slackConfigured(),
    linear: linearConfigured(),
  });
}
