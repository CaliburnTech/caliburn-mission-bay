import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, notFound, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/products/:id/leads
 * Returns the interested buyers list for a product.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const { id } = req.query;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.companyId !== auth.effectiveCompanyId) return notFound(res);

    const leads = await prisma.lead.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });

    return ok(res, leads);
  },
  { auth: 'seller' }
);
