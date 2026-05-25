import prisma from '../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../_lib/auth.js';
import { ok, serverError } from '../../_lib/respond.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    const { methodNotAllowed } = await import('../../_lib/respond.js');
    return methodNotAllowed(res);
  }

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  void admin;

  const { status, search } = req.query;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const companies = await prisma.company.findMany({
    where,
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return ok(res, { companies });
}
