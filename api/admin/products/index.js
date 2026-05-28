import prisma from '../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../_lib/auth.js';
import { ok, serverError, methodNotAllowed } from '../../_lib/respond.js';
import { handleCors } from '../../_lib/cors.js';

/**
 * GET /api/admin/products
 * Returns all products currently IN_REVIEW for Caliburn to approve or reject.
 */
export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }
  void admin;

  const products = await prisma.product.findMany({
    where: { status: 'IN_REVIEW' },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { updatedAt: 'asc' },
  });

  return ok(res, products);
}
