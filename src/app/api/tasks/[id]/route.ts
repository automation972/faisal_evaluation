// PATCH / DELETE /api/tasks/[id]

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, ApiError } from '@/lib/api-helpers';
import { taskUpdateSchema } from '@/lib/validation';
import type { SafeTask } from '@/types';

const TASK_INCLUDE = {
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  lead: { select: { id: true, firstName: true, lastName: true, company: true, stage: true } },
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

function serializeTask(task: TaskWithRelations): SafeTask {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    assignedTo: task.assignedTo,
    lead: task.lead,
  };
}

function nullOrValue(value: string | undefined | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value;
}

async function loadVisibleTask(id: string, authId: string, isAdmin: boolean) {
  const task = await db.task.findUnique({ where: { id }, include: TASK_INCLUDE });
  if (!task) throw new ApiError(404, 'Task not found');
  if (isAdmin) return task;

  const assignedToMe = task.assignedToId === authId;
  const createdByMe = task.createdById === authId;
  if (assignedToMe || createdByMe) return task;

  // Tasks linked to a lead are visible to anyone who can see that lead
  if (task.leadId) {
    const lead = await db.lead.findUnique({ where: { id: task.leadId }, select: { assignedToId: true, createdById: true } });
    if (lead && (lead.assignedToId === authId || lead.createdById === authId)) return task;
  }

  throw new ApiError(403, 'You do not have access to this task');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    const { id } = await params;
    const existing = await loadVisibleTask(id, auth.id, auth.role === 'ADMIN');

    const body = await req.json().catch(() => null);
    const input = taskUpdateSchema.parse(body);

    const data: Prisma.TaskUpdateInput = {
      title: input.title,
      description: nullOrValue(input.description),
      priority: input.priority,
      status: input.status,
    };

    if (input.dueDate !== undefined) {
      const raw = nullOrValue(input.dueDate);
      data.dueDate = raw ? new Date(raw) : null;
    }
    if (input.leadId !== undefined) {
      const raw = nullOrValue(input.leadId);
      if (raw) {
        const lead = await db.lead.findUnique({ where: { id: raw } });
        if (!lead) throw new ApiError(400, 'Linked lead does not exist');
        data.lead = { connect: { id: raw } };
      } else {
        data.lead = { disconnect: true };
      }
    }
    if (input.assignedToId !== undefined) {
      const raw = nullOrValue(input.assignedToId);
      if (raw) {
        const target = await db.user.findUnique({ where: { id: raw } });
        if (!target) throw new ApiError(400, 'Assigned user does not exist');
        data.assignedTo = { connect: { id: target.id } };
      } else {
        data.assignedTo = { disconnect: true };
      }
    }

    if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      data.completedAt = new Date();
    }
    if (input.status !== undefined && input.status !== 'COMPLETED' && existing.status === 'COMPLETED') {
      data.completedAt = null;
    }

    const task = await db.task.update({ where: { id }, data, include: TASK_INCLUDE });

    if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      await db.activity.create({
        data: {
          type: 'TASK_COMPLETED',
          message: `Completed task "${task.title}"`,
          userId: auth.id,
          leadId: task.leadId,
        },
      });
    }

    return ok<SafeTask>(serializeTask(task));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    const { id } = await params;
    const task = await loadVisibleTask(id, auth.id, auth.role === 'ADMIN');

    await db.task.delete({ where: { id } });
    await db.activity.create({
      data: {
        type: 'TASK_DELETED',
        message: `Deleted task "${task.title}"`,
        userId: auth.id,
      },
    });

    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
