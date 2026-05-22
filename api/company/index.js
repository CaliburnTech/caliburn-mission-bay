import prisma from '../_lib/db.js';
import { requireRole, handleAuthError } from '../_lib/auth.js';
import { ok, badRequest, forbidden, serverError, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET  /api/company  — fetch own company profile
 * PUT  /api/company  — update own company profile
 */
export default async function handler(req, res) {
  let user;
  try {
    user = await requireRole('SELLER')(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  if (!user.companyId) return forbidden(res, 'No company associated with this account');

  if (req.method === 'GET') {
    const company = await prisma.company.findUnique({ where: { id: user.companyId } });
    return ok(res, company);
  }

  if (req.method === 'PUT') {
    const { name, description, website, email, phone } = req.body ?? {};
    if (!name?.trim()) return badRequest(res, 'Company name is required');

    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: { name: name.trim(), description, website, email, phone },
    });
    return ok(res, updated);
  }

  return methodNotAllowed(res);
}
