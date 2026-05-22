import prisma from '../_lib/db.js';
import { requireAuth, handleAuthError } from '../_lib/auth.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../_lib/respond.js';

const getOwnConfig = async (id, userId) => {
  const config = await prisma.savedConfiguration.findUnique({ where: { id } });
  if (!config || config.userId !== userId) return null;
  return config;
};

/**
 * PUT    /api/configurations/:id  — rename or update a config
 * DELETE /api/configurations/:id  — delete a config
 */
export default async function handler(req, res) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    const config = await getOwnConfig(id, user.id);
    if (!config) return notFound(res);

    const { name, configData } = req.body ?? {};
    const updated = await prisma.savedConfiguration.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(configData !== undefined ? { configData } : {}),
      },
    });
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const config = await getOwnConfig(id, user.id);
    if (!config) return notFound(res);

    await prisma.savedConfiguration.delete({ where: { id } });
    return ok(res, { deleted: true });
  }

  return methodNotAllowed(res);
}
