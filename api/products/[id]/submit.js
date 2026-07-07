import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../_lib/respond.js';

/**
 * POST /api/products/:id/submit
 * Moves a DRAFT product to IN_REVIEW for Caliburn to approve.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.companyId !== auth.effectiveCompanyId) return notFound(res);
    if (product.status !== 'DRAFT') {
      return badRequest(res, `Cannot submit a product with status: ${product.status}`);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status: 'IN_REVIEW' },
    });

    return ok(res, updated);
  },
  { auth: 'seller' }
);
