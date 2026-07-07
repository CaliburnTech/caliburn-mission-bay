import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { sendSignupAlert } from '../_lib/email.js';
import { ok, badRequest, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/auth/complete-onboarding
 * Body: { role: 'BUYER' | 'SELLER', companyName? }
 *
 * Called once after first login. `role` here is the user's *intent*, not the
 * DB UserRole enum (OWNER/ADMIN/MEMBER):
 *
 *   BUYER  — just marks onboarding complete.
 *   SELLER — creates a Company (PENDING_APPROVAL, isSeller=true) and makes
 *            the user its OWNER.
 *
 * If the User row doesn't exist yet (auth webhook missed), it is created here.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { role, companyName } = req.body ?? {};

    if (!['BUYER', 'SELLER'].includes(role)) {
      return badRequest(res, 'role must be BUYER or SELLER');
    }
    if (role === 'SELLER') {
      if (!companyName?.trim()) return badRequest(res, 'companyName is required for SELLER role');
      if (companyName.trim().length > 200) return badRequest(res, 'companyName is too long');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Ensure the User row exists (webhook may not have fired).
      let user = auth.id
        ? await tx.user.findUnique({ where: { id: auth.id } })
        : await tx.user.findUnique({ where: { authId: auth.authId } });

      if (!user) {
        user = await tx.user.create({
          data: {
            authId: auth.authId,
            email: auth.email,
            name: auth.name,
          },
        });
      }

      const data = { onboardingComplete: true };

      if (role === 'SELLER') {
        // Idempotent: don't create a second company on redelivery/retry.
        if (!user.companyId) {
          const company = await tx.company.create({
            data: {
              name: companyName.trim(),
              status: 'PENDING_APPROVAL',
              isSeller: true,
            },
          });
          data.companyId = company.id;
        }
        data.role = 'OWNER';
      }

      return tx.user.update({
        where: { id: user.id },
        data,
        include: { company: true },
      });
    });

    // New seller company awaiting approval — alert the Caliburn team.
    // Fire-and-forget: email failure must not block onboarding.
    if (role === 'SELLER' && updated.company?.status === 'PENDING_APPROVAL') {
      sendSignupAlert({ companyName: updated.company.name, ownerEmail: updated.email })
        .catch((err) => console.error('[complete-onboarding] signup alert email failed:', err));
    }

    return ok(res, updated);
  },
  { auth: 'user' }
);
