/** In-memory daily proposal cap (resets with process). Demo-faithful cost guardrail. */

type Bucket = { count: number; day: string };

const buckets = new Map<string, Bucket>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function proposeAllowed(
  clientKey: string,
  cap: number
): { ok: true } | { ok: false; remaining: number; cap: number } {
  const day = todayKey();
  const key = `${clientKey}:${day}`;
  const entry = buckets.get(key);
  if (!entry || entry.day !== day) {
    buckets.set(key, { count: 0, day });
  }
  const current = buckets.get(key)!;
  if (current.count >= cap) {
    return { ok: false, remaining: 0, cap };
  }
  return { ok: true };
}

export function recordPropose(clientKey: string, n: number): void {
  const day = todayKey();
  const key = `${clientKey}:${day}`;
  const entry = buckets.get(key) ?? { count: 0, day };
  entry.count += n;
  buckets.set(key, entry);
}

export function proposeUsage(
  clientKey: string
): { count: number; day: string } {
  const day = todayKey();
  const entry = buckets.get(`${clientKey}:${day}`);
  return { count: entry?.count ?? 0, day };
}
