import prisma from '../_lib/db.js';
import { requireAuth, handleAuthError } from '../_lib/auth.js';
import { ok, badRequest, serverError, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/auth/complete-onboarding
 * Body: { role: 'BUYER' | 'SELLER' }
 *
 * Called once after SSO login to set the user's role and mark onboarding done.
 * SELLER role also creates a pending Company record for the vendor.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { role, companyName } = req.body ?? {};

  if (!['BUYER', 'SELLER'].includes(role)) {
    return badRequest(res, 'role must be BUYER or SELLER');
  }

  if (role === 'SELLER' && !companyName?.trim()) {
    return badRequest(res, 'companyName is required for SELLER role');
  }

  const updates = { role, onboardingComplete: true };

  if (role === 'SELLER') {
    const company = await prisma.company.create({
      data: {
        name: companyName.trim(),
        status: 'PENDING',
        isSeller: true,
      },
    });
    updates.companyId = company.id;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
    include: { company: true },
  });

  return ok(res, updated);
}
