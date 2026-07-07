import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, notFound, unauthorized, methodNotAllowed } from '../_lib/respond.js';

const getOwnConfig = async (id, userId) => {
  const config = await prisma.savedConfiguration.findUnique({ where: { id } });
  if (!config || config.userId !== userId) return null;
  return config;
};

/**
 * PUT    /api/configurations/:id  — rename or update a config
 * DELETE /api/configurations/:id  — delete a config
 */
export default withHandler(
  async (req, res, auth) => {
    if (!auth.id) return unauthorized(res, 'Account setup incomplete — complete onboarding first');

    const { id } = req.query;

    if (req.method === 'PUT') {
      const config = await getOwnConfig(id, auth.id);
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
      const config = await getOwnConfig(id, auth.id);
      if (!config) return notFound(res);

      await prisma.savedConfiguration.delete({ where: { id } });
      return ok(res, { deleted: true });
    }

    return methodNotAllowed(res);
  },
  { auth: 'user' }
);
