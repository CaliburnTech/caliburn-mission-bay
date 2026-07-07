import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { sendConfigSaved } from '../_lib/email.js';
import { ok, created, badRequest, unauthorized, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET  /api/configurations  — buyer's saved configs
 * POST /api/configurations  — save a new config
 */
export default withHandler(
  async (req, res, auth) => {
    // Auth resolved a valid token but no DB user row: nothing can be scoped
    // to this user yet. Never fall through to an unscoped query.
    if (!auth.id) return unauthorized(res, 'Account setup incomplete — complete onboarding first');

    if (req.method === 'GET') {
      const configs = await prisma.savedConfiguration.findMany({
        where: { userId: auth.id },
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
      // SavedConfiguration.companyId is required (org-scoped) in the schema.
      if (!auth.effectiveCompanyId) {
        return badRequest(res, 'A company is required to save configurations — complete onboarding first');
      }

      const config = await prisma.savedConfiguration.create({
        data: {
          userId: auth.id,
          companyId: auth.effectiveCompanyId,
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

      // Fire-and-forget — email failure must not block the save response
      sendConfigSaved({ buyerEmail: auth.email, configName: name ?? 'Untitled' })
        .catch((err) => console.error('[configurations] config saved email failed:', err));

      return created(res, config);
    }

    return methodNotAllowed(res);
  },
  { auth: 'user' }
);
