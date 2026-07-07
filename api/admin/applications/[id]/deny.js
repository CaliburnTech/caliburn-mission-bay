import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/applications/:id/deny
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

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: { status: 'DENIED', reviewedBy: admin.email, reviewedAt: new Date() },
    });

    return ok(res, updated);
  },
  { auth: 'admin' }
);
