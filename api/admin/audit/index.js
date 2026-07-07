import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, badRequest, methodNotAllowed } from '../../_lib/respond.js';

const parseDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const { companyId, actorId, action, from, to } = req.query;

    const where = {};

    if (companyId) where.targetCompanyId = companyId;
    if (actorId) where.actorUserId = actorId;
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) {
        const fromDate = parseDate(from);
        if (!fromDate) return badRequest(res, 'from must be a valid date');
        where.createdAt.gte = fromDate;
      }
      if (to) {
        const toDate = parseDate(to);
        if (!toDate) return badRequest(res, 'to must be a valid date');
        where.createdAt.lte = toDate;
      }
    }

    const entries = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return ok(res, { entries });
  },
  { auth: 'admin' }
);
