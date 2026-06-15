import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { sendApprovalGranted } from '../../../_lib/email.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';
import { handleCors } from '../../../_lib/cors.js';

/**
 * POST /api/admin/companies/:id/approve
 *
 * Approves a company that signed up via the Supabase webhook flow.
 * Changes Company.status from PENDING_APPROVAL → APPROVED and
 * sends an approval confirmation email to the company OWNER.
 *
 * NOTE: This file lives at api/admin/companies/approve/[id].js
 * because Vercel only supports [param] in filenames, not directory names.
 * The original URL /api/admin/companies/:id/approve is preserved via
 * a vercel.json route rewrite.
 */
export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

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
      approvedAt: new Date(),
      approvedByEmail: admin.email,
    },
  });

  const ownerEmail = company.users[0]?.email;
  if (ownerEmail) {
    sendApprovalGranted({ ownerEmail, companyName: company.name })
      .catch((err) => console.error('[approve] approval email failed:', err));
  }

  return ok(res, updated);
}
