import prisma from '../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../_lib/auth.js';
import { ok, created, badRequest, serverError, methodNotAllowed } from '../../_lib/respond.js';
import { notifyVendorApplication } from '../../_lib/ses.js';

/**
 * GET  /api/admin/applications  — list all vendor applications
 * POST /api/admin/applications  — submit a new vendor application (public, no auth)
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { companyName, contactName, email, website, message } = req.body ?? {};

    if (!companyName?.trim() || !contactName?.trim() || !email?.trim()) {
      return badRequest(res, 'companyName, contactName, and email are required');
    }

    const application = await prisma.vendorApplication.create({
      data: { companyName: companyName.trim(), contactName: contactName.trim(), email, website, message },
    });

    await notifyVendorApplication({ companyName, contactName, contactEmail: email }).catch(console.error);

    return created(res, application);
  }

  if (req.method === 'GET') {
    let user;
    try {
      user = await requireCaliburnAdmin(req);
    } catch (err) {
      if (handleAuthError(err, res)) return;
      return serverError(res, err);
    }
    void user;

    const { status } = req.query;
    const applications = await prisma.vendorApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, applications);
  }

  return methodNotAllowed(res);
}
