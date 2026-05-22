import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { notifyNewLead, notifyPurchaseRequest } from '../../lib/ses';
import { getAuthContext } from '../../lib/auth';
import {
  ok,
  created,
  badRequest,
  notFound,
  methodNotAllowed,
  serverError,
} from '../../lib/response';

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /leads  (was POST /api/products/:id/leads in Vercel)
// Body: { productId, buyerName, buyerCompany?, email, phone? }
const createLead = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const { productId, buyerName, buyerCompany, email, phone } = body;

  if (!productId) return badRequest('productId is required');
  if (!(buyerName as string)?.trim()) return badRequest('buyerName is required');
  if (!(email as string)?.trim()) return badRequest('email is required');

  const product = await prisma.product.findFirst({
    where: { id: productId as string, status: 'APPROVED' },
    include: { company: { select: { email: true, name: true } } },
  });
  if (!product) return notFound();

  const lead = await prisma.lead.create({
    data: {
      productId: productId as string,
      userId: auth.userId ?? undefined,
      buyerName: (buyerName as string).trim(),
      buyerCompany: (buyerCompany as string) ?? undefined,
      email: (email as string).trim(),
      phone: (phone as string) ?? undefined,
    },
  });

  await notifyNewLead({
    buyerName: (buyerName as string).trim(),
    buyerEmail: (email as string).trim(),
    productName: product.name,
    vendorEmail: product.company?.email ?? undefined,
  }).catch(console.error);

  return created(lead);
};

// POST /leads/purchase-request  (was POST /api/purchase-requests in Vercel)
// Body: { configId, message? }
const createPurchaseRequest = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const { configId, message } = body;
  if (!configId) return badRequest('configId is required');

  const config = await prisma.savedConfiguration.findUnique({
    where: { id: configId as string },
    include: { user: { include: { company: true } } },
  });

  if (!config || config.userId !== auth.userId) {
    return badRequest('Config not found or does not belong to you');
  }

  const garageItem = await prisma.garageItem.upsert({
    where: { configId: configId as string },
    update: { status: 'PURCHASE_REQUESTED' },
    create: { userId: auth.userId, configId: configId as string, status: 'PURCHASE_REQUESTED' },
  });

  const purchaseRequest = await prisma.purchaseRequest.create({
    data: {
      userId: auth.userId,
      configId: configId as string,
      garageItemId: garageItem.id,
      message: (message as string) ?? undefined,
      status: 'PENDING',
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: { company: true },
  });

  await notifyPurchaseRequest({
    buyerName: user?.name ?? user?.email ?? auth.userId,
    buyerEmail: user?.email ?? '',
    configName: config.name ?? 'Unnamed configuration',
    companyName: user?.company?.name ?? 'Unknown',
  }).catch(console.error);

  return created({ purchaseRequest, garageItem });
};

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};

    if (method !== 'POST') return methodNotAllowed();

    if (path === '/leads') return await createLead(auth, body);
    if (path === '/leads/purchase-request') return await createPurchaseRequest(auth, body);

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
