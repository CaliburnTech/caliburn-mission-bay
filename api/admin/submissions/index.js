/**
 * GET /api/admin/submissions — all saved configurations, newest first.
 *
 * Super-admin only. Replaces the previous direct anon-key table reads from
 * the admin portal and buyer SPA (SavedConfiguration now has RLS enabled;
 * all reads go through this authenticated route).
 *
 * Response: { submissions: [{ id, name, submittedBy, configData, companyId,
 *             createdAt, updatedAt }] }
 */

import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, methodNotAllowed } from '../../_lib/respond.js';

export default withHandler(
  async (req, res) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    const rows = await prisma.savedConfiguration.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        submittedBy: true,
        configData: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok(res, { submissions: rows });
  },
  { auth: 'admin' }
);
