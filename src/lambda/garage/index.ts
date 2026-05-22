import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import {
  ok,
  created,
  badRequest,
  methodNotAllowed,
  serverError,
  notFound,
} from '../../lib/response';

// GET /garage
const listGarage = async (userId: string) => {
  const items = await prisma.garageItem.findMany({
    where: { userId },
    include: {
      config: {
        include: {
          products: {
            include: { product: { select: { id: true, name: true, type: true } } },
          },
        },
      },
      purchaseRequests: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return ok(items);
};

// POST /garage — move a saved config into the garage
const addToGarage = async (userId: string, body: Record<string, unknown>) => {
  const { configId } = body;
  if (!configId) return badRequest('configId is required');

  const config = await prisma.savedConfiguration.findUnique({
    where: { id: configId as string },
  });
  if (!config || config.userId !== userId) {
    return badRequest('Config not found or does not belong to you');
  }

  const existing = await prisma.garageItem.findUnique({ where: { configId: configId as string } });
  if (existing) return ok(existing);

  const item = await prisma.garageItem.create({
    data: { userId, configId: configId as string, status: 'SAVED' },
  });
  return created(item);
};

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};

    if (path === '/garage') {
      if (method === 'GET') return await listGarage(auth.userId);
      if (method === 'POST') return await addToGarage(auth.userId, body);
      return methodNotAllowed();
    }

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
