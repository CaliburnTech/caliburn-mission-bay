import prisma from '../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../_lib/auth.js';
import { ok, serverError, methodNotAllowed } from '../../_lib/respond.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  void admin;

  const { companyId, actorId, action, from, to } = req.query;

  const where = {};

  if (companyId) where.targetCompanyId = companyId;
  if (actorId) where.actorUserId = actorId;
  if (action) where.action = action;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return ok(res, { entries });
}
