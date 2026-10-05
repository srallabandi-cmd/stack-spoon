import fs from "fs";
import path from "path";
import type { WorkspaceState } from "@/lib/types";

export type ConnectorProvider = "slack" | "linear";

export type UserRow = { id: string; email: string; createdAt: string };

export type ConnectorRow = {
  userId: string;
  provider: ConnectorProvider;
  accessToken: string;
  refreshToken?: string;
  meta?: string;
};

export type EventRow = {
  id: string;
  userId: string;
  name: string;
  at: string;
  detail?: string;
};

type DbShape = {
  users: UserRow[];
  magicLinks: { tokenHash: string; email: string; expiresAt: string }[];
  workspaces: { userId: string; state: WorkspaceState; updatedAt: string }[];
  connectors: ConnectorRow[];
  proposeUsage: { userId: string; day: string; count: number }[];
  partners: {
    id: string;
    email: string;
    name: string;
    notes: string;
    createdAt: string;
  }[];
  events: EventRow[];
};

const emptyDb = (): DbShape => ({
  users: [],
  magicLinks: [],
  workspaces: [],
  connectors: [],
  proposeUsage: [],
  partners: [],
  events: [],
});

let chain: Promise<unknown> = Promise.resolve();

function filePath(): string {
  return path.join(process.cwd(), ".data", "stack-spoon.json");
}

function readFileDb(): DbShape {
  try {
    const raw = fs.readFileSync(filePath(), "utf8");
    return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    return emptyDb();
  }
}

function writeFileDb(db: DbShape) {
  const dir = path.dirname(filePath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath(), JSON.stringify(db, null, 2));
}

async function withFile<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const db = readFileDb();
    const result = await fn(db);
    writeFileDb(db);
    return result;
  });
  chain = run.catch(() => undefined);
  return run;
}

async function withPg<T>(fn: (client: PgClient) => Promise<T>): Promise<T> {
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await ensurePg(client);
    return await fn(client);
  } finally {
    await client.end();
  }
}

type PgClient = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

async function ensurePg(client: PgClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS magic_links (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      user_id TEXT PRIMARY KEY,
      state TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS connectors (
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      meta TEXT,
      PRIMARY KEY (user_id, provider)
    );
    CREATE TABLE IF NOT EXISTS propose_usage (
      user_id TEXT NOT NULL,
      day TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      at TEXT NOT NULL,
      detail TEXT
    );
  `);
}

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function upsertUserByEmail(email: string): Promise<UserRow> {
  const normalized = email.trim().toLowerCase();
  if (hasDatabase()) {
    return withPg(async (client) => {
      const found = await client.query("SELECT id, email, created_at FROM users WHERE email = $1", [
        normalized,
      ]);
      if (found.rows[0]) {
        return {
          id: String(found.rows[0].id),
          email: String(found.rows[0].email),
          createdAt: String(found.rows[0].created_at),
        };
      }
      const row: UserRow = { id: uid("usr"), email: normalized, createdAt: new Date().toISOString() };
      await client.query("INSERT INTO users (id, email, created_at) VALUES ($1, $2, $3)", [
        row.id,
        row.email,
        row.createdAt,
      ]);
      return row;
    });
  }
  return withFile((db) => {
    let user = db.users.find((u) => u.email === normalized);
    if (!user) {
      user = { id: uid("usr"), email: normalized, createdAt: new Date().toISOString() };
      db.users.push(user);
    }
    return user;
  });
}

export async function saveMagicLink(tokenHash: string, email: string, expiresAt: string) {
  const normalized = email.trim().toLowerCase();
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query(
        "INSERT INTO magic_links (token_hash, email, expires_at) VALUES ($1, $2, $3)",
        [tokenHash, normalized, expiresAt]
      );
    });
  }
  return withFile((db) => {
    db.magicLinks.push({ tokenHash, email: normalized, expiresAt });
  });
}

export async function consumeMagicLink(
  tokenHash: string
): Promise<{ email: string } | null> {
  const now = Date.now();
  if (hasDatabase()) {
    return withPg(async (client) => {
      const found = await client.query(
        "SELECT email, expires_at FROM magic_links WHERE token_hash = $1",
        [tokenHash]
      );
      const row = found.rows[0];
      if (!row) return null;
      await client.query("DELETE FROM magic_links WHERE token_hash = $1", [tokenHash]);
      if (new Date(String(row.expires_at)).getTime() < now) return null;
      return { email: String(row.email) };
    });
  }
  return withFile((db) => {
    const idx = db.magicLinks.findIndex((m) => m.tokenHash === tokenHash);
    if (idx < 0) return null;
    const link = db.magicLinks[idx];
    db.magicLinks.splice(idx, 1);
    if (new Date(link.expiresAt).getTime() < now) return null;
    return { email: link.email };
  });
}

export async function getWorkspace(userId: string): Promise<WorkspaceState | null> {
  if (hasDatabase()) {
    return withPg(async (client) => {
      const found = await client.query("SELECT state FROM workspaces WHERE user_id = $1", [userId]);
      if (!found.rows[0]) return null;
      return JSON.parse(String(found.rows[0].state)) as WorkspaceState;
    });
  }
  return withFile((db) => db.workspaces.find((w) => w.userId === userId)?.state ?? null);
}

export async function putWorkspace(userId: string, state: WorkspaceState) {
  const updatedAt = new Date().toISOString();
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query(
        `INSERT INTO workspaces (user_id, state, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET state = $2, updated_at = $3`,
        [userId, JSON.stringify(state), updatedAt]
      );
    });
  }
  return withFile((db) => {
    const idx = db.workspaces.findIndex((w) => w.userId === userId);
    const row = { userId, state, updatedAt };
    if (idx >= 0) db.workspaces[idx] = row;
    else db.workspaces.push(row);
  });
}

export async function upsertConnector(row: ConnectorRow) {
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query(
        `INSERT INTO connectors (user_id, provider, access_token, refresh_token, meta)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, provider) DO UPDATE SET
           access_token = $3, refresh_token = $4, meta = $5`,
        [row.userId, row.provider, row.accessToken, row.refreshToken ?? null, row.meta ?? null]
      );
    });
  }
  return withFile((db) => {
    const idx = db.connectors.findIndex(
      (c) => c.userId === row.userId && c.provider === row.provider
    );
    if (idx >= 0) db.connectors[idx] = row;
    else db.connectors.push(row);
  });
}

export async function getConnector(
  userId: string,
  provider: ConnectorProvider
): Promise<ConnectorRow | null> {
  if (hasDatabase()) {
    return withPg(async (client) => {
      const found = await client.query(
        "SELECT user_id, provider, access_token, refresh_token, meta FROM connectors WHERE user_id = $1 AND provider = $2",
        [userId, provider]
      );
      const row = found.rows[0];
      if (!row) return null;
      return {
        userId: String(row.user_id),
        provider: row.provider as ConnectorProvider,
        accessToken: String(row.access_token),
        refreshToken: row.refresh_token ? String(row.refresh_token) : undefined,
        meta: row.meta ? String(row.meta) : undefined,
      };
    });
  }
  return withFile(
    (db) => db.connectors.find((c) => c.userId === userId && c.provider === provider) ?? null
  );
}

export async function deleteConnector(userId: string, provider: ConnectorProvider) {
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query("DELETE FROM connectors WHERE user_id = $1 AND provider = $2", [
        userId,
        provider,
      ]);
    });
  }
  return withFile((db) => {
    db.connectors = db.connectors.filter(
      (c) => !(c.userId === userId && c.provider === provider)
    );
  });
}

export async function proposeAllowedDb(
  userId: string,
  cap: number
): Promise<{ ok: true } | { ok: false; remaining: number; cap: number }> {
  const day = new Date().toISOString().slice(0, 10);
  if (hasDatabase()) {
    return withPg(async (client) => {
      const found = await client.query(
        "SELECT count FROM propose_usage WHERE user_id = $1 AND day = $2",
        [userId, day]
      );
      const count = found.rows[0] ? Number(found.rows[0].count) : 0;
      if (count >= cap) return { ok: false as const, remaining: 0, cap };
      return { ok: true as const };
    });
  }
  return withFile((db) => {
    const row = db.proposeUsage.find((u) => u.userId === userId && u.day === day);
    if ((row?.count ?? 0) >= cap) return { ok: false as const, remaining: 0, cap };
    return { ok: true as const };
  });
}

export async function recordProposeDb(userId: string, n: number) {
  const day = new Date().toISOString().slice(0, 10);
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query(
        `INSERT INTO propose_usage (user_id, day, count) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, day) DO UPDATE SET count = propose_usage.count + $3`,
        [userId, day, n]
      );
    });
  }
  return withFile((db) => {
    const row = db.proposeUsage.find((u) => u.userId === userId && u.day === day);
    if (row) row.count += n;
    else db.proposeUsage.push({ userId, day, count: n });
  });
}

export async function addPartner(input: {
  email: string;
  name: string;
  notes: string;
}) {
  const row = {
    id: uid("ptr"),
    email: input.email.trim().toLowerCase(),
    name: input.name,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query(
        "INSERT INTO partners (id, email, name, notes, created_at) VALUES ($1, $2, $3, $4, $5)",
        [row.id, row.email, row.name, row.notes, row.createdAt]
      );
    });
  }
  return withFile((db) => {
    db.partners.push(row);
  });
}

export async function recordEvent(userId: string, name: string, detail?: string) {
  const row: EventRow = {
    id: uid("evt"),
    userId,
    name,
    at: new Date().toISOString(),
    detail,
  };
  if (hasDatabase()) {
    return withPg(async (client) => {
      await client.query(
        "INSERT INTO events (id, user_id, name, at, detail) VALUES ($1, $2, $3, $4, $5)",
        [row.id, row.userId, row.name, row.at, row.detail ?? null]
      );
    });
  }
  return withFile((db) => {
    db.events.push(row);
    if (db.events.length > 500) db.events = db.events.slice(-500);
  });
}
