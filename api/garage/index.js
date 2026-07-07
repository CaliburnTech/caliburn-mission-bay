import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, created, badRequest, unauthorized, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET  /api/garage  — buyer's garage items
 * POST /api/garage  — move a saved config into the garage
 */
export default withHandler(
  async (req, res, auth) => {
    // Must scope by the resolved DB user id — never run an unscoped query.
    if (!auth.id) return unauthorized(res, 'Account setup incomplete — complete onboarding first');

    if (req.method === 'GET') {
      const items = await prisma.garageItem.findMany({
        where: { userId: auth.id },
        include: {
          config: {
            include: {
              products: {
                include: { product: { select: { id: true, name: true, type: true } } },
              },
            },
          },
          purchaseRequests: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return ok(res, items);
    }

    if (req.method === 'POST') {
      const { configId } = req.body ?? {};
      if (!configId) return badRequest(res, 'configId is required');

      const config = await prisma.savedConfiguration.findUnique({ where: { id: configId } });
      if (!config || config.userId !== auth.id) {
        return badRequest(res, 'Config not found or does not belong to you');
      }

      const existing = await prisma.garageItem.findUnique({ where: { configId } });
      if (existing) return ok(res, existing);

      const item = await prisma.garageItem.create({
        data: { userId: auth.id, configId, status: 'SAVED' },
      });
      return created(res, item);
    }

    return methodNotAllowed(res);
  },
  { auth: 'user' }
);
