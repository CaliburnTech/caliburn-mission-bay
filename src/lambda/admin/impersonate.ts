import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, forbidden, notFound, badRequest, serverError } from '../../lib/response';

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

// POST /admin/impersonate/start
// Body: { targetCompanyId: string }
export const startImpersonation = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    if (!auth.isSuperAdmin) return forbidden('Super-admin required');

    if (!event.body) return badRequest('Request body required');
    const { targetCompanyId } = JSON.parse(event.body) as { targetCompanyId?: string };
    if (!targetCompanyId) return badRequest('targetCompanyId is required');

    const company = await prisma.company.findUnique({ where: { id: targetCompanyId } });
    if (!company) return notFound('Company not found');

    // Re-verify actor from DB — JWT claim could be stale.
    const actor = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!actor) return forbidden('Actor not found');
    const actorEmail = actor.email;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    const session = await prisma.impersonationSession.create({
      data: {
        superAdminUserId: auth.userId,
        superAdminEmail: actorEmail,
        targetCompanyId,
        expiresAt,
        isActive: true,
        ipAddress: event.requestContext?.http?.sourceIp ?? null,
        userAgent: event.headers?.['user-agent'] ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorUserId: auth.userId,
        actorEmail,
        targetCompanyId,
        impersonationSessionId: session.id,
        action: 'impersonation.started',
        targetType: 'COMPANY',
        targetId: targetCompanyId,
        metadata: { expiresAt: expiresAt.toISOString() },
      },
    });

    return ok({ sessionId: session.id, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    return serverError(e);
  }
};

// POST /admin/impersonate/end
// Body: { sessionId: string }
export const endImpersonation = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    if (!auth.isSuperAdmin) return forbidden('Super-admin required');

    if (!event.body) return badRequest('Request body required');
    const { sessionId } = JSON.parse(event.body) as { sessionId?: string };
    if (!sessionId) return badRequest('sessionId is required');

    const session = await prisma.impersonationSession.findUnique({ where: { id: sessionId } });
    if (!session) return notFound('Session not found');
    if (session.superAdminUserId !== auth.userId) return forbidden('Not your session');

    const now = new Date();

    await prisma.impersonationSession.update({
      where: { id: sessionId },
      data: { isActive: false, endedAt: now },
    });

    const actor = await prisma.user.findUnique({ where: { id: auth.userId } });
    const actorEmail = actor?.email ?? '';

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorUserId: auth.userId,
        actorEmail,
        targetCompanyId: session.targetCompanyId,
        impersonationSessionId: sessionId,
        action: 'impersonation.ended',
        targetType: 'COMPANY',
        targetId: session.targetCompanyId,
        metadata: { endReason: 'manual' },
      },
    });

    return ok({ sessionId, ended: true });
  } catch (e) {
    return serverError(e);
  }
};

// Scheduled EventBridge handler — runs hourly to mark expired sessions inactive and
// prune expired SessionDenyList rows (refresh tokens already revoked at Cognito level).
export const cleanupExpiredSessions = async (): Promise<void> => {
  const now = new Date();

  await prisma.impersonationSession.updateMany({
    where: { isActive: true, expiresAt: { lt: now } },
    data: { isActive: false, endedAt: now },
  });

  await prisma.sessionDenyList.deleteMany({
    where: { expiresAt: { lt: now } },
  });
};
