import prisma from '../_lib/db.js';
import { requireRole, handleAuthError } from '../_lib/auth.js';
import { ok, badRequest, forbidden, notFound, serverError, methodNotAllowed } from '../_lib/respond.js';

const getOwnProduct = async (productId, companyId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;
  if (product.companyId !== companyId) return null;
  return product;
};

/**
 * GET    /api/products/:id  — fetch single product
 * PUT    /api/products/:id  — save draft edits
 * DELETE /api/products/:id  — archive product
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

  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await getOwnProduct(id, user.companyId);
    if (!product) return notFound(res);
    return ok(res, product);
  }

  if (req.method === 'PUT') {
    const product = await getOwnProduct(id, user.companyId);
    if (!product) return notFound(res);

    if (product.status === 'ARCHIVED') {
      return badRequest(res, 'Archived products cannot be edited');
    }

    const { name, description, category, trlLevel } = req.body ?? {};
    if (!name?.trim()) return badRequest(res, 'name is required');

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description,
        category,
        trlLevel: trlLevel ? parseInt(trlLevel) : null,
      },
    });
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const product = await getOwnProduct(id, user.companyId);
    if (!product) return notFound(res);

    await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return ok(res, { archived: true });
  }

  return methodNotAllowed(res);
}
