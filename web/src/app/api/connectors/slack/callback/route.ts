import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/server/crypto-box";
import { readSessionFromCookie } from "@/lib/server/auth";
import { getWorkspace, putWorkspace, recordEvent, upsertConnector } from "@/lib/server/db";
import { emptyWorkspace } from "@/lib/workspace-default";
import { appUrl } from "@/lib/server/env";
import { exchangeSlackCode } from "@/lib/server/slack";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.redirect(`${appUrl()}/hub?connector=slack&error=${encodeURIComponent(err)}`);
  }
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const user = await readSessionFromCookie(state);
  if (!user || !code) {
    return NextResponse.redirect(`${appUrl()}/hub?connector=slack&error=auth`);
  }
  try {
    const tokens = await exchangeSlackCode(code);
    await upsertConnector({
      userId: user.id,
      provider: "slack",
      accessToken: encryptSecret(tokens.accessToken),
      meta: tokens.meta,
    });
    const workspace = (await getWorkspace(user.id)) ?? emptyWorkspace();
    workspace.connectors.slack = "connected";
    await putWorkspace(user.id, workspace);
    await recordEvent(user.id, "connect", "slack");
    return NextResponse.redirect(`${appUrl()}/hub?connector=slack&ok=1`);
  } catch (e) {
    console.error("slack callback", e);
    return NextResponse.redirect(`${appUrl()}/hub?connector=slack&error=token`);
  }
}
