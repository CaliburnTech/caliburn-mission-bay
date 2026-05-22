import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
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

// GET /configs
const listConfigs = async (userId: string) => {
  const configs = await prisma.savedConfiguration.findMany({
    where: { userId },
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
  return ok(configs);
};

// POST /configs
const createConfig = async (
  userId: string,
  companyId: string,
  body: Record<string, unknown>,
) => {
  const { name, configData, productVersions } = body;
  if (!configData) return badRequest('configData is required');

  const pvList = productVersions as Array<{ productId: string; productVersionId: string }> | undefined;

  const config = await prisma.savedConfiguration.create({
    data: {
      userId,
      companyId,
      name: (name as string) ?? undefined,
      configData: configData as object,
      products: pvList?.length
        ? {
            create: pvList.map(({ productId, productVersionId }) => ({
              productId,
              productVersionId,
            })),
          }
        : undefined,
    },
    include: { products: true },
  });

  return created(config);
};

// PUT /configs/:id
const updateConfig = async (id: string, userId: string, body: Record<string, unknown>) => {
  const config = await prisma.savedConfiguration.findUnique({ where: { id } });
  if (!config || config.userId !== userId) return notFound();

  const { name, configData } = body;
  const updated = await prisma.savedConfiguration.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name as string } : {}),
      ...(configData !== undefined ? { configData: configData as object } : {}),
    },
  });
  return ok(updated);
};

// DELETE /configs/:id
const deleteConfig = async (id: string, userId: string) => {
  const config = await prisma.savedConfiguration.findUnique({ where: { id } });
  if (!config || config.userId !== userId) return notFound();

  await prisma.savedConfiguration.delete({ where: { id } });
  return ok({ deleted: true });
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

    if (path === '/configs') {
      if (method === 'GET') return await listConfigs(auth.userId);
      if (method === 'POST') return await createConfig(auth.userId, auth.companyId, body);
      return methodNotAllowed();
    }

    const itemMatch = path.match(/^\/configs\/([^/]+)$/);
    if (itemMatch) {
      const [, id] = itemMatch;
      if (method === 'PUT') return await updateConfig(id, auth.userId, body);
      if (method === 'DELETE') return await deleteConfig(id, auth.userId);
      return methodNotAllowed();
    }

    return notFound('Not found');
  } catch (e) {
    return serverError(e);
  }
};
