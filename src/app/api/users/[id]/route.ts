// PATCH /api/users/[id] - admin updates role / active / name

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { invalidateSessionUser } from '@/lib/auth';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';
import { bustCache } from '@/lib/cache';
import { userUpdateSchema } from '@/lib/validation';
import type { SafeUser } from '@/types';

const SELECT = { id: true, name: true, email: true, role: true, active: true, createdAt: true } as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const input = userUpdateSchema.parse(body);

    const target = await db.user.findUnique({ where: { id } });
    if (!target) throw new ApiError(404, 'User not found');

    if (target.id === auth.id && input.active === false) {
      throw new ApiError(400, 'You cannot deactivate your own account');
    }
    if (target.id === auth.id && input.role && input.role !== 'ADMIN') {
      throw new ApiError(400, 'You cannot change your own role');
    }

    const user = await db.user.update({
      where: { id },
      data: input,
      select: SELECT,
    });

    // Role / activation changes must be visible immediately — drop the session cache
    invalidateSessionUser(id);
    bustCache('users:');
    bustCache('hydrate:users');
    bustCache('analytics');
    bustCache('leads:list');

    return ok<SafeUser>({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await params;
    const user = await db.user.findUnique({ where: { id }, select: SELECT });
    if (!user) throw new ApiError(404, 'User not found');
    return ok<SafeUser>({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    return handleApiError(err);
  }
}
