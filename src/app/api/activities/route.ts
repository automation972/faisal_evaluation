// GET /api/activities - recent activity feed (RBAC scoped)
//
// Performance: flat query + in-memory hydration (users/leads maps) instead of
// Prisma `include`, cutting the query plan from 3 sequential round trips to 1.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, parseIntParam } from '@/lib/api-helpers';
import { cached } from '@/lib/cache';
import { loadUsersBundle, loadLeadsBundle } from '@/lib/lead-hydrate';
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

    // Brief cache: the activity feed is polled and re-fetched on every view
    const cacheKey = `activities:${auth.id}:${auth.role}:${leadId ?? ''}:${limit}`;
    const data: SafeActivity[] = await cached(cacheKey, 4_000, async () => {
      const [activities, usersBundle, leadsBundle] = await Promise.all([
        db.activity.findMany({
          where: scope,
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        loadUsersBundle(),
        loadLeadsBundle(),
      ]);
      return activities.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt.toISOString(),
        user: a.userId ? usersBundle.map.get(a.userId) ?? null : null,
        lead: a.leadId
          ? (() => {
              const l = leadsBundle.map.get(a.leadId);
              return l ? { id: l.id, firstName: l.firstName, lastName: l.lastName } : null;
            })()
          : null,
      }));
    });

    return ok<SafeActivity[]>(data);
  } catch (err) {
    return handleApiError(err);
  }
}
