import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/applications/:id/approve
 * Approves a vendor application and activates the company account.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { id } = req.query;
  const application = await prisma.vendorApplication.findUnique({ where: { id } });
  if (!application) return notFound(res);
  if (application.status !== 'PENDING') {
    return badRequest(res, `Application is already ${application.status}`);
  }

  // Activate or create the company
  let company = application.companyId
    ? await prisma.company.update({ where: { id: application.companyId }, data: { status: 'ACTIVE', isSeller: true } })
    : await prisma.company.create({ data: { name: application.companyName, status: 'ACTIVE', isSeller: true } });

  const updated = await prisma.vendorApplication.update({
    where: { id },
    data: { status: 'APPROVED', reviewedBy: admin.id, reviewedAt: new Date(), companyId: company.id },
  });

  return ok(res, { application: updated, company });
}
