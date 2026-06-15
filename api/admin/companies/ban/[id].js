import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { sendBanNotice } from '../../../_lib/email.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';
import { handleCors } from '../../../_lib/cors.js';

/**
 * POST /api/admin/companies/:id/ban
 *
 * NOTE: lives at api/admin/companies/ban/[id].js — see approve/[id].js for explanation.
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

  const ownerEmail = company.users[0]?.email;
  if (ownerEmail) {
    sendBanNotice({ ownerEmail, companyName: company.name })
      .catch((err) => console.error('[ban] ban notice email failed:', err));
  }

  return ok(res, updated);
}
