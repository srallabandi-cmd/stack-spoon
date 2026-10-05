import { appUrl, slackConfigured } from "./env";
import { decryptSecret } from "./crypto-box";
import { getConnector } from "./db";

export function slackAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!.trim(),
    user_scope: "channels:history,channels:read,groups:history,groups:read",
    redirect_uri: `${appUrl()}/api/connectors/slack/callback`,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string) {
  const body = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!.trim(),
    client_secret: process.env.SLACK_CLIENT_SECRET!.trim(),
    code,
    redirect_uri: `${appUrl()}/api/connectors/slack/callback`,
  });
  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as {
    ok?: boolean;
    error?: string;
    authed_user?: { access_token?: string; id?: string };
    team?: { id?: string; name?: string };
  };
  if (!data.ok || !data.authed_user?.access_token) {
    throw new Error(data.error ?? "Slack OAuth failed");
  }
  return {
    accessToken: data.authed_user.access_token,
    meta: JSON.stringify({
      userId: data.authed_user.id,
      teamId: data.team?.id,
      teamName: data.team?.name,
    }),
  };
}

export async function slackContextForUser(userId: string): Promise<string> {
  if (!slackConfigured()) return "";
  const row = await getConnector(userId, "slack");
  if (!row) return "";
  const token = decryptSecret(row.accessToken);
  const listRes = await fetch("https://slack.com/api/conversations.list", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      types: "public_channel,private_channel",
      limit: "8",
      exclude_archived: "true",
    }),
  });
  const list = (await listRes.json()) as {
    ok?: boolean;
    channels?: { id: string; name: string }[];
  };
  if (!list.ok || !list.channels?.length) return "";

  const chunks: string[] = [];
  for (const channel of list.channels.slice(0, 4)) {
    const histRes = await fetch("https://slack.com/api/conversations.history", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        channel: channel.id,
        limit: "12",
      }),
    });
    const hist = (await histRes.json()) as {
      ok?: boolean;
      messages?: { text?: string; user?: string }[];
    };
    if (!hist.ok) continue;
    const lines = (hist.messages ?? [])
      .map((m) => (m.text ?? "").trim())
      .filter(Boolean)
      .slice(0, 8);
    if (lines.length) {
      chunks.push(`#${channel.name}\n${lines.join("\n")}`);
    }
  }
  const text = chunks.join("\n\n").slice(0, 4000);
  return text ? `Recent Slack (read-only):\n${text}` : "";
}
