// POST /api/leads/[id]/assign - admin assigns / reassigns / unassigns a lead

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';
import type { SafeLead } from '@/types';

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const assignedToId = (body as { assignedToId?: string } | null)?.assignedToId ?? null;

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Lead not found');

    let data: Prisma.LeadUpdateInput;
    if (assignedToId === null || assignedToId === '') {
      data = { assignedTo: { disconnect: true } };
    } else {
      const target = await db.user.findUnique({ where: { id: assignedToId } });
      if (!target) throw new ApiError(400, 'Assigned user does not exist');
      data = { assignedTo: { connect: { id: target.id } } };
    }

    const lead = await db.lead.update({ where: { id }, data, include: LEAD_INCLUDE });

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

    return ok<SafeLead>(serializeLead(lead));
  } catch (err) {
    return handleApiError(err);
  }
}
