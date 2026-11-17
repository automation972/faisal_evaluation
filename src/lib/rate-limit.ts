// Young10 Marketing CRM - in-memory sliding-window rate limiter (single instance)

interface HitRecord {
  hits: number[];
}

const buckets = new Map<string, HitRecord>();

let lastSweep = Date.now();

function sweep(now: number, windowMs: number): void {
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [key, rec] of buckets) {
    rec.hits = rec.hits.filter((t) => now - t < windowMs);
    if (rec.hits.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Sliding-window counter. Returns allowed=false with retryAfterSec when limit exceeded.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const rec = buckets.get(key) ?? { hits: [] };
  rec.hits = rec.hits.filter((t) => now - t < windowMs);

  if (rec.hits.length >= limit) {
    const oldest = rec.hits[0];
    buckets.set(key, rec);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  rec.hits.push(now);
  buckets.set(key, rec);
  return {
    allowed: true,
    remaining: limit - rec.hits.length,
    retryAfterSec: 0,
  };
}
