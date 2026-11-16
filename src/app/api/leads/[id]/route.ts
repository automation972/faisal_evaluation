// GET / PATCH / DELETE /api/leads/[id]
//
// Performance: flat queries + in-memory relation hydration (see lead-hydrate).
// The PATCH path batches the update and all activity inserts into a single
// array transaction so typical stage changes cost ~2 round trips total.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';
import { bustCache } from '@/lib/cache';
import { loadUsersBundle, serializeLeadWith } from '@/lib/lead-hydrate';
import { leadUpdateSchema } from '@/lib/validation';
import { STAGE_META } from '@/lib/constants';
import type { SafeLead, PipelineStage } from '@/types';

type LeadRow = Prisma.LeadGetPayload<Record<never, never>>;

function serializeLeadFlat(lead: LeadRow): SafeLead {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastContactedAt: lead.lastContactedAt ? lead.lastContactedAt.toISOString() : null,
  } as SafeLead;
}

function nullOrValue(value: string | undefined | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value;
}

async function loadVisibleLead(id: string, authId: string, isAdmin: boolean) {
  // Flat read - RBAC only needs the two id columns, no relations.
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) throw new ApiError(404, 'Lead not found');
  if (!isAdmin && lead.assignedToId !== authId && lead.createdById !== authId) {
    throw new ApiError(403, 'You do not have access to this lead');
  }
  return lead;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    const { id } = await params;
    const [lead, usersBundle] = await Promise.all([
      loadVisibleLead(id, auth.id, auth.role === 'ADMIN'),
      loadUsersBundle(),
    ]);
    return ok<SafeLead>(serializeLeadWith(serializeLeadFlat(lead), usersBundle.map));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    const { id } = await params;
    const existing = await loadVisibleLead(id, auth.id, auth.role === 'ADMIN');

    const body = await req.json().catch(() => null);
    const input = leadUpdateSchema.parse(body);

    // Unchecked input variant: accepts scalar FK columns directly (one round
    // trip) instead of nested relation ops that force implicit transactions.
    const data: Prisma.LeadUncheckedUpdateInput = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: nullOrValue(input.email),
      phone: nullOrValue(input.phone),
      company: nullOrValue(input.company),
      jobTitle: nullOrValue(input.jobTitle),
      source: input.source,
      notes: nullOrValue(input.notes),
    };

    if (input.stage !== undefined) {
      data.stage = input.stage;
      if (input.stage === 'WON' && existing.stage !== 'WON') {
        data.lastContactedAt = new Date();
      }
    }
    if (input.status !== undefined) {
      data.status = input.status;
    }
    if (input.value !== undefined) {
      data.value = input.value;
    }

    // Only admins may change assignment - scalar FK write (ONE round trip;
    // nested `connect` would wrap the update in an implicit transaction).
    // Invalid ids surface as a foreign key violation (P2003 -> 400).
    if (auth.role === 'ADMIN' && input.assignedToId !== undefined) {
      data.assignedToId = input.assignedToId === '' ? null : input.assignedToId;
    }

    // Rare path: when the assignment itself changes, resolve the assignee
    // name for the activity log from the cached users map (no extra round trip).
    const usersBundle = await loadUsersBundle();
    const assigneeName =
      auth.role === 'ADMIN' &&
      input.assignedToId !== undefined &&
      input.assignedToId !== '' &&
      input.assignedToId !== existing.assignedToId
        ? usersBundle.map.get(input.assignedToId)?.name ?? null
        : null;
    if (
      auth.role === 'ADMIN' &&
      input.assignedToId !== undefined &&
      input.assignedToId !== '' &&
      input.assignedToId !== existing.assignedToId &&
      !assigneeName
    ) {
      const target = await db.user.findUnique({
        where: { id: input.assignedToId },
        select: { name: true },
      });
      if (!target) throw new ApiError(400, 'Assigned user does not exist');
    }

    // Pre-compute activity logs from known data (no extra round trips)
    const activityLogs: Array<Prisma.ActivityCreateArgs['data']> = [];
    if (input.stage !== undefined && input.stage !== existing.stage) {
      activityLogs.push({
        type: 'STAGE_CHANGED',
        message: `Moved ${existing.firstName} ${existing.lastName} from ${existing.stage} to ${STAGE_META[input.stage as PipelineStage].label.toUpperCase()}`,
        userId: auth.id,
        leadId: id,
      });
    }
    if (input.status === 'LOST' && existing.status !== 'LOST') {
      activityLogs.push({
        type: 'LEAD_LOST',
        message: `Marked ${existing.firstName} ${existing.lastName} as lost`,
        userId: auth.id,
        leadId: id,
      });
    }
    if (input.assignedToId !== undefined && auth.role === 'ADMIN' && input.assignedToId !== existing.assignedToId) {
      activityLogs.push({
        type: 'LEAD_ASSIGNED',
        message: assigneeName
          ? `${existing.assignedToId ? 'Reassigned' : 'Assigned'} ${existing.firstName} ${existing.lastName} to ${assigneeName}`
          : `Unassigned ${existing.firstName} ${existing.lastName}`,
        userId: auth.id,
        leadId: id,
      });
    }

    // Wave: ONE scalar update round trip; activity logs are written
    // fire-and-forget (they never block the response).
    const updated = await db.lead.update({ where: { id }, data });
    if (activityLogs.length > 0) {
      void db.activity
        .createMany({ data: activityLogs })
        .catch(() => null);
    }

    bustCache('leads:list');
    bustCache('hydrate:leads');
    bustCache('analytics');
    bustCache('activities');

    return ok<SafeLead>(serializeLeadWith(serializeLeadFlat(updated), usersBundle.map));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);
    const { id } = await params;

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) throw new ApiError(404, 'Lead not found');

    // ONE delete round trip; activity log is fire-and-forget
    await db.lead.delete({ where: { id } });
    void db.activity
      .create({
        data: {
          type: 'LEAD_DELETED',
          message: `Deleted lead ${lead.firstName} ${lead.lastName}`,
          userId: auth.id,
        },
      })
      .catch(() => null);

    bustCache('leads:list');
    bustCache('hydrate:leads');
    bustCache('analytics');
    bustCache('activities');

    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
