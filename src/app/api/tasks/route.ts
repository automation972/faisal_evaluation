// GET /api/tasks - list (RBAC scoped) with counts
// POST /api/tasks - create task
//
// Performance: flat queries + in-memory relation hydration (see lead-hydrate)
// so the list costs one round trip instead of three sequential include queries.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, ApiError } from '@/lib/api-helpers';
import { cached, bustCache } from '@/lib/cache';
import { loadUsersBundle, loadLeadsBundle, serializeTaskWith } from '@/lib/lead-hydrate';
import { taskCreateSchema } from '@/lib/validation';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants';
import type { SafeTask, TaskListResult, TaskStatusValue, TaskPriorityValue } from '@/types';

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

    // Short TTL cache smooths polling / repeated switches between filters
    const cacheKey = `tasks:list:${auth.id}:${auth.role}:${JSON.stringify({ scope })}`;
    const result: TaskListResult = await cached(cacheKey, 3_000, async () => {
      const [tasks, pending, inProgress, completed, overdue, usersBundle, leadsBundle] =
        await Promise.all([
          db.task.findMany({
            where: scope,
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
          loadUsersBundle(),
          loadLeadsBundle(),
        ]);
      return {
        tasks: tasks.map((task) =>
          serializeTaskWith(serializeTaskFlat(task), usersBundle.map, leadsBundle.map),
        ),
        counts: { pending, inProgress, completed, overdue },
      };
    });
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
      const lead = await db.lead.findUnique({ where: { id: rawLeadId }, select: { id: true, assignedToId: true, createdById: true } });
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
      const target = await db.user.findUnique({ where: { id: rawAssignee }, select: { id: true } });
      if (!target) throw new ApiError(400, 'Assigned user does not exist');
      assignedToId = target.id;
    } else if (auth.role !== 'ADMIN' || !rawAssignee) {
      assignedToId = auth.id;
    }

    // Create is ONE round trip; the activity log is fire-and-forget
    const created = await db.task.create({
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
    });

    void db.activity
      .create({
        data: {
          type: 'TASK_CREATED',
          message: `Created task "${created.title}"`,
          userId: auth.id,
          leadId: created.leadId,
        },
      })
      .catch(() => null);

    bustCache('tasks:list');
    bustCache('analytics');
    bustCache('activities');

    // Hydrate relations from cached maps (no extra DB round trips)
    const [usersBundle, leadsBundle] = await Promise.all([loadUsersBundle(), loadLeadsBundle()]);
    const task = serializeTaskWith(serializeTaskFlat(created), usersBundle.map, leadsBundle.map);
    return ok<SafeTask>(task, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
