import prisma from '../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../_lib/auth.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../_lib/respond.js';
import { handleCors } from '../../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'DELETE') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const sessionId = req.headers['x-impersonation-session-id'];
  if (!sessionId) return badRequest(res, 'No impersonation session header');

  const session = await prisma.impersonationSession.findFirst({
    where: { id: sessionId, isActive: true },
  });
  if (!session) return notFound(res, 'Active impersonation session not found');

  await prisma.impersonationSession.update({
    where: { id: sessionId },
    data: { isActive: false, endedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorType: 'SUPERADMIN',
      actorEmail: admin.email,
      targetCompanyId: session.targetCompanyId,
      action: 'IMPERSONATION_ENDED',
      targetType: 'COMPANY',
      targetId: session.targetCompanyId,
      impersonationSessionId: sessionId,
    },
  });

  return ok(res, { ended: true });
}
