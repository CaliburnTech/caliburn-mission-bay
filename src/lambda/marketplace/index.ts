import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, badRequest, notFound, methodNotAllowed, serverError } from '../../lib/response';

const VALID_EVENT_TYPES = ['VIEW', 'CONFIGURE', 'PURCHASE_REQUEST'] as const;

// GET /marketplace/capabilities
const listCapabilities = async (auth: ReturnType<typeof getAuthContext>) => {
  const where = auth.isSuperAdmin
    ? { type: 'CAPABILITY' as const }
    : {
        type: 'CAPABILITY' as const,
        OR: [{ status: 'APPROVED' as const }, { companyId: auth.companyId }],
      };

  const products = await prisma.product.findMany({
    where,
    include: { company: { select: { id: true, name: true, logoUrl: true } } },
    orderBy: { name: 'asc' },
  });
  return ok(products);
};

// GET /marketplace/platforms
const listPlatforms = async (auth: ReturnType<typeof getAuthContext>) => {
  const where = auth.isSuperAdmin
    ? { type: 'PLATFORM' as const }
    : {
        type: 'PLATFORM' as const,
        OR: [{ status: 'APPROVED' as const }, { companyId: auth.companyId }],
      };

  const products = await prisma.product.findMany({
    where,
    include: { company: { select: { id: true, name: true, logoUrl: true } } },
    orderBy: { name: 'asc' },
  });
  return ok(products);
};

// POST /marketplace/events — fire-and-forget analytics
const recordEvent = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const { productId, type, metadata } = body;

  if (!productId) return badRequest('productId is required');
  if (!VALID_EVENT_TYPES.includes(type as (typeof VALID_EVENT_TYPES)[number])) {
    return badRequest(`type must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
  }

  await prisma.event.create({
    data: {
      productId: productId as string,
      userId: auth.userId ?? undefined,
      type: type as (typeof VALID_EVENT_TYPES)[number],
      metadata: (metadata as object) ?? undefined,
    },
  });

  return ok({ recorded: true });
};

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};

    if (path === '/marketplace/capabilities' && method === 'GET') {
      return await listCapabilities(auth);
    }
    if (path === '/marketplace/platforms' && method === 'GET') {
      return await listPlatforms(auth);
    }
    if (path === '/marketplace/events' && method === 'POST') {
      return await recordEvent(auth, body);
    }

    if (
      path === '/marketplace/capabilities' ||
      path === '/marketplace/platforms' ||
      path === '/marketplace/events'
    ) {
      return methodNotAllowed();
    }

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
