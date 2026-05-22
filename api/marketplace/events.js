import prisma from '../_lib/db.js';
import { requireAuth, handleAuthError } from '../_lib/auth.js';
import { ok, badRequest, serverError, methodNotAllowed } from '../_lib/respond.js';

const VALID_TYPES = ['VIEW', 'CONFIGURE', 'PURCHASE_REQUEST'];

/**
 * POST /api/marketplace/events
 * Body: { productId, type, metadata? }
 * Fire-and-forget analytics. Called from the buyer-facing marketplace SPA.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { productId, type, metadata } = req.body ?? {};

  if (!productId) return badRequest(res, 'productId is required');
  if (!VALID_TYPES.includes(type)) {
    return badRequest(res, `type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  await prisma.event.create({
    data: { productId, userId: user.id, type, metadata: metadata ?? undefined },
  });

  return ok(res, { recorded: true });
}
