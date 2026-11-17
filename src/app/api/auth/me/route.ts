// GET /api/auth/me - current session user (401 when unauthenticated)

import { getSessionUser } from '@/lib/auth';
import { handleApiError, fail } from '@/lib/api-helpers';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail(401, 'Authentication required');
    }
    return Response.json({ success: true, data: user });
  } catch (err) {
    return handleApiError(err);
  }
}
