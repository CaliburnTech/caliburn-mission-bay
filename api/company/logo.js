import prisma from '../_lib/db.js';
import { requireRole, handleAuthError } from '../_lib/auth.js';
import { ok, badRequest, forbidden, serverError, methodNotAllowed } from '../_lib/respond.js';
import { getPresignedUploadUrl } from '../_lib/s3.js';

/**
 * POST /api/company/logo
 * Body: { contentType: 'image/png' | 'image/jpeg' | 'image/webp' }
 *
 * Returns a presigned S3 PUT URL. The browser uploads directly; on success
 * the client should call PUT /api/company with the returned publicUrl.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireRole('SELLER')(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  if (!user.companyId) return forbidden(res, 'No company associated with this account');

  const { contentType } = req.body ?? {};
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(contentType)) {
    return badRequest(res, `contentType must be one of: ${allowed.join(', ')}`);
  }

  const ext = contentType.split('/')[1];
  const key = `logos/${user.companyId}.${ext}`;

  try {
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);
    return ok(res, { uploadUrl, publicUrl });
  } catch (err) {
    return serverError(res, err);
  }
}
