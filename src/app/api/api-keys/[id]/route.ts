// DELETE /api/api-keys/[id] - admin revokes a key

import { db } from '@/lib/db';
import { handleApiError, ok, requireUser, requireRole, ApiError } from '@/lib/api-helpers';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    requireRole(auth, ['ADMIN']);

    const { id } = await params;
    const key = await db.apiKey.findUnique({ where: { id } });
    if (!key) throw new ApiError(404, 'API key not found');

    await db.apiKey.delete({ where: { id } });
    await db.activity.create({
      data: {
        type: 'API_KEY_REVOKED',
        message: `API key "${key.name}" was revoked`,
        userId: auth.id,
      },
    });

    return ok({ revoked: true });
  } catch (err) {
    return handleApiError(err);
  }
}
