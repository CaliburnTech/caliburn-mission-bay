import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, badRequest, forbidden, notFound, methodNotAllowed } from '../../_lib/respond.js';
import { sendConfigUpdated } from '../../_lib/email.js';

/**
 * POST /api/products/:id/publish
 * Body: { changelog?: string }
 *
 * Creates a new ProductVersion snapshot, updates all buyer saved configs
 * that reference the previous version, and notifies affected buyers.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    // ProductVersion.publishedById references a DB User row.
    if (!auth.id) {
      return forbidden(res, 'Publishing requires a user record — complete onboarding first');
    }

    const { id } = req.query;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    });

    if (!product || product.companyId !== auth.effectiveCompanyId) return notFound(res);
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
        publishedById: auth.id,
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
            data: { hasVendorUpdate: true, updatedAt: new Date() },
          });

          if (cp.config.user?.email) {
            await sendConfigUpdated({
              buyerEmail: cp.config.user.email,
              productName: product.name,
              configName: cp.config.name ?? 'Unnamed configuration',
            }).catch(console.error); // don't fail the publish if email fails
          }
        })
      );
    }

    return ok(res, { version: newVersion, updatedConfigs: true });
  },
  { auth: 'seller' }
);
