import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/admin/products
 * Returns all products currently IN_REVIEW for Caliburn to approve or reject.
 */
export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const products = await prisma.product.findMany({
      where: { status: 'IN_REVIEW' },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'asc' },
    });

    return ok(res, products);
  },
  { auth: 'admin' }
);
