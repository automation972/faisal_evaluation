// Young10 Marketing CRM - in-process TTL cache for hot read endpoints
//
// The database is a remote PostgreSQL (Neon). Every query pays a full network
// round trip (~200ms), so polled endpoints (analytics / activities / tasks)
// would each re-run dozens of aggregate queries on every poll cycle. A tiny
// per-process cache keeps repeated reads instant while mutations always
// bypass + bust the cache, so users still see their own writes immediately.

type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

// Opportunistic cleanup so the map cannot grow unbounded.
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

function sweep(): void {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (entry.expires <= now) store.delete(key);
  }
}

/**
 * Returns cached data when fresh, otherwise runs `fn`, caches and returns it.
 * Never caches rejections — a failed refresh simply propagates.
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  sweep();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;

  const value = await fn();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

/** Invalidate one key, or every key with a given prefix. */
export function bustCache(prefixOrKey: string): void {
  if (store.delete(prefixOrKey)) return;
  for (const key of store.keys()) {
    if (key.startsWith(prefixOrKey)) store.delete(key);
  }
}
