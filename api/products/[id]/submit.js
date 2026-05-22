import prisma from '../../_lib/db.js';
import { requireRole, handleAuthError } from '../../_lib/auth.js';
import { ok, badRequest, forbidden, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';

/**
 * POST /api/products/:id/submit
 * Moves a DRAFT product to IN_REVIEW for Caliburn to approve.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireRole('SELLER')(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  if (!user.companyId) return forbidden(res, 'No company associated with this account');

  const { id } = req.query;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || product.companyId !== user.companyId) return notFound(res);
  if (product.status !== 'DRAFT') {
    return badRequest(res, `Cannot submit a product with status: ${product.status}`);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { status: 'IN_REVIEW' },
  });

  return ok(res, updated);
}
