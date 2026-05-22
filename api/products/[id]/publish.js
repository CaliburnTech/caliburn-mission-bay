import prisma from '../../_lib/db.js';
import { requireRole, handleAuthError } from '../../_lib/auth.js';
import { ok, badRequest, forbidden, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';
import { notifyConfigUpdated } from '../../_lib/ses.js';

/**
 * POST /api/products/:id/publish
 * Body: { changelog?: string }
 *
 * Creates a new ProductVersion snapshot, updates all buyer saved configs
 * that reference the previous version, and notifies affected buyers.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireRole('SELLER')(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  if (!user.companyId) return forbidden(res, 'No company associated with this account');

  const { id } = req.query;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
  });

  if (!product || product.companyId !== user.companyId) return notFound(res);
  if (product.status !== 'APPROVED') {
    return badRequest(res, 'Only APPROVED products can be published');
  }

  const { changelog } = req.body ?? {};
  const prevVersionNumber = product.versions[0]?.versionNumber ?? 0;
  const nextVersionNumber = prevVersionNumber + 1;

  // Snapshot the current product data into a new version row
  const newVersion = await prisma.productVersion.create({
    data: {
      productId: id,
      versionNumber: nextVersionNumber,
      data: {
        name: product.name,
        description: product.description,
        category: product.category,
        trlLevel: product.trlLevel,
        type: product.type,
      },
      changelog: changelog ?? null,
      publishedById: user.id,
    },
  });

  await prisma.product.update({
    where: { id },
    data: { currentVersionId: newVersion.id },
  });

  // Find all saved configs that contain the previous version of this product
  if (prevVersionNumber > 0) {
    const prevVersion = product.versions[0];

    const affectedConfigProducts = await prisma.configurationProduct.findMany({
      where: { productId: id, productVersionId: prevVersion.id },
      include: {
        config: { include: { user: true } },
      },
    });

    // Update each to point at the new version and notify the buyer
    await Promise.all(
      affectedConfigProducts.map(async (cp) => {
        await prisma.configurationProduct.update({
          where: { configId_productId: { configId: cp.configId, productId: id } },
          data: { productVersionId: newVersion.id },
        });

        await prisma.savedConfiguration.update({
          where: { id: cp.configId },
          data: { updatedAt: new Date() },
        });

        if (cp.config.user?.email) {
          await notifyConfigUpdated({
            buyerEmail: cp.config.user.email,
            productName: product.name,
            configName: cp.config.name ?? 'Unnamed configuration',
          }).catch(console.error); // don't fail the publish if email fails
        }
      })
    );
  }

  return ok(res, { version: newVersion, updatedConfigs: true });
}
