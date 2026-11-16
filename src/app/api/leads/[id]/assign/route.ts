// POST /api/leads/[id]/assign - admin assigns / reassigns / unassigns a lead
//
// Performance: the remote PostgreSQL adds ~200ms per query round trip.
// - The target user is resolved from a cached users map (0 DB cost).
// - The update sets the scalar FK directly: a nested relation `connect`
//   would silently wrap the write in an implicit transaction (5 round
//   trips ≈ 1s); the scalar update is ONE round trip.
// - The activity log is written without blocking the response.
// Steady-state cost: 2 round trips (~400ms), perceived instant via the
// optimistic UI.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';
import { bustCache } from '@/lib/cache';
import { loadUsersBundle, serializeLeadWith } from '@/lib/lead-hydrate';
import type { SafeLead } from '@/types';

type LeadRow = Prisma.LeadGetPayload<Record<never, never>>;

function serializeLeadFlat(lead: LeadRow): SafeLead {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastContactedAt: lead.lastContactedAt ? lead.lastContactedAt.toISOString() : null,
  } as SafeLead;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const assignedToId = (body as { assignedToId?: string } | null)?.assignedToId ?? null;

    // Wave 1 (parallel): flat lead read + cached users map (usually 0 DB cost)
    const [existing, usersBundle] = await Promise.all([
      db.lead.findUnique({ where: { id } }),
      loadUsersBundle(),
    ]);
    if (!existing) throw new ApiError(404, 'Lead not found');

    let target = assignedToId ? usersBundle.map.get(assignedToId) ?? null : null;
    if (assignedToId && !target) {
      // Not in the cache - verify against the DB before failing (rare path)
      const dbUser = await db.user.findUnique({ where: { id: assignedToId }, select: { id: true, name: true, email: true, role: true } });
      if (!dbUser) throw new ApiError(400, 'Assigned user does not exist');
      usersBundle.map.set(dbUser.id, dbUser);
      target = dbUser;
    }

    if (assignedToId === existing.assignedToId) {
      // No-op: return the current state without any write
      return ok<SafeLead>(serializeLeadWith(serializeLeadFlat(existing), usersBundle.map));
    }

    const reassigned = existing.assignedToId !== null && !!assignedToId;
    const message = target
      ? `${reassigned ? 'Reassigned' : 'Assigned'} ${existing.firstName} ${existing.lastName} to ${target.name}`
      : `Unassigned ${existing.firstName} ${existing.lastName}`;

    // Wave 2: scalar FK update - ONE round trip (no implicit transaction).
    // An invalid assignee id surfaces as a foreign key violation (P2003).
    const updated = await db.lead
      .update({
        where: { id },
        data: { assignedToId: assignedToId ?? null },
      })
      .catch((err) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
          throw new ApiError(400, 'Assigned user does not exist');
        }
        throw err;
      });

    // Fire-and-forget activity log - does not block the response.
    void db.activity
      .create({
        data: { type: 'LEAD_ASSIGNED', message, userId: auth.id, leadId: id },
      })
      .catch(() => null);

    bustCache('leads:list');
    bustCache('hydrate:leads');
    bustCache('analytics');
    bustCache('activities');

    return ok<SafeLead>(serializeLeadWith(serializeLeadFlat(updated), usersBundle.map));
  } catch (err) {
    return handleApiError(err);
  }
}
