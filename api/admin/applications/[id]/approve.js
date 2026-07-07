import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { sendApprovalGranted } from '../../../_lib/email.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/applications/:id/approve
 * Approves a vendor application and activates the company account.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;
    const application = await prisma.vendorApplication.findUnique({ where: { id } });
    if (!application) return notFound(res);
    if (application.status !== 'PENDING') {
      return badRequest(res, `Application is already ${application.status}`);
    }

    // Approve or create the company
    const company = application.companyId
      ? await prisma.company.update({
          where: { id: application.companyId },
          data: { status: 'APPROVED', isSeller: true, approvedAt: new Date(), approvedByEmail: admin.email },
          include: { users: { where: { role: 'OWNER' }, select: { email: true }, take: 1 } },
        })
      : await prisma.company.create({
          data: { name: application.companyName, status: 'APPROVED', isSeller: true, approvedAt: new Date(), approvedByEmail: admin.email },
          include: { users: { where: { role: 'OWNER' }, select: { email: true }, take: 1 } },
        });

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy: admin.email, reviewedAt: new Date(), companyId: company.id },
    });

    // Fire-and-forget approval email to company OWNER
    const ownerEmail = company.users?.[0]?.email;
    if (ownerEmail) {
      sendApprovalGranted({ ownerEmail, companyName: company.name })
        .catch((err) => console.error('[applications/approve] approval email failed:', err));
    }

    return ok(res, { application: updated, company });
  },
  { auth: 'admin' }
);
