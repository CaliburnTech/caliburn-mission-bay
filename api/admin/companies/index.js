import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, methodNotAllowed } from '../../_lib/respond.js';

export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

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
  },
  { auth: 'admin' }
);
