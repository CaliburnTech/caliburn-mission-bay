import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, badRequest, methodNotAllowed } from '../_lib/respond.js';

const VALID_TYPES = ['VIEW', 'CONFIGURE', 'PURCHASE_REQUEST'];

/**
 * POST /api/marketplace/events
 * Body: { productId, type, metadata? }
 * Fire-and-forget analytics. Called from the buyer-facing marketplace SPA.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { productId, type, metadata } = req.body ?? {};

    if (!productId) return badRequest(res, 'productId is required');
    if (!VALID_TYPES.includes(type)) {
      return badRequest(res, `type must be one of: ${VALID_TYPES.join(', ')}`);
    }

    await prisma.event.create({
      // Event.userId is optional — auth.id may be null pre-onboarding.
      data: { productId, userId: auth.id, type, metadata: metadata ?? undefined },
    });

    return ok(res, { recorded: true });
  },
  { auth: 'user' }
);
