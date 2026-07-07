import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { sendBanNotice } from '../../../_lib/email.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/companies/:id/ban
 *
 * Bans a company. Per the user-management spec:
 *   SOFT ban — policy suspension; status → BANNED. Company can be re-approved later.
 *   HARD ban — same DB effect for now (future: also trigger Supabase auth deactivation).
 *
 * Body: { type: 'SOFT' | 'HARD' }  (defaults to 'SOFT' if omitted)
 *
 * Sends a ban notice email to the company OWNER.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;
    const banType = req.body?.type === 'HARD' ? 'HARD' : 'SOFT';

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: 'OWNER' },
          select: { email: true },
          take: 1,
        },
      },
    });

    if (!company) return notFound(res);
    if (company.status === 'BANNED') {
      return badRequest(res, 'Company is already banned');
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        status: 'BANNED',
        lastBanType: banType,
        bannedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorEmail: admin.email,
        targetCompanyId: id,
        action: 'COMPANY_BANNED',
        targetType: 'COMPANY',
        targetId: id,
        metadata: { banType },
      },
    });

    // Fire-and-forget — email failure must not block the response
    const ownerEmail = company.users[0]?.email;
    if (ownerEmail) {
      sendBanNotice({ ownerEmail, companyName: company.name })
        .catch((err) => console.error('[ban] ban notice email failed:', err));
    }

    return ok(res, { company: updated });
  },
  { auth: 'admin' }
);
