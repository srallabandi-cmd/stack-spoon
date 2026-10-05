import { NextResponse } from "next/server";
import { consumeMagicLink, upsertUserByEmail } from "@/lib/server/db";
import { sessionCookie, signSession } from "@/lib/server/auth";
import { sha256 } from "@/lib/server/crypto-box";
import { appUrl } from "@/lib/server/env";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const nextRaw = url.searchParams.get("next") ?? "/start";
  const next = nextRaw.startsWith("/") ? nextRaw : "/start";

  const link = token ? await consumeMagicLink(sha256(token)) : null;
  if (!link) {
    return NextResponse.redirect(`${appUrl()}/login?error=expired`);
  }

  const user = await upsertUserByEmail(link.email);
  const jwt = await signSession(user);
  const res = NextResponse.redirect(`${appUrl()}${next}`);
  const cookie = sessionCookie(jwt);
  res.cookies.set(cookie);
  return res;
}
