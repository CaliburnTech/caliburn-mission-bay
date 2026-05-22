import prisma from '../_lib/db.js';
import { requireRole, handleAuthError } from '../_lib/auth.js';
import { ok, created, badRequest, forbidden, serverError, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET  /api/products  — list vendor's own products
 * POST /api/products  — create a new product (starts as DRAFT)
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
    const products = await prisma.product.findMany({
      where: { companyId: user.companyId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { events: true, leads: true } } },
    });
    return ok(res, products);
  }

  if (req.method === 'POST') {
    const { type, name, description, category, trlLevel } = req.body ?? {};

    if (!['PLATFORM', 'CAPABILITY'].includes(type)) {
      return badRequest(res, 'type must be PLATFORM or CAPABILITY');
    }
    if (!name?.trim()) return badRequest(res, 'name is required');

    const product = await prisma.product.create({
      data: {
        companyId: user.companyId,
        type,
        name: name.trim(),
        description,
        category,
        trlLevel: trlLevel ? parseInt(trlLevel) : null,
        status: 'DRAFT',
      },
    });
    return created(res, product);
  }

  return methodNotAllowed(res);
}
