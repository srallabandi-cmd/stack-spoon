import { NextResponse } from "next/server";
import { requireSession, signSession } from "@/lib/server/auth";
import { linearConfigured } from "@/lib/server/env";
import { linearAuthorizeUrl } from "@/lib/server/linear";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireSession();
  if ("response" in auth) return auth.response;
  if (!linearConfigured()) {
    return NextResponse.json(
      {
        error:
          "Linear is not configured yet. Set LINEAR_CLIENT_ID and LINEAR_CLIENT_SECRET.",
      },
      { status: 503 }
    );
  }
  const state = await signSession(auth.user);
  return NextResponse.redirect(linearAuthorizeUrl(state));
}
