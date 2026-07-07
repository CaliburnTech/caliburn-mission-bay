import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, methodNotAllowed } from '../../_lib/respond.js';

export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const companies = await prisma.company.findMany({
      where: { status: 'PENDING_APPROVAL' },
      orderBy: { createdAt: 'asc' },
    });

    return ok(res, { companies });
  },
  { auth: 'admin' }
);
