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

  const companies = await prisma.company.findMany({
    where: { status: 'PENDING_APPROVAL' },
    orderBy: { createdAt: 'asc' },
  });

  return ok(res, { companies });
}
