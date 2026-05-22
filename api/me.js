import { requireAuth, handleAuthError } from './_lib/auth.js';
import { ok, serverError, methodNotAllowed } from './_lib/respond.js';

/**
 * GET /api/me
 * Returns the authenticated user with their company.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  return ok(res, user);
}
