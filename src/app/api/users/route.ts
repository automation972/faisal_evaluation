// GET /api/users - list users (any authenticated user gets active users; admin can includeInactive)
// POST /api/users - admin creates a user

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';
import { cached, bustCache } from '@/lib/cache';
import { registerSchema } from '@/lib/validation';
import type { SafeUser } from '@/types';

const SELECT = { id: true, name: true, email: true, role: true, active: true, createdAt: true } as const;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser();
    const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true';

    // The users list is tiny and read constantly (assign dropdowns, filters)
    const users = await cached(`users:${includeInactive}:${auth.role}`, 15_000, async () => {
      const rows = await db.user.findMany({
        where: includeInactive && auth.role === 'ADMIN' ? {} : { active: true },
        select: SELECT,
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
      });
      return rows.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));
    });

    return ok<SafeUser[]>(users);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);
    const body = await req.json().catch(() => null);
    const input = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: 'SALES_REP',
      },
      select: SELECT,
    });

    await db.activity.create({
      data: {
        type: 'USER_REGISTERED',
        message: `Sales Representative ${user.name} was added by an administrator`,
        userId: user.id,
      },
    });

    bustCache('users:');
    bustCache('hydrate:users');

    return ok<SafeUser>({ ...user, createdAt: user.createdAt.toISOString() }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
