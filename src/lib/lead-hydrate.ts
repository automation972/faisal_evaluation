// Young10 Marketing CRM - in-memory relation hydration
//
// The database is a remote PostgreSQL: every query costs a ~200ms network
// round trip, and Prisma `include` adds one extra sequential query per
// relation. Loading relations inside the query plan made simple reads cost
// 3-6 round trips (~1-2s).
//
// Users and leads are small tables, so we cache lightweight maps of them
// (TTL, busted on mutations) and stitch relations in memory. Every list
// endpoint then becomes a SINGLE flat query - one round trip.

import { db } from '@/lib/db';
import { cached } from '@/lib/cache';
import type { LeadAssignee, PipelineStage, SafeLead, SafeTask } from '@/types';

export type LeadLite = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  stage: PipelineStage;
};

type UsersBundle = { users: LeadAssignee[]; map: Map<string, LeadAssignee> };
type LeadsBundle = { leads: LeadLite[]; map: Map<string, LeadLite> };

/** Lightweight workspace users (cached 15s; busted by mutations). */
export async function loadUsersBundle(): Promise<UsersBundle> {
  const users = await cached('hydrate:users', 15_000, async () => {
    const rows = await db.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, role: true },
    });
    return rows as LeadAssignee[];
  });
  const map = new Map(users.map((u) => [u.id, u]));
  return { users, map };
}

/** Lightweight leads list (cached 10s; busted by lead mutations). */
export async function loadLeadsBundle(): Promise<LeadsBundle> {
  const leads = await cached('hydrate:leads', 10_000, async () => {
    const rows = await db.lead.findMany({
      select: { id: true, firstName: true, lastName: true, company: true, stage: true },
    });
    return rows as LeadLite[];
  });
  const map = new Map(leads.map((l) => [l.id, l]));
  return { leads, map };
}

type LeadScalars = Omit<SafeLead, 'assignedTo' | 'createdBy'>;

/** Stitch a flat lead row with user relations from the cached map. */
export function serializeLeadWith(lead: LeadScalars, users: Map<string, LeadAssignee>): SafeLead {
  const assignedTo = lead.assignedToId ? users.get(lead.assignedToId) ?? null : null;
  const createdBy = lead.createdById ? users.get(lead.createdById) ?? null : null;
  return {
    ...lead,
    assignedTo,
    createdBy,
  };
}

type TaskScalars = Omit<SafeTask, 'assignedTo' | 'lead'>;

/** Stitch a flat task row with its user + lead relations from cached maps. */
export function serializeTaskWith(
  task: TaskScalars,
  users: Map<string, LeadAssignee>,
  leads: Map<string, LeadLite>,
): SafeTask {
  const assignedTo = task.assignedToId ? users.get(task.assignedToId) ?? null : null;
  const leadRow = task.leadId ? leads.get(task.leadId) ?? null : null;
  return {
    ...task,
    assignedTo,
    lead: leadRow
      ? {
          id: leadRow.id,
          firstName: leadRow.firstName,
          lastName: leadRow.lastName,
          company: leadRow.company,
          stage: leadRow.stage,
        }
      : null,
  };
}
