import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, notFound, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/products/:id/stats
 * Returns 30-day aggregated metrics: views, configurations, leads.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const { id } = req.query;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.companyId !== auth.effectiveCompanyId) return notFound(res);

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [views, configures, leads] = await Promise.all([
      prisma.event.count({ where: { productId: id, type: 'VIEW', createdAt: { gte: since } } }),
      prisma.event.count({ where: { productId: id, type: 'CONFIGURE', createdAt: { gte: since } } }),
      prisma.lead.count({ where: { productId: id, createdAt: { gte: since } } }),
    ]);

    return ok(res, { views, configurations: configures, leads, period: '30d' });
  },
  { auth: 'seller' }
);
