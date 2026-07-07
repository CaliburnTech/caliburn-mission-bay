import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { sendApprovalGranted } from '../../../_lib/email.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/companies/:id/approve
 *
 * Approves a company created during seller onboarding.
 * Changes Company.status from PENDING_APPROVAL → APPROVED and
 * sends an approval confirmation email to the company OWNER.
 *
 * This is distinct from /api/admin/applications/:id/approve which
 * handles the older VendorApplication flow.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;

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
    if (company.status !== 'PENDING_APPROVAL') {
      return badRequest(res, `Company is already ${company.status}`);
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        status: 'APPROVED',
        isSeller: true,
        approvedAt: new Date(),
        approvedByEmail: admin.email,
      },
    });

    // Fire-and-forget — email failure must not block the response
    const ownerEmail = company.users[0]?.email;
    if (ownerEmail) {
      sendApprovalGranted({ ownerEmail, companyName: company.name })
        .catch((err) => console.error('[approve] approval email failed:', err));
    }

    return ok(res, { company: updated });
  },
  { auth: 'admin' }
);
