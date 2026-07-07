import { withHandler } from './_lib/handler.js';
import { ok, methodNotAllowed } from './_lib/respond.js';

/**
 * GET /api/me
 * Returns the authenticated user (DB row) with their company, plus
 * onboardingComplete. If the DB user row doesn't exist yet, id is null and
 * the client should route to onboarding.
 */
export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'GET') return methodNotAllowed(res);

    return ok(res, {
      id: auth.id,
      authId: auth.authId,
      email: auth.email,
      name: auth.name,
      role: auth.role,
      companyId: auth.companyId,
      effectiveCompanyId: auth.effectiveCompanyId,
      onboardingComplete: auth.onboardingComplete,
      company: auth.user?.company ?? null,
    });
  },
  { auth: 'user' }
);
