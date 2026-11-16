// GET /api/activities - recent activity feed (RBAC scoped)

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, parseIntParam } from '@/lib/api-helpers';
import type { SafeActivity } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser();
    const limit = parseIntParam(req.nextUrl.searchParams.get('limit'), 12, 1, 50);
    const leadId = req.nextUrl.searchParams.get('leadId');

    const scope: Prisma.ActivityWhereInput = {};
    if (leadId) {
      scope.leadId = leadId;
    }
    if (auth.role !== 'ADMIN') {
      // Reps see activity on their leads and their own actions
      scope.OR = [{ userId: auth.id }, { lead: { OR: [{ assignedToId: auth.id }, { createdById: auth.id }] } }];
    }

    const activities = await db.activity.findMany({
      where: scope,
      include: {
        user: { select: { id: true, name: true, role: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const data: SafeActivity[] = activities.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
      user: a.user,
      lead: a.lead,
    }));

    return ok<SafeActivity[]>(data);
  } catch (err) {
    return handleApiError(err);
  }
}
