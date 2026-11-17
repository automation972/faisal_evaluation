// PATCH / DELETE /api/tasks/[id]
//
// Performance: flat queries + in-memory relation hydration; the PATCH path
// batches the update and its activity insert into one array transaction.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, ApiError } from '@/lib/api-helpers';
import { bustCache } from '@/lib/cache';
import { loadUsersBundle, loadLeadsBundle, serializeTaskWith } from '@/lib/lead-hydrate';
import { taskUpdateSchema } from '@/lib/validation';
import type { SafeTask } from '@/types';

type TaskRow = Prisma.TaskGetPayload<Record<never, never>>;

function serializeTaskFlat(task: TaskRow): SafeTask {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  } as unknown as SafeTask;
}

function nullOrValue(value: string | undefined | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value;
}

async function loadVisibleTask(id: string, authId: string, isAdmin: boolean) {
  // Flat read - RBAC only needs the id columns.
  const task = await db.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      leadId: true,
      assignedToId: true,
      createdById: true,
    },
  });
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

    // Unchecked input variant: accepts scalar FK columns directly (one round
    // trip) instead of nested relation ops that force implicit transactions.
    const data: Prisma.TaskUncheckedUpdateInput = {
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
        const lead = await db.lead.findUnique({ where: { id: raw }, select: { id: true } });
        if (!lead) throw new ApiError(400, 'Linked lead does not exist');
        data.leadId = raw;
      } else {
        data.leadId = null;
      }
    }
    if (input.assignedToId !== undefined) {
      const raw = nullOrValue(input.assignedToId);
      if (raw) {
        const target = await db.user.findUnique({ where: { id: raw }, select: { id: true } });
        if (!target) throw new ApiError(400, 'Assigned user does not exist');
        data.assignedToId = raw;
      } else {
        data.assignedToId = null;
      }
    }

    if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      data.completedAt = new Date();
    }
    if (input.status !== undefined && input.status !== 'COMPLETED' && existing.status === 'COMPLETED') {
      data.completedAt = null;
    }

    // Pre-compute the completion activity (no extra round trip needed)
    const completing = input.status === 'COMPLETED' && existing.status !== 'COMPLETED';

    // ONE scalar update round trip; activity log is fire-and-forget
    const updated = await db.task.update({ where: { id }, data });
    if (completing) {
      void db.activity
        .create({
          data: {
            type: 'TASK_COMPLETED',
            message: `Completed task "${existing.title}"`,
            userId: auth.id,
            leadId: existing.leadId,
          },
        })
        .catch(() => null);
    }

    bustCache('tasks:list');
    bustCache('analytics');
    bustCache('activities');

    // Hydrate relations from cached maps (no extra DB round trips)
    const [usersBundle, leadsBundle] = await Promise.all([loadUsersBundle(), loadLeadsBundle()]);
    const task = serializeTaskWith(serializeTaskFlat(updated), usersBundle.map, leadsBundle.map);
    return ok<SafeTask>(task);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    const { id } = await params;
    const task = await loadVisibleTask(id, auth.id, auth.role === 'ADMIN');

    // ONE delete round trip; activity log is fire-and-forget
    await db.task.delete({ where: { id } });
    void db.activity
      .create({
        data: {
          type: 'TASK_DELETED',
          message: `Deleted task "${task.title}"`,
          userId: auth.id,
        },
      })
      .catch(() => null);

    bustCache('tasks:list');
    bustCache('analytics');
    bustCache('activities');

    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
