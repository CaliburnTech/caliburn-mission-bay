import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, badRequest, notFound, methodNotAllowed } from '../_lib/respond.js';
import { sanitizeSpec } from '../_lib/productSpec.js';

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
export default withHandler(
  async (req, res, auth) => {
    const companyId = auth.effectiveCompanyId;
    const { id } = req.query;

    if (req.method === 'GET') {
      const product = await getOwnProduct(id, companyId);
      if (!product) return notFound(res);
      return ok(res, product);
    }

    if (req.method === 'PUT') {
      const product = await getOwnProduct(id, companyId);
      if (!product) return notFound(res);

      if (product.status === 'ARCHIVED') {
        return badRequest(res, 'Archived products cannot be edited');
      }

      const { name, description, category, trlLevel, specJson } = req.body ?? {};
      if (!name?.trim()) return badRequest(res, 'name is required');

      const updated = await prisma.product.update({
        where: { id },
        data: {
          name: name.trim(),
          description,
          category,
          trlLevel: trlLevel ? parseInt(trlLevel) : null,
          // Only overwrite spec when the client sends the field, so callers that
          // omit it don't wipe existing spec data.
          ...(specJson !== undefined ? { specJson: sanitizeSpec(specJson) ?? undefined } : {}),
        },
      });
      return ok(res, updated);
    }

    if (req.method === 'DELETE') {
      const product = await getOwnProduct(id, companyId);
      if (!product) return notFound(res);

      await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
      return ok(res, { archived: true });
    }

    return methodNotAllowed(res);
  },
  { auth: 'seller' }
);
