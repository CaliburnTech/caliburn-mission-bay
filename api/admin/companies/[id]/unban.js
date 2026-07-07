import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/companies/:id/unban
 * Reverts a BANNED company to PENDING_APPROVAL.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return notFound(res);
    if (company.status !== 'BANNED') {
      return badRequest(res, `Company is not banned (current status: ${company.status})`);
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        bannedAt: null,
        lastBanType: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorEmail: admin.email,
        targetCompanyId: id,
        action: 'COMPANY_UNBANNED',
        targetType: 'COMPANY',
        targetId: id,
      },
    });

    return ok(res, { company: updated });
  },
  { auth: 'admin' }
);
