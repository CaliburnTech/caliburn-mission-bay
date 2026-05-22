import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/products/:id/reject
 * Body: { reason?: string }
 * Returns product to DRAFT so the vendor can revise and resubmit.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }
  void admin;

  const { id } = req.query;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound(res);
  if (product.status !== 'IN_REVIEW') {
    return badRequest(res, `Product status is ${product.status}, expected IN_REVIEW`);
  }

  const updated = await prisma.product.update({ where: { id }, data: { status: 'DRAFT' } });
  return ok(res, updated);
}
