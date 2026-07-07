import prisma from './_lib/db.js';
import { withHandler } from './_lib/handler.js';
import { created, badRequest, unauthorized, methodNotAllowed } from './_lib/respond.js';
import { sendLeadCreated } from './_lib/email.js';
import { generateSbomForConfig } from './sbom/generate.js';

/**
 * POST /api/purchase-requests
 * Body: { configId, message? }
 *
 * Full Buy flow:
 *   1. Create / update GarageItem → PURCHASE_REQUESTED
 *   2. Create PurchaseRequest record
 *   3. Create one Lead per product in the config (visible in maker dashboards)
 *   4. Email Caliburn team (lead.created)
 *   5. Generate + store SBOM (sbom.generated) — fire-and-forget
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'POST') return methodNotAllowed(res);
    if (!auth.id) return unauthorized(res, 'Account setup incomplete — complete onboarding first');

    const { configId, message } = req.body ?? {};
    if (!configId) return badRequest(res, 'configId is required');

    const config = await prisma.savedConfiguration.findUnique({
      where: { id: configId },
      include: {
        user: { include: { company: true } },
        products: { include: { product: true } },
      },
    });

    if (!config || config.userId !== auth.id) {
      return badRequest(res, 'Config not found or does not belong to you');
    }

    // 1. Upsert garage item
    const garageItem = await prisma.garageItem.upsert({
      where: { configId },
      update: { status: 'PURCHASE_REQUESTED' },
      create: { userId: auth.id, configId, status: 'PURCHASE_REQUESTED' },
    });

    // 2. Create purchase request
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        userId: auth.id,
        configId,
        garageItemId: garageItem.id,
        message: message ?? null,
        status: 'PENDING',
      },
    });

    // 3. Create one Lead per product so each maker sees this buyer.
    //    Lead has no unique constraint, so createMany({ skipDuplicates })
    //    can't dedupe — check-then-create per product instead.
    const buyerCompany = config.user?.company?.name ?? null;
    const productNames = [];

    if (config.products?.length) {
      for (const { product } of config.products) {
        productNames.push(product.name);

        const existing = await prisma.lead.findFirst({
          where: { productId: product.id, userId: auth.id },
          select: { id: true },
        });
        if (existing) continue;

        await prisma.lead.create({
          data: {
            productId: product.id,
            userId: auth.id,
            buyerName: auth.name ?? auth.email,
            buyerCompany,
            email: auth.email,
          },
        });
      }
    }

    // 4. Email Caliburn team — fire-and-forget
    sendLeadCreated({
      buyerName: auth.name ?? auth.email,
      buyerEmail: auth.email,
      companyName: buyerCompany,
      configName: config.name ?? 'Untitled',
      productNames,
    }).catch((err) => console.error('[purchase-requests] lead email failed:', err));

    // 5. Generate SBOM — fire-and-forget so it never blocks the Buy response
    generateSbomForConfig(configId, auth.id)
      .catch((err) => console.error('[purchase-requests] SBOM generation failed:', err));

    return created(res, { purchaseRequest, garageItem });
  },
  { auth: 'user' }
);
