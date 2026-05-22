import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, badRequest, notFound, methodNotAllowed, serverError } from '../../lib/response';

// POST /auth/complete-onboarding
// Body: { role: 'OWNER' | 'MEMBER', companyName?: string }
// Called once after Cognito login to set the user's role and mark onboarding done.
// OWNER role also creates a pending Company record for the vendor.
const completeOnboarding = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const { role, companyName } = body;

  if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role as string)) {
    return badRequest('role must be OWNER, ADMIN, or MEMBER');
  }

  if (role === 'OWNER' && !(companyName as string)?.trim()) {
    return badRequest('companyName is required for OWNER role');
  }

  const updates: Record<string, unknown> = { role, onboardingComplete: true };

  if (role === 'OWNER') {
    const company = await prisma.company.create({
      data: {
        name: (companyName as string).trim(),
        status: 'PENDING_APPROVAL',
        isSeller: true,
      },
    });
    updates.companyId = company.id;
  }

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: updates as Parameters<typeof prisma.user.update>[0]['data'],
    include: { company: true },
  });

  if (!updated) return notFound('User not found');
  return ok(updated);
};

// POST /auth/webhook — Clerk webhook (Clerk is replaced by Cognito in v1)
// TODO: Replace with Cognito PostConfirmation trigger (Stream B/E).
// This stub prevents API Gateway from returning 404 if the route is still wired during migration.
const webhookStub = () =>
  ({
    statusCode: 501,
    body: JSON.stringify({
      error: 'Not implemented — Clerk webhook replaced by Cognito triggers in v1',
    }),
    headers: { 'Content-Type': 'application/json' },
  } as const);

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};

    if (method !== 'POST') return methodNotAllowed();

    if (path === '/auth/complete-onboarding') return await completeOnboarding(auth, body);
    if (path === '/auth/webhook') return webhookStub();

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
