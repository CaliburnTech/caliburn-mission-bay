import prisma from './_lib/db.js';
import { requireAuth, handleAuthError } from './_lib/auth.js';
import { created, badRequest, serverError, methodNotAllowed } from './_lib/respond.js';
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
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { configId, message } = req.body ?? {};
  if (!configId) return badRequest(res, 'configId is required');

  const config = await prisma.savedConfiguration.findUnique({
    where: { id: configId },
    include: {
      user: { include: { company: true } },
      products: { include: { product: true } },
    },
  });

  if (!config || config.userId !== user.id) {
    return badRequest(res, 'Config not found or does not belong to you');
  }

  // 1. Upsert garage item
  const garageItem = await prisma.garageItem.upsert({
    where: { configId },
    update: { status: 'PURCHASE_REQUESTED' },
    create: { userId: user.id, configId, status: 'PURCHASE_REQUESTED' },
  });

  // 2. Create purchase request
  const purchaseRequest = await prisma.purchaseRequest.create({
    data: {
      userId: user.id,
      configId,
      garageItemId: garageItem.id,
      message: message ?? null,
      status: 'PENDING',
    },
  });

  // 3. Create one Lead per product so each maker sees this buyer
  const buyerCompany = config.user?.company?.name ?? null;
  const productNames = [];

  if (config.products?.length) {
    const leadData = config.products.map(({ product }) => {
      productNames.push(product.name);
      return {
        productId: product.id,
        userId: user.id,
        buyerName: user.name ?? user.email,
        buyerCompany,
        email: user.email,
      };
    });
    await prisma.lead.createMany({ data: leadData, skipDuplicates: true });
  }

  // 4. Email Caliburn team — fire-and-forget
  sendLeadCreated({
    buyerName: user.name ?? user.email,
    buyerEmail: user.email,
    companyName: buyerCompany,
    configName: config.name ?? 'Untitled',
    productNames,
  }).catch((err) => console.error('[purchase-requests] lead email failed:', err));

  // 5. Generate SBOM — fire-and-forget so it never blocks the Buy response
  generateSbomForConfig(configId, user.id)
    .catch((err) => console.error('[purchase-requests] SBOM generation failed:', err));

  return created(res, { purchaseRequest, garageItem });
}
