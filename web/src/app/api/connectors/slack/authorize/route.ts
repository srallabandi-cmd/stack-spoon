import { NextResponse } from "next/server";
import { requireSession, signSession } from "@/lib/server/auth";
import { slackConfigured } from "@/lib/server/env";
import { slackAuthorizeUrl } from "@/lib/server/slack";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  if (!slackConfigured()) {
    return NextResponse.json(
      {
        error:
          "Slack is not configured yet. Set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.",
      },
      { status: 503 }
    );
  }
  const state = await signSession(auth.user);
  return NextResponse.redirect(slackAuthorizeUrl(state));
}
