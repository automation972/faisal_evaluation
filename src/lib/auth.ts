// Young10 Marketing CRM - JWT session auth (jose + bcryptjs, httpOnly cookie)

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/constants';
import { db } from '@/lib/db';
import type { SafeUser } from '@/types';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'y10-crm-dev-secret-change-me',
);

export interface SessionPayload {
  sub: string;
  role: 'ADMIN' | 'SALES_REP';
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      role: (payload.role as 'ADMIN' | 'SALES_REP') ?? 'SALES_REP',
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Short-lived in-memory cache for session user lookups.
 *
 * Every authenticated API call used to pay a full database round trip just
 * to re-verify the session user. The JWT already guarantees authenticity,
 * so a tiny TTL cache keeps hot requests at ~0ms while still propagating
 * deactivations / role changes within a few seconds.
 */
const SESSION_CACHE_TTL_MS = 15_000;

const globalForAuth = globalThis as unknown as {
  __y10SessionCache: Map<string, { user: SafeUser; expires: number }> | undefined;
};

const sessionUserCache =
  globalForAuth.__y10SessionCache ?? new Map<string, { user: SafeUser; expires: number }>();
globalForAuth.__y10SessionCache = sessionUserCache;

/** Drop cached session users (all, or one specific user). */
export function invalidateSessionUser(userId?: string): void {
  if (userId) sessionUserCache.delete(userId);
  else sessionUserCache.clear();
}

/** Reads the session cookie, verifies the JWT and loads the active user. */
export async function getSessionUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  // Hot path — JWT verified, user served from cache (no DB round trip)
  const cached = sessionUserCache.get(payload.sub);
  if (cached && cached.expires > Date.now()) {
    return cached.user;
  }

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  if (!user || !user.active) {
    sessionUserCache.delete(payload.sub);
    return null;
  }

  const safe = { ...user, createdAt: user.createdAt.toISOString() } as SafeUser;
  sessionUserCache.set(payload.sub, { user: safe, expires: Date.now() + SESSION_CACHE_TTL_MS });
  return safe;
}
