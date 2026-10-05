import { NextResponse } from "next/server";
import { linearConfigured, slackConfigured } from "@/lib/server/env";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    slack: slackConfigured(),
    linear: linearConfigured(),
    proposeDisabled: process.env.PROPOSE_DISABLED === "true",
    writebackDisabled: process.env.WRITEBACK_DISABLED === "true",
    database: Boolean(process.env.DATABASE_URL?.trim()),
  });
}
