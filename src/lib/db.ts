import { PrismaClient } from '@prisma/client'

/**
 * Connection tuning — the database is a remote PostgreSQL (Neon).
 * Without a warm connection pool every first query pays a full
 * TCP + TLS + Postgres handshake (~0.5-2s), which made the whole
 * app feel slow. We set sensible pool limits and keep the pool hot
 * with a periodic lightweight ping.
 *
 * Defensive: only overrides the datasource when the URL is a valid
 * PostgreSQL URL — otherwise Prisma resolves DATABASE_URL itself.
 */
function buildPooledUrl(): string | undefined {
  const raw = (process.env.DATABASE_URL || '').trim().replace(/^"+|"+$/g, '');
  if (!raw.startsWith('postgresql://') && !raw.startsWith('postgres://')) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '10');
    if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '10');
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '10');
    const out = url.toString();
    return out.startsWith('postgres') ? out : undefined;
  } catch {
    return undefined;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __y10Warm: Promise<unknown> | undefined
}

const pooledUrl = buildPooledUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    ...(pooledUrl ? { datasources: { db: { url: pooledUrl } } } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/** Warm the connection pool once per process so the first user request is fast. */
if (!globalForPrisma.__y10Warm) {
  // Open several connections in parallel — dashboards fire many parallel
  // queries and every query needs a pooled connection. Without pre-warming,
  // the extra connections pay a cold TCP+TLS+auth handshake (~1.5s each).
  const POOL_WARM_COUNT = 8;
  const warmPool = () =>
    Promise.all(
      Array.from({ length: POOL_WARM_COUNT }, () => db.$queryRaw`SELECT 1`.catch(() => null)),
    );

  globalForPrisma.__y10Warm = warmPool();

  // Keep the pool hot — serverless Postgres providers close idle
  // connections after a few minutes, and a cold reconnect is expensive.
  const ping = setInterval(warmPool, 60_000);
  (ping as unknown as { unref?: () => void }).unref?.();
}
