import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';
import { handleCors } from '../../../_lib/cors.js';

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
}
