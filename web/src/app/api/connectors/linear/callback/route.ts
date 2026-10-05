import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/server/crypto-box";
import { readSessionFromCookie } from "@/lib/server/auth";
import { getWorkspace, putWorkspace, recordEvent, upsertConnector } from "@/lib/server/db";
import { emptyWorkspace } from "@/lib/workspace-default";
import { appUrl } from "@/lib/server/env";
import { exchangeLinearCode } from "@/lib/server/linear";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.redirect(
      `${appUrl()}/hub?connector=linear&error=${encodeURIComponent(err)}`
    );
  }
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const user = await readSessionFromCookie(state);
  if (!user || !code) {
    return NextResponse.redirect(`${appUrl()}/hub?connector=linear&error=auth`);
  }
  try {
    const tokens = await exchangeLinearCode(code);
    await upsertConnector({
      userId: user.id,
      provider: "linear",
      accessToken: encryptSecret(tokens.accessToken),
      meta: tokens.meta,
    });
    const workspace = (await getWorkspace(user.id)) ?? emptyWorkspace();
    workspace.connectors.linear = "connected";
    await putWorkspace(user.id, workspace);
    await recordEvent(user.id, "connect", "linear");
    return NextResponse.redirect(`${appUrl()}/hub?connector=linear&ok=1`);
  } catch (e) {
    console.error("linear callback", e);
    return NextResponse.redirect(`${appUrl()}/hub?connector=linear&error=token`);
  }
}
