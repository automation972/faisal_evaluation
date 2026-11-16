// POST /api/auth/logout

import { clearSessionCookie } from '@/lib/auth';
import { handleApiError, ok } from '@/lib/api-helpers';

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ loggedOut: true });
  } catch (err) {
    return handleApiError(err);
  }
}
