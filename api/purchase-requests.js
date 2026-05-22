import prisma from './_lib/db.js';
import { requireAuth, handleAuthError } from './_lib/auth.js';
import { created, badRequest, serverError, methodNotAllowed } from './_lib/respond.js';
import { notifyPurchaseRequest } from './_lib/ses.js';

/**
 * POST /api/purchase-requests
 * Body: { configId, message? }
 *
 * Submits a purchase request for a saved configuration.
 * Creates/updates the garage item to PURCHASE_REQUESTED and fires a notification.
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
    include: { user: { include: { company: true } } },
  });

  if (!config || config.userId !== user.id) {
    return badRequest(res, 'Config not found or does not belong to you');
  }

  // Upsert garage item at PURCHASE_REQUESTED status
  const garageItem = await prisma.garageItem.upsert({
    where: { configId },
    update: { status: 'PURCHASE_REQUESTED' },
    create: { userId: user.id, configId, status: 'PURCHASE_REQUESTED' },
  });

  const purchaseRequest = await prisma.purchaseRequest.create({
    data: {
      userId: user.id,
      configId,
      garageItemId: garageItem.id,
      message: message ?? null,
      status: 'PENDING',
    },
  });

  await notifyPurchaseRequest({
    buyerName: user.name ?? user.email,
    buyerEmail: user.email,
    configName: config.name ?? 'Unnamed configuration',
    companyName: user.company?.name ?? 'Unknown',
  }).catch(console.error);

  return created(res, { purchaseRequest, garageItem });
}
