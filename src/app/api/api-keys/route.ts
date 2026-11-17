// GET /api/api-keys - admin lists keys
// POST /api/api-keys - admin creates a key (full key returned once at creation)

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, requireRole } from '@/lib/api-helpers';
import { apiKeyCreateSchema } from '@/lib/validation';
import type { SafeApiKey } from '@/types';

function generateKey(): { key: string; prefix: string } {
  const bytes = Array.from({ length: 24 }, () => Math.floor(Math.random() * 256));
  const random = bytes.map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 40);
  const key = `y10_${random}`;
  return { key, prefix: key.slice(0, 10) };
}

export async function GET() {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);

    const keys = await db.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, key: true, prefix: true, active: true, lastUsedAt: true, createdAt: true },
    });

    const data: SafeApiKey[] = keys.map((k) => ({
      ...k,
      lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
      createdAt: k.createdAt.toISOString(),
    }));

    return ok<SafeApiKey[]>(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);

    const body = await req.json().catch(() => null);
    const input = apiKeyCreateSchema.parse(body);

    const { key, prefix } = generateKey();
    const record = await db.apiKey.create({
      data: { name: input.name, key, prefix, createdById: auth.id },
      select: { id: true, name: true, key: true, prefix: true, active: true, lastUsedAt: true, createdAt: true },
    });

    await db.activity.create({
      data: {
        type: 'API_KEY_CREATED',
        message: `API key "${record.name}" created`,
        userId: auth.id,
      },
    });

    return ok<SafeApiKey>(
      {
        ...record,
        lastUsedAt: record.lastUsedAt ? record.lastUsedAt.toISOString() : null,
        createdAt: record.createdAt.toISOString(),
      },
      201,
    );
  } catch (err) {
    return handleApiError(err);
  }
}
