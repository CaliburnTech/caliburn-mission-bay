import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../_lib/respond.js';

/**
 * DELETE /api/admin/impersonate
 * Ends the active impersonation session identified by the
 * X-Impersonation-Session-Id header.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'DELETE') return methodNotAllowed(res);

    const sessionId = req.headers['x-impersonation-session-id'];
    if (!sessionId) return badRequest(res, 'No impersonation session header');

    const session = await prisma.impersonationSession.findFirst({
      where: { id: sessionId, isActive: true },
    });
    if (!session) return notFound(res, 'Active impersonation session not found');

    await prisma.impersonationSession.update({
      where: { id: sessionId },
      data: { isActive: false, endedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorEmail: admin.email,
        targetCompanyId: session.targetCompanyId,
        action: 'IMPERSONATION_ENDED',
        targetType: 'COMPANY',
        targetId: session.targetCompanyId,
        impersonationSessionId: sessionId,
      },
    });

    return ok(res, { ended: true });
  },
  { auth: 'admin' }
);
