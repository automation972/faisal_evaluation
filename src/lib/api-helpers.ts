// Young10 Marketing CRM - REST API helpers: uniform envelopes, RBAC guards

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import type { SafeUser } from '@/types';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(status: number, error: string): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return fail(err.status, err.message);
  }
  // Zod validation errors
  if (typeof err === 'object' && err !== null && 'issues' in err && Array.isArray((err as { issues: unknown }).issues)) {
    const issues = (err as { issues: Array<{ message?: string; path: Array<string | number> }> }).issues;
    const detail = issues
      .map((i) => `${i.path?.join('.') || 'field'}: ${i.message || 'invalid'}`)
      .join('; ');
    return fail(400, `Validation failed - ${detail}`);
  }
  console.error('[api] unhandled error:', err);
  return fail(500, 'Internal server error');
}

/** Throws 401 when unauthenticated. */
export async function requireUser(): Promise<SafeUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError(401, 'Authentication required');
  }
  return user;
}

/** Throws 403 when the user lacks one of the allowed roles. */
export function requireRole(user: SafeUser, roles: Array<SafeUser['role']>): void {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
}

export function parseIntParam(value: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}
