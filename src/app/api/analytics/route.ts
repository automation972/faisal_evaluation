// GET /api/analytics - real-time dashboard metrics computed from PostgreSQL (RBAC scoped)

import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser } from '@/lib/api-helpers';
import { cached } from '@/lib/cache';
import { PIPELINE_STAGES } from '@/lib/constants';
import type {
  AnalyticsResult,
  StageCount,
  WeeklyPoint,
  SourceCount,
  RepStat,
} from '@/types';

export async function GET() {
  try {
    const auth = await requireUser();

    // Analytics recomputes ~20 aggregate queries. Clients poll it, so an 8s
    // per-user cache makes polling nearly free while staying near-real-time.
    const result: AnalyticsResult = await cached(
      `analytics:${auth.id}:${auth.role}`,
      8_000,
      () => computeAnalytics(auth.id, auth.role),
    );
    return ok<AnalyticsResult>(result);
  } catch (err) {
    return handleApiError(err);
  }
}

async function computeAnalytics(
  userId: string,
  role: string,
): Promise<AnalyticsResult> {
  // Sales reps only see metrics for their own book of business
  const leadScope: Prisma.LeadWhereInput = {};
  const taskScope: Prisma.TaskWhereInput = {};
  if (role !== 'ADMIN') {
    leadScope.OR = [{ assignedToId: userId }, { createdById: userId }];
    taskScope.OR = [{ assignedToId: userId }, { createdById: userId }];
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // One fully parallel wave — every query is independent, so the whole
  // analytics payload costs ~1-2 network round trips instead of 8.
  const [
    totalLeads,
    openLeads,
    wonLeads,
    lostLeads,
    leadsThisMonth,
    stageGroups,
    sourceGroups,
    repGroups,
    wonAgg,
    openPipelineAgg,
    weeklyRows,
    wonByRep,
    allUsers,
    taskCounts,
  ] = await Promise.all([
    db.lead.count({ where: leadScope }),
    db.lead.count({
      where: { ...leadScope, status: 'OPEN', stage: { not: 'WON' } },
    }),
    db.lead.count({ where: { ...leadScope, stage: 'WON' } }),
    db.lead.count({ where: { ...leadScope, status: 'LOST' } }),
    db.lead.count({ where: { ...leadScope, createdAt: { gte: monthStart } } }),
    db.lead.groupBy({
      by: ['stage'],
      where: leadScope,
      _count: { _all: true },
      _sum: { value: true },
    }),
    db.lead.groupBy({
      by: ['source'],
      where: leadScope,
      _count: { _all: true },
    }),
    db.lead.groupBy({
      by: ['assignedToId'],
      where:
        role === 'ADMIN'
          ? { assignedToId: { not: null } }
          : { assignedToId: userId },
      _count: { _all: true },
      _sum: { value: true },
    }),
    db.lead.aggregate({
      where: { ...leadScope, stage: 'WON' },
      _sum: { value: true },
    }),
    // Open pipeline value = value of all leads not yet won
    db.lead.aggregate({
      where: { ...leadScope, stage: { not: 'WON' }, status: 'OPEN' },
      _sum: { value: true },
    }),
    // 8-week trend via raw SQL date_trunc (Neon PostgreSQL)
    role === 'ADMIN'
      ? db.$queryRaw<Array<{ week_start: Date; count: bigint }>>(Prisma.sql`
              SELECT date_trunc('week', "createdAt") AS week_start, COUNT(*)::bigint AS count
              FROM "Lead"
              WHERE "createdAt" >= NOW() - INTERVAL '8 weeks'
              GROUP BY 1
              ORDER BY 1 ASC
            `)
      : db.$queryRaw<Array<{ week_start: Date; count: bigint }>>(Prisma.sql`
              SELECT date_trunc('week', "createdAt") AS week_start, COUNT(*)::bigint AS count
              FROM "Lead"
              WHERE "createdAt" >= NOW() - INTERVAL '8 weeks'
                AND ("assignedToId" = ${userId} OR "createdById" = ${userId})
              GROUP BY 1
              ORDER BY 1 ASC
            `),
    // Merged groupBy — won count AND won value in one query (was two)
    db.lead.groupBy({
      by: ['assignedToId'],
      where: {
        ...(role === 'ADMIN' ? {} : leadScope),
        stage: 'WON',
        assignedToId: { not: null },
      },
      _count: { _all: true },
      _sum: { value: true },
    }),
    // Workspace members (small table) — rep details filtered in memory below
    db.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true },
    }),
    Promise.all([
      db.task.count({ where: taskScope }),
      db.task.count({ where: { ...taskScope, status: 'PENDING' } }),
      db.task.count({ where: { ...taskScope, status: 'IN_PROGRESS' } }),
      db.task.count({ where: { ...taskScope, status: 'COMPLETED' } }),
      db.task.count({
        where: {
          ...taskScope,
          status: { not: 'COMPLETED' },
          dueDate: { lt: now },
        },
      }),
      db.task.count({
        where: {
          ...taskScope,
          status: { not: 'COMPLETED' },
          dueDate: { gte: dayStart, lt: dayEnd },
        },
      }),
    ]),
  ]);

  const stageBreakdown: StageCount[] = PIPELINE_STAGES.map((stage) => {
    const group = stageGroups.find((g) => g.stage === stage);
    return {
      stage,
      count: group?._count._all ?? 0,
      value: group?._sum.value ?? 0,
    };
  });

  // Fill 8 weekly buckets (UTC, Monday-start to match date_trunc) with counts
  const weeklyTrend: WeeklyPoint[] = [];
  const nowUtc = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  // Monday of the current week (UTC midnight)
  const todayUtc = Date.UTC(
    nowUtc.getUTCFullYear(),
    nowUtc.getUTCMonth(),
    nowUtc.getUTCDate(),
  );
  const dow = (nowUtc.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  const currentWeekStart = new Date(todayUtc - dow * 24 * 60 * 60 * 1000);
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart.getTime() - i * weekMs);
    const key = weekStart.toISOString().slice(0, 10);
    const row = weeklyRows.find(
      (r) => new Date(r.week_start).toISOString().slice(0, 10) === key,
    );
    weeklyTrend.push({
      weekStart: weekStart.toISOString(),
      count: Number(row?.count ?? 0),
    });
  }

  const topSources: SourceCount[] = sourceGroups
    .map((g) => ({ source: g.source, count: g._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Leaderboard stats (details filtered from the in-memory workspace users)
  const repIds = repGroups
    .map((g) => g.assignedToId)
    .filter((v): v is string => !!v);
  const repUsers = allUsers.filter((u) => repIds.includes(u.id));
  const repLeaderboard: RepStat[] = repUsers
    .map((u) => {
      const g = repGroups.find((r) => r.assignedToId === u.id);
      const won = wonByRep.find((r) => r.assignedToId === u.id);
      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        totalLeads: g?._count._all ?? 0,
        wonLeads: won?._count._all ?? 0,
        openValue: g?._sum.value ?? 0,
        wonValue: won?._sum.value ?? 0,
      };
    })
    .sort((a, b) => b.wonLeads - a.wonLeads || b.totalLeads - a.totalLeads);

  const result: AnalyticsResult = {
    totals: {
      leads: totalLeads,
      openLeads,
      wonLeads,
      lostLeads,
      pipelineValue: openPipelineAgg._sum.value ?? 0,
      wonValue: wonAgg._sum.value ?? 0,
      conversionRate:
        totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0,
      leadsThisMonth,
    },
    stageBreakdown,
    weeklyTrend,
    topSources,
    repLeaderboard,
    tasks: {
      total: taskCounts[0],
      pending: taskCounts[1],
      inProgress: taskCounts[2],
      completed: taskCounts[3],
      overdue: taskCounts[4],
      dueToday: taskCounts[5],
    },
    generatedAt: now.toISOString(),
  };

  return result;
}
