// GET /api/tasks - list (RBAC scoped) with counts
// POST /api/tasks - create task

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, ApiError } from '@/lib/api-helpers';
import { taskCreateSchema } from '@/lib/validation';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants';
import type { SafeTask, TaskListResult, TaskStatusValue, TaskPriorityValue } from '@/types';

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

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser();
    const sp = req.nextUrl.searchParams;

    const status = sp.get('status') ?? 'ALL';
    const priority = sp.get('priority') ?? 'ALL';
    const mine = sp.get('mine') === 'true';
    const leadId = sp.get('leadId');

    const scope: Prisma.TaskWhereInput = {};
    if (auth.role !== 'ADMIN' || mine) {
      scope.OR = [{ assignedToId: auth.id }, { createdById: auth.id }];
    }
    if (leadId) {
      scope.leadId = leadId;
    }
    if (status !== 'ALL' && (TASK_STATUSES as readonly string[]).includes(status)) {
      scope.status = status as TaskStatusValue;
    }
    if (priority !== 'ALL' && (TASK_PRIORITIES as readonly string[]).includes(priority)) {
      scope.priority = priority as TaskPriorityValue;
    }

    const [tasks, pending, inProgress, completed, overdue] = await Promise.all([
      db.task.findMany({
        where: scope,
        include: TASK_INCLUDE,
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 200,
      }),
      db.task.count({ where: { ...scope, status: 'PENDING' } }),
      db.task.count({ where: { ...scope, status: 'IN_PROGRESS' } }),
      db.task.count({ where: { ...scope, status: 'COMPLETED' } }),
      db.task.count({
        where: {
          ...scope,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const result: TaskListResult = {
      tasks: tasks.map(serializeTask),
      counts: { pending, inProgress, completed, overdue },
    };
    return ok<TaskListResult>(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await req.json().catch(() => null);
    const input = taskCreateSchema.parse(body);

    let leadId: string | null = null;
    const rawLeadId = nullOrValue(input.leadId);
    if (rawLeadId) {
      const lead = await db.lead.findUnique({ where: { id: rawLeadId } });
      if (!lead) throw new ApiError(400, 'Linked lead does not exist');
      if (auth.role !== 'ADMIN' && lead.assignedToId !== auth.id && lead.createdById !== auth.id) {
        throw new ApiError(403, 'You do not have access to this lead');
      }
      leadId = rawLeadId;
    }

    // Reps can only create tasks assigned to themselves
    let assignedToId: string | null = null;
    const rawAssignee = nullOrValue(input.assignedToId);
    if (auth.role === 'ADMIN' && rawAssignee) {
      const target = await db.user.findUnique({ where: { id: rawAssignee } });
      if (!target) throw new ApiError(400, 'Assigned user does not exist');
      assignedToId = target.id;
    } else if (auth.role !== 'ADMIN' || !rawAssignee) {
      assignedToId = auth.id;
    }

    const task = await db.task.create({
      data: {
        title: input.title,
        description: nullOrValue(input.description),
        dueDate: nullOrValue(input.dueDate) ? new Date(input.dueDate as string) : null,
        priority: input.priority,
        status: input.status,
        leadId,
        assignedToId,
        createdById: auth.id,
      },
      include: TASK_INCLUDE,
    });

    await db.activity.create({
      data: {
        type: 'TASK_CREATED',
        message: `Created task "${task.title}"`,
        userId: auth.id,
        leadId: task.leadId,
      },
    });

    return ok<SafeTask>(serializeTask(task), 201);
  } catch (err) {
    return handleApiError(err);
  }
}
