import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, notFound, methodNotAllowed } from '../../_lib/respond.js';

/**
 * POST /api/admin/impersonate/:companyId
 * Starts a 1-hour impersonation session for a Caliburn super-admin.
 * The returned sessionId is sent back on subsequent requests via the
 * X-Impersonation-Session-Id header (validated in withHandler).
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { companyId } = req.query;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return notFound(res);

    await prisma.impersonationSession.updateMany({
      where: { superAdminEmail: admin.email, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    const session = await prisma.impersonationSession.create({
      data: {
        superAdminEmail: admin.email,
        targetCompanyId: companyId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        isActive: true,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? null,
        userAgent: req.headers['user-agent'] ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorEmail: admin.email,
        targetCompanyId: companyId,
        action: 'IMPERSONATION_STARTED',
        targetType: 'COMPANY',
        targetId: companyId,
        impersonationSessionId: session.id,
      },
    });

    return ok(res, { sessionId: session.id, expiresAt: session.expiresAt });
  },
  { auth: 'admin' }
);
