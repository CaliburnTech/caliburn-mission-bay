import prisma from '../../_lib/db.js';
import { requireRole, handleAuthError } from '../../_lib/auth.js';
import { ok, forbidden, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/products/:id/stats
 * Returns 30-day aggregated metrics: views, configurations, leads.
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

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [views, configures, leads] = await Promise.all([
    prisma.event.count({ where: { productId: id, type: 'VIEW', createdAt: { gte: since } } }),
    prisma.event.count({ where: { productId: id, type: 'CONFIGURE', createdAt: { gte: since } } }),
    prisma.lead.count({ where: { productId: id, createdAt: { gte: since } } }),
  ]);

  return ok(res, { views, configurations: configures, leads, period: '30d' });
}
