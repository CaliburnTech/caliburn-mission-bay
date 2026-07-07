import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, badRequest, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET  /api/company  — fetch own company profile
 * PUT  /api/company  — update own company profile
 */
export default withHandler(
  async (req, res, auth) => {
    const companyId = auth.effectiveCompanyId;

    if (req.method === 'GET') {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      return ok(res, company);
    }

    if (req.method === 'PUT') {
      const { name, description, website, email, phone } = req.body ?? {};
      if (!name?.trim()) return badRequest(res, 'Company name is required');

      const updated = await prisma.company.update({
        where: { id: companyId },
        data: { name: name.trim(), description, website, email, phone },
      });
      return ok(res, updated);
    }

    return methodNotAllowed(res);
  },
  { auth: 'seller' }
);
