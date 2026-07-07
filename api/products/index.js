import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, created, badRequest, methodNotAllowed } from '../_lib/respond.js';
import { sanitizeSpec } from '../_lib/productSpec.js';

/**
 * GET  /api/products  — list vendor's own products
 * POST /api/products  — create a new product (starts as DRAFT)
 */
export default withHandler(
  async (req, res, auth) => {
    const companyId = auth.effectiveCompanyId;

    if (req.method === 'GET') {
      const products = await prisma.product.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { events: true, leads: true } } },
      });
      return ok(res, products);
    }

    if (req.method === 'POST') {
      const { type, name, description, category, trlLevel, specJson } = req.body ?? {};

      if (!['PLATFORM', 'CAPABILITY'].includes(type)) {
        return badRequest(res, 'type must be PLATFORM or CAPABILITY');
      }
      if (!name?.trim()) return badRequest(res, 'name is required');

      const product = await prisma.product.create({
        data: {
          companyId,
          type,
          name: name.trim(),
          description,
          category,
          trlLevel: trlLevel ? parseInt(trlLevel) : null,
          specJson: sanitizeSpec(specJson) ?? undefined,
          status: 'DRAFT',
        },
      });
      return created(res, product);
    }

    return methodNotAllowed(res);
  },
  { auth: 'seller' }
);
