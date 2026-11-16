// GET /api/leads - searchable, filterable list (RBAC scoped)
// POST /api/leads - create lead
//
// Performance notes: the remote PostgreSQL adds ~200ms per query round trip,
// so this route uses ONE flat findMany (no Prisma `include`, which would add
// two more sequential queries) and stitches user relations in memory from a
// cached users map. Mutations bust both caches, so writes are always
// reflected immediately.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, parseIntParam, ApiError } from '@/lib/api-helpers';
import { cached, bustCache } from '@/lib/cache';
import { loadUsersBundle, serializeLeadWith } from '@/lib/lead-hydrate';
import { leadCreateSchema } from '@/lib/validation';
import { DEFAULT_PAGE_SIZE, PIPELINE_STAGES, LEAD_SOURCES, LEAD_STATUSES } from '@/lib/constants';
import type { SafeLead, LeadListResult, PipelineStage } from '@/types';

function orUndefined(value: string | undefined | null | ''): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value;
}

function nullOrValue(value: string | undefined | null | ''): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value;
}

type LeadRow = Prisma.LeadGetPayload<Record<never, never>>;

function serializeLeadFlat(lead: LeadRow): SafeLead {
  // Dates are serialized to ISO strings; relations are attached by hydrate
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastContactedAt: lead.lastContactedAt ? lead.lastContactedAt.toISOString() : null,
  } as SafeLead;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser();
    const sp = req.nextUrl.searchParams;

    const page = parseIntParam(sp.get('page'), 1, 1, 10000);
    const pageSize = parseIntParam(sp.get('pageSize'), DEFAULT_PAGE_SIZE, 1, 100);
    const search = (sp.get('search') ?? '').trim();
    const stage = sp.get('stage') ?? 'ALL';
    const status = sp.get('status') ?? 'ALL';
    const source = sp.get('source') ?? 'ALL';
    const assignedToId = sp.get('assignedToId') ?? 'ALL';
    const sort = sp.get('sort') ?? 'createdAt_desc';

    // RBAC: sales reps only see leads assigned to them or created by them
    const scope: Prisma.LeadWhereInput = {};
    if (auth.role !== 'ADMIN') {
      scope.OR = [{ assignedToId: auth.id }, { createdById: auth.id }];
    }

    if (stage !== 'ALL' && (PIPELINE_STAGES as readonly string[]).includes(stage)) {
      scope.stage = stage as PipelineStage;
    }
    if (status !== 'ALL' && (LEAD_STATUSES as readonly string[]).includes(status)) {
      scope.status = status as 'OPEN' | 'LOST';
    }
    if (source !== 'ALL' && (LEAD_SOURCES as readonly string[]).includes(source)) {
      scope.source = source as (typeof LEAD_SOURCES)[number];
    }
    if (assignedToId === 'UNASSIGNED') {
      scope.assignedToId = null;
    } else if (assignedToId !== 'ALL' && assignedToId) {
      scope.assignedToId = assignedToId;
    }

    if (search) {
      const term = { contains: search, mode: 'insensitive' as const };
      scope.AND = [
        {
          OR: [
            { firstName: term },
            { lastName: term },
            { email: term },
            { phone: term },
            { company: term },
            { jobTitle: term },
          ],
        },
      ];
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput =
      sort === 'createdAt_asc'
        ? { createdAt: 'asc' }
        : sort === 'value_desc'
          ? { value: 'desc' }
          : sort === 'value_asc'
            ? { value: 'asc' }
            : { createdAt: 'desc' };

    // Short TTL cache: the same filters are re-fetched constantly (pagination,
    // polling, multiple tabs). Mutations bust this cache.
    const cacheKey = `leads:list:${auth.id}:${auth.role}:${JSON.stringify({ scope, orderBy, page, pageSize })}`;
    const result: LeadListResult = await cached(cacheKey, 3_000, async () => {
      const [total, leads, usersBundle] = await Promise.all([
        db.lead.count({ where: scope }),
        db.lead.findMany({
          where: scope,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        loadUsersBundle(),
      ]);
      return {
        leads: leads.map((lead) => serializeLeadWith(serializeLeadFlat(lead), usersBundle.map)),
        total,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil(total / pageSize)),
      };
    });
    return ok<LeadListResult>(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await req.json().catch(() => null);
    const input = leadCreateSchema.parse(body);

    // Reps cannot assign leads to others
    let assignedToId: string | null = null;
    if (auth.role === 'ADMIN') {
      const raw = orUndefined(input.assignedToId);
      if (raw) {
        const target = await db.user.findUnique({ where: { id: raw }, select: { id: true } });
        if (!target) throw new ApiError(400, 'Assigned user does not exist');
        assignedToId = target.id;
      }
    } else {
      assignedToId = auth.id;
    }

    // Create is ONE round trip; the activity log is written fire-and-forget
    // (it never blocks the response).
    const displayName = `${input.firstName} ${input.lastName}`;
    const created = await db.lead.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: nullOrValue(input.email),
        phone: nullOrValue(input.phone),
        company: nullOrValue(input.company),
        jobTitle: nullOrValue(input.jobTitle),
        source: input.source,
        stage: input.stage,
        status: 'OPEN',
        value: input.value,
        notes: nullOrValue(input.notes),
        assignedToId,
        createdById: auth.id,
      },
    });

    void db.activity
      .create({
        data: {
          type: 'LEAD_CREATED',
          message: `Created lead ${displayName}${input.company ? ` at ${input.company}` : ''}`,
          userId: auth.id,
          leadId: created.id,
        },
      })
      .catch(() => null);

    bustCache('leads:list');
    bustCache('hydrate:leads');
    bustCache('analytics');
    bustCache('activities');

    // Hydrate relations from the cached users map (no extra DB round trip)
    const usersBundle = await loadUsersBundle();
    const lead = serializeLeadWith(serializeLeadFlat(created), usersBundle.map);
    return ok<SafeLead>(lead, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
