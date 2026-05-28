import prisma from '../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../_lib/auth.js';
import { ok, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';
import { handleCors } from '../../_lib/cors.js';

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

  const { companyId } = req.query;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return notFound(res);

  await prisma.impersonationSession.updateMany({
    where: { superAdminEmail: admin.email, isActive: true },
    data: { isActive: false, endedAt: new Date() },
  });

  const session = await prisma.impersonationSession.create({
    data: {
      superAdminEmail: admin.email,
      targetCompanyId: companyId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorType: 'SUPERADMIN',
      actorEmail: admin.email,
      targetCompanyId: companyId,
      action: 'IMPERSONATION_STARTED',
      targetType: 'COMPANY',
      targetId: companyId,
      impersonationSessionId: session.id,
    },
  });

  return ok(res, { sessionId: session.id, expiresAt: session.expiresAt });
}
