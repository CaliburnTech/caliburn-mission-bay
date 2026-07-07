import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/products/:id/approve
 * Moves a product from IN_REVIEW to APPROVED so the vendor can publish it.
 */
export default withHandler(
  async (req, res) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return notFound(res);
    if (product.status !== 'IN_REVIEW') {
      return badRequest(res, `Product status is ${product.status}, expected IN_REVIEW`);
    }

    const updated = await prisma.product.update({ where: { id }, data: { status: 'APPROVED' } });
    return ok(res, updated);
  },
  { auth: 'admin' }
);
