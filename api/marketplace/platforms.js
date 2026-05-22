import prisma from '../_lib/db.js';
import { requireAuth, handleAuthError } from '../_lib/auth.js';
import { ok, serverError, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET /api/marketplace/platforms
 * Returns all APPROVED platforms. Requires authentication.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const products = await prisma.product.findMany({
    where: { type: 'PLATFORM', status: 'APPROVED' },
    include: { company: { select: { id: true, name: true, logoUrl: true } } },
    orderBy: { name: 'asc' },
  });

  return ok(res, products);
}
