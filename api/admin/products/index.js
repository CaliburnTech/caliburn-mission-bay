import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/admin/products
 * Returns products awaiting Caliburn action:
 *   - IN_REVIEW  → admin can approve / reject
 *   - APPROVED   → admin can publish (or re-publish an update)
 * Each row carries its company and its latest published version (if any),
 * so the admin UI can show what still needs publishing.
 */
export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const products = await prisma.product.findMany({
      where: { status: { in: ['IN_REVIEW', 'APPROVED'] } },
      include: {
        company: { select: { id: true, name: true } },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
          select: { versionNumber: true, publishedAt: true },
        },
      },
      orderBy: { updatedAt: 'asc' },
    });

    return ok(res, products);
  },
  { auth: 'admin' }
);
