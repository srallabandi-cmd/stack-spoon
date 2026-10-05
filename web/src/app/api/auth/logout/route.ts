import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth";
import { appUrl } from "@/lib/server/env";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookie = clearSessionCookie();
  res.cookies.set(cookie);
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(`${appUrl()}/`);
  const cookie = clearSessionCookie();
  res.cookies.set(cookie);
  return res;
}
