import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET /api/marketplace/platforms
 * Returns all APPROVED platforms. Requires authentication.
 */
export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const products = await prisma.product.findMany({
      where: { type: 'PLATFORM', status: 'APPROVED' },
      include: { company: { select: { id: true, name: true, logoUrl: true } } },
      orderBy: { name: 'asc' },
    });

    return ok(res, products);
  },
  { auth: 'user' }
);
