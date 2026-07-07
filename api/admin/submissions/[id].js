import { createClient } from '@supabase/supabase-js';
import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, notFound, methodNotAllowed } from '../../_lib/respond.js';

/**
 * DELETE /api/admin/submissions/:id — hard-delete a saved configuration.
 *
 * Super-admin only. Deletes dependent rows first (FK order: junction rows,
 * purchase requests, garage item, SBOM metadata), then the configuration
 * itself, all in one transaction. Writes an immutable AuditLog row.
 *
 * SBOM files in Supabase Storage are removed best-effort AFTER the DB commit
 * — a storage failure never blocks or rolls back the delete.
 *
 * Response: { deleted: true, id }
 */

const SBOM_BUCKET = 'sboms';

function removeSbomFiles(storagePaths) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || storagePaths.length === 0) return Promise.resolve();

  // Each Sbom row points at the JSON file; a CSV sibling is written alongside.
  const paths = storagePaths.flatMap((p) => [p, p.replace(/\.json$/, '.csv')]);
  return createClient(url, key)
    .storage.from(SBOM_BUCKET)
    .remove(paths)
    .then(({ error }) => {
      if (error) console.error('[admin/submissions] SBOM storage cleanup failed:', error.message);
    });
}

export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'DELETE') return methodNotAllowed(res);

    const { id } = req.query;

    const submission = await prisma.savedConfiguration.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        submittedBy: true,
        companyId: true,
        sboms: { select: { storagePath: true } },
      },
    });
    if (!submission) return notFound(res);

    await prisma.$transaction([
      prisma.configurationProduct.deleteMany({ where: { configId: id } }),
      // PurchaseRequest references GarageItem — delete requests before the item.
      prisma.purchaseRequest.deleteMany({ where: { configId: id } }),
      prisma.garageItem.deleteMany({ where: { configId: id } }),
      prisma.sbom.deleteMany({ where: { savedConfigurationId: id } }),
      prisma.savedConfiguration.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          actorType: 'SUPERADMIN',
          actorEmail: admin.email,
          targetCompanyId: submission.companyId,
          action: 'SUBMISSION_DELETED',
          targetType: 'SAVED_CONFIGURATION',
          targetId: id,
          metadata: {
            submissionId: id,
            name: submission.name,
            submittedBy: submission.submittedBy,
          },
        },
      }),
    ]);

    // Best-effort storage cleanup — never block the response on it.
    try {
      await removeSbomFiles(submission.sboms.map((s) => s.storagePath));
    } catch (err) {
      console.error('[admin/submissions] SBOM storage cleanup failed:', err);
    }

    return ok(res, { deleted: true, id });
  },
  { auth: 'admin' }
);
