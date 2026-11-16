// POST /api/auth/login

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth';
import { handleApiError, ok, ApiError } from '@/lib/api-helpers';
import { loginSchema } from '@/lib/validation';
import type { SafeUser } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const input = loginSchema.parse(body);

    const user = await db.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (!user.active) {
      throw new ApiError(403, 'This account has been deactivated. Contact your administrator.');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token);

    return ok<SafeUser>({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
