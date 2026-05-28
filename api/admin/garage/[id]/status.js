import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { ok, badRequest, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';
import { handleCors } from '../../../_lib/cors.js';

const VALID_STATUSES = ['SAVED', 'PURCHASE_REQUESTED', 'IN_PROCUREMENT', 'CONTRACTED', 'DELIVERED'];

/**
 * PUT /api/admin/garage/:id/status
 * Body: { status: GarageStatus, notes?: string }
 * Allows Caliburn to manually advance a garage item through the procurement pipeline.
 */
export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'PUT') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }
  void admin;

  const { id } = req.query;
  const { status, notes } = req.body ?? {};

  if (!VALID_STATUSES.includes(status)) {
    return badRequest(res, `status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const item = await prisma.garageItem.findUnique({ where: { id } });
  if (!item) return notFound(res);

  const updated = await prisma.garageItem.update({
    where: { id },
    data: { status, ...(notes !== undefined ? { notes } : {}) },
  });

  return ok(res, updated);
}
