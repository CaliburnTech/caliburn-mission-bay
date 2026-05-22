import prisma from '../../_lib/db.js';
import { requireRole, handleAuthError } from '../../_lib/auth.js';
import { ok, forbidden, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET /api/products/:id/configs
 * Returns the most popular saved configurations that include this product,
 * along with the other products co-configured with it (the SBOM view).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  let user;
  try {
    user = await requireRole('SELLER')(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  if (!user.companyId) return forbidden(res, 'No company associated with this account');

  const { id } = req.query;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.companyId !== user.companyId) return notFound(res);

  // Find all configs that contain this product, with their full product lists
  const configProducts = await prisma.configurationProduct.findMany({
    where: { productId: id },
    include: {
      config: {
        include: {
          products: {
            include: { product: { select: { id: true, name: true, type: true, category: true } } },
          },
        },
      },
    },
    orderBy: { config: { updatedAt: 'desc' } },
    take: 20,
  });

  // Group by config name/shape to surface "popular" combinations
  const configSummaries = configProducts.map((cp) => ({
    configId: cp.configId,
    configName: cp.config.name,
    coProducts: cp.config.products
      .filter((p) => p.productId !== id)
      .map((p) => p.product),
  }));

  return ok(res, configSummaries);
}
