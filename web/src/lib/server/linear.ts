import { appUrl } from "./env";
import { decryptSecret } from "./crypto-box";
import { getConnector } from "./db";

export function linearAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.LINEAR_CLIENT_ID!.trim(),
    redirect_uri: `${appUrl()}/api/connectors/linear/callback`,
    response_type: "code",
    scope: "read,write",
    state,
    prompt: "consent",
  });
  return `https://linear.app/oauth/authorize?${params.toString()}`;
}

export async function exchangeLinearCode(code: string) {
  const res = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      redirect_uri: `${appUrl()}/api/connectors/linear/callback`,
      client_id: process.env.LINEAR_CLIENT_ID!.trim(),
      client_secret: process.env.LINEAR_CLIENT_SECRET!.trim(),
      grant_type: "authorization_code",
    }),
  });
  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!data.access_token) {
    throw new Error(data.error ?? "Linear OAuth failed");
  }
  const teams = await linearQuery<{
    teams: { nodes: { id: string; name: string }[] };
  }>(data.access_token, `{ teams { nodes { id name } } }`);
  const team = teams.teams.nodes[0];
  return {
    accessToken: data.access_token,
    meta: JSON.stringify({ teamId: team?.id, teamName: team?.name }),
  };
}

async function linearQuery<T>(token: string, query: string, variables?: Record<string, unknown>) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length || !json.data) {
    throw new Error(json.errors?.[0]?.message ?? "Linear GraphQL failed");
  }
  return json.data;
}

export async function createLinearIssue(input: {
  userId: string;
  title: string;
  description: string;
}): Promise<{ identifier: string; url?: string }> {
  const row = await getConnector(input.userId, "linear");
  if (!row) throw new Error("Linear is not connected.");
  const token = decryptSecret(row.accessToken);
  let teamId = "";
  try {
    teamId = JSON.parse(row.meta ?? "{}").teamId ?? "";
  } catch {
    teamId = "";
  }
  if (!teamId) {
    const teams = await linearQuery<{
      teams: { nodes: { id: string }[] };
    }>(token, `{ teams { nodes { id } } }`);
    teamId = teams.teams.nodes[0]?.id ?? "";
  }
  if (!teamId) throw new Error("No Linear team available for write-back.");

  const created = await linearQuery<{
    issueCreate: {
      success: boolean;
      issue: { identifier: string; url: string } | null;
    };
  }>(
    token,
    `mutation IssueCreate($title: String!, $description: String, $teamId: String!) {
      issueCreate(input: { title: $title, description: $description, teamId: $teamId }) {
        success
        issue { identifier url }
      }
    }`,
    { title: input.title, description: input.description, teamId }
  );
  if (!created.issueCreate.success || !created.issueCreate.issue) {
    throw new Error("Linear did not create the issue.");
  }
  return created.issueCreate.issue;
}
