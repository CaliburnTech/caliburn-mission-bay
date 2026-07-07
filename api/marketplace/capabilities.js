import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET /api/marketplace/capabilities
 * Returns published capabilities (APPROVED with at least one published
 * ProductVersion), including the latest version's snapshot (SWaP + custom
 * fields) so the configurator can render specs.
 *
 * PUBLIC for now (anonymous catalog browsing during launch). This will be
 * re-gated to authenticated/vetted buyers later — flip `auth` back to 'user'.
 */
export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const products = await prisma.product.findMany({
      where: { type: 'CAPABILITY', status: 'APPROVED', currentVersionId: { not: null } },
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
          select: { data: true, swapJson: true, missionTags: true, platformTags: true, versionNumber: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return ok(res, products);
  },
  { auth: 'none' }
);
