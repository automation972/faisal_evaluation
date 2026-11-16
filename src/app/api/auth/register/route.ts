// POST /api/auth/register - create account (first user becomes ADMIN)

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';
import { handleApiError, ok, ApiError } from '@/lib/api-helpers';
import { registerSchema } from '@/lib/validation';
import type { SafeUser } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const input = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const isFirstUser = (await db.user.count()) === 0;

    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: isFirstUser ? 'ADMIN' : 'SALES_REP',
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    await db.activity.create({
      data: {
        type: 'USER_REGISTERED',
        message: `${user.name} joined the CRM as ${user.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}`,
        userId: user.id,
      },
    });

    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token);

    return ok<SafeUser>({ ...user, createdAt: user.createdAt.toISOString() }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
