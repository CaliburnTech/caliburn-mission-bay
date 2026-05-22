import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, notFound, methodNotAllowed, serverError } from '../../lib/response';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;

    if (method !== 'GET') return methodNotAllowed();

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { company: true },
    });

    if (!user) return notFound('User not found');
    return ok(user);
  } catch (e) {
    return serverError(e);
  }
};
