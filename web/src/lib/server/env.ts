export function appUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://127.0.0.1:3000";
}

export function authSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "stack-spoon-dev-auth-secret";
  }
  throw new Error("AUTH_SECRET must be set in production (32+ random chars).");
}

export function isProposeDisabled(): boolean {
  return process.env.PROPOSE_DISABLED === "true" || process.env.PROPOSE_DISABLED === "1";
}

export function isWritebackDisabled(): boolean {
  return (
    process.env.WRITEBACK_DISABLED === "true" || process.env.WRITEBACK_DISABLED === "1"
  );
}

export function slackConfigured(): boolean {
  return Boolean(
    process.env.SLACK_CLIENT_ID?.trim() && process.env.SLACK_CLIENT_SECRET?.trim()
  );
}

export function linearConfigured(): boolean {
  return Boolean(
    process.env.LINEAR_CLIENT_ID?.trim() && process.env.LINEAR_CLIENT_SECRET?.trim()
  );
}

export function requireDatabaseInProd(): string | null {
  if (process.env.VERCEL && !process.env.DATABASE_URL?.trim()) {
    return "Set DATABASE_URL (Neon/Postgres) so sessions and the Context Lake persist on Vercel.";
  }
  return null;
}
