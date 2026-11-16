// GET / PATCH / DELETE /api/leads/[id]

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';
import { leadUpdateSchema } from '@/lib/validation';
import { STAGE_META } from '@/lib/constants';
import type { SafeLead, PipelineStage } from '@/types';

const LEAD_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.LeadInclude;

type LeadWithRelations = Prisma.LeadGetPayload<{ include: typeof LEAD_INCLUDE }>;

function serializeLead(lead: LeadWithRelations): SafeLead {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastContactedAt: lead.lastContactedAt ? lead.lastContactedAt.toISOString() : null,
    assignedTo: lead.assignedTo,
    createdBy: lead.createdBy,
  };
}

function nullOrValue(value: string | undefined | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value;
}

async function loadVisibleLead(id: string, authId: string, isAdmin: boolean) {
  const lead = await db.lead.findUnique({ where: { id }, include: LEAD_INCLUDE });
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
    const lead = await loadVisibleLead(id, auth.id, auth.role === 'ADMIN');
    return ok<SafeLead>(serializeLead(lead));
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

    const data: Prisma.LeadUpdateInput = {
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

    // Only admins may change assignment
    if (auth.role === 'ADMIN' && input.assignedToId !== undefined) {
      if (input.assignedToId === '') {
        data.assignedTo = { disconnect: true };
      } else {
        const target = await db.user.findUnique({ where: { id: input.assignedToId } });
        if (!target) throw new ApiError(400, 'Assigned user does not exist');
        data.assignedTo = { connect: { id: target.id } };
      }
    }

    const lead = await db.lead.update({ where: { id }, data, include: LEAD_INCLUDE });

    // Activity log for notable changes
    if (input.stage !== undefined && input.stage !== existing.stage) {
      const toMeta = STAGE_META[input.stage as PipelineStage];
      await db.activity.create({
        data: {
          type: 'STAGE_CHANGED',
          message: `Moved ${lead.firstName} ${lead.lastName} from ${existing.stage} to ${toMeta.label.toUpperCase()}`,
          userId: auth.id,
          leadId: lead.id,
        },
      });
    }
    if (input.status === 'LOST' && existing.status !== 'LOST') {
      await db.activity.create({
        data: {
          type: 'LEAD_LOST',
          message: `Marked ${lead.firstName} ${lead.lastName} as lost`,
          userId: auth.id,
          leadId: lead.id,
        },
      });
    }
    if (input.assignedToId !== undefined && auth.role === 'ADMIN' && input.assignedToId !== existing.assignedToId) {
      await db.activity.create({
        data: {
          type: 'LEAD_ASSIGNED',
          message: lead.assignedTo
            ? `Assigned ${lead.firstName} ${lead.lastName} to ${lead.assignedTo.name}`
            : `Unassigned ${lead.firstName} ${lead.lastName}`,
          userId: auth.id,
          leadId: lead.id,
        },
      });
    }

    return ok<SafeLead>(serializeLead(lead));
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

    await db.lead.delete({ where: { id } });
    await db.activity.create({
      data: {
        type: 'LEAD_DELETED',
        message: `Deleted lead ${lead.firstName} ${lead.lastName}`,
        userId: auth.id,
      },
    });

    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
