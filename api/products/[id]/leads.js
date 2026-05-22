import prisma from '../../_lib/db.js';
import { requireRole, handleAuthError } from '../../_lib/auth.js';
import { ok, forbidden, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/products/:id/leads
 * Returns the interested buyers list for a product.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);

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

  const leads = await prisma.lead.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'desc' },
  });

  return ok(res, leads);
}
