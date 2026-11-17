// POST /api/v1/leads/ingest - SECURE external lead intake
//
// Authentication: header "x-api-key: <generated key>" (managed by admins in the CRM)
// Rate limit: 30 requests / minute per API key
// Body: { firstName, lastName, email?, phone?, company?, jobTitle?, source?, notes?, value? }
//
// Example:
//   curl -X POST https://<host>/api/v1/leads/ingest \
//     -H "Content-Type: application/json" \
//     -H "x-api-key: y10_xxxxxxxx..." \
//     -d '{"firstName":"Jane","lastName":"Doe","email":"jane@acme.com","company":"Acme"}'

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, fail } from '@/lib/api-helpers';
import { bustCache } from '@/lib/cache';
import { ingestLeadSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import type { IngestResponse } from '@/types';

function nullOr(value: string | undefined | ''): string | null {
  return value ? value : null;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return fail(401, 'Missing x-api-key header');
    }

    const keyRecord = await db.apiKey.findUnique({ where: { key: apiKey } });
    if (!keyRecord || !keyRecord.active) {
      return fail(401, 'Invalid or revoked API key');
    }

    const rl = rateLimit(`ingest:${keyRecord.id}`, 30, 60_000);
    if (!rl.allowed) {
      return fail(429, `Rate limit exceeded. Retry in ${rl.retryAfterSec}s`);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail(400, 'Request body must be valid JSON');
    }
    const input = ingestLeadSchema.parse(body);

    // Create is ONE round trip; activity + lastUsedAt are fire-and-forget
    // (webhooks must return as fast as possible).
    const lead = await db.lead.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: nullOr(input.email),
        phone: nullOr(input.phone),
        company: nullOr(input.company),
        jobTitle: nullOr(input.jobTitle),
        source: input.source ?? 'WEBSITE',
        stage: 'NEW',
        status: 'OPEN',
        value: input.value ?? 0,
        notes: nullOr(input.notes),
        createdViaApi: true,
      },
      select: { id: true, firstName: true, lastName: true, company: true },
    });

    void db.activity
      .create({
        data: {
          type: 'EXTERNAL_LEAD',
          message: `New lead ${lead.firstName} ${lead.lastName} received via API key "${keyRecord.name}"`,
          leadId: lead.id,
        },
      })
      .catch(() => null);

    void db.apiKey
      .update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } })
      .catch(() => null);

    bustCache('leads:list');
    bustCache('hydrate:leads');
    bustCache('analytics');
    bustCache('activities');

    const res = {
      leadId: lead.id,
      message: 'Lead captured successfully',
    } satisfies IngestResponse;

    return Response.json({ success: true, data: res }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
