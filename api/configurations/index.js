import prisma from '../_lib/db.js';
import { requireAuth, handleAuthError } from '../_lib/auth.js';
import { ok, created, badRequest, serverError, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET  /api/configurations  — buyer's saved configs
 * POST /api/configurations  — save a new config
 */
export default async function handler(req, res) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  if (req.method === 'GET') {
    const configs = await prisma.savedConfiguration.findMany({
      where: { userId: user.id },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, type: true, category: true } },
            version: { select: { id: true, versionNumber: true } },
          },
        },
        garageItem: { select: { id: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return ok(res, configs);
  }

  if (req.method === 'POST') {
    const { name, configData, productVersions } = req.body ?? {};

    if (!configData) return badRequest(res, 'configData is required');

    const config = await prisma.savedConfiguration.create({
      data: {
        userId: user.id,
        name: name ?? null,
        configData,
        products: productVersions?.length
          ? {
              create: productVersions.map(({ productId, productVersionId }) => ({
                productId,
                productVersionId,
              })),
            }
          : undefined,
      },
      include: { products: true },
    });

    return created(res, config);
  }

  return methodNotAllowed(res);
}
