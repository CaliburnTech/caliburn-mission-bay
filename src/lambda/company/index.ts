import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import {
  ok,
  badRequest,
  forbidden,
  notFound,
  methodNotAllowed,
  serverError,
} from '../../lib/response';

// GET /company
const getCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return notFound();
  return ok(company);
};

// PUT /company
const updateCompany = async (companyId: string, body: Record<string, unknown>) => {
  const { name, description, website, email, phone } = body;
  if (!(name as string)?.trim()) return badRequest('Company name is required');

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: (name as string).trim(),
      description: (description as string) ?? undefined,
      website: (website as string) ?? undefined,
      email: (email as string) ?? undefined,
      phone: (phone as string) ?? undefined,
    },
  });
  return ok(updated);
};

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};

    if (!auth.companyId) return forbidden('No company associated with this account');

    if (path === '/company') {
      if (method === 'GET') return await getCompany(auth.companyId);
      if (method === 'PUT') return await updateCompany(auth.companyId, body);
      return methodNotAllowed();
    }

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
