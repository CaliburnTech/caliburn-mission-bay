/**
 * withHandler — shared route wrapper: CORS, auth resolution, impersonation,
 * and a consistent JSON error envelope.
 *
 * Usage:
 *   export default withHandler(async (req, res, auth) => { ... }, { auth: 'seller' });
 *
 * Options:
 *   auth: 'none'   — no authentication (public endpoint)
 *         'user'   — any authenticated user (DB-resolved; see _lib/auth.js)
 *         'seller' — authenticated user whose company has isSeller=true
 *         'admin'  — Caliburn super-admin (@caliburn.us + optional allowlist)
 *
 * Impersonation: if the X-Impersonation-Session-Id header is present AND the
 * caller is a Caliburn admin, the ImpersonationSession row is loaded and
 * validated (isActive, not expired). auth.effectiveCompanyId is then the
 * impersonated company; otherwise it is the user's own companyId. A present
 * but invalid header always yields 403. Routes that scope data by company
 * must use auth.effectiveCompanyId.
 */

import prisma from './db.js';
import { applyCors } from './cors.js';
import {
  requireAuth,
  requireCaliburnAdmin,
  assertSeller,
  isCaliburnAdmin,
  httpError,
} from './auth.js';

const IMPERSONATION_HEADER = 'x-impersonation-session-id';

async function resolveImpersonation(req, auth) {
  const sessionId = req.headers?.[IMPERSONATION_HEADER];
  if (!sessionId) {
    return { ...auth, effectiveCompanyId: auth.companyId ?? null, impersonation: null };
  }

  // Only Caliburn admins may impersonate.
  if (!isCaliburnAdmin(auth.email)) {
    throw httpError(403, 'Impersonation not permitted');
  }

  const session = await prisma.impersonationSession.findUnique({
    where: { id: String(sessionId) },
  });
  if (!session || !session.isActive || session.expiresAt <= new Date()) {
    throw httpError(403, 'Impersonation session is invalid or expired');
  }

  return { ...auth, effectiveCompanyId: session.targetCompanyId, impersonation: session };
}

async function resolveAuth(req, mode) {
  if (mode === 'none') return null;

  if (mode === 'admin') {
    const admin = await requireCaliburnAdmin(req);
    return resolveImpersonation(req, admin);
  }

  // 'user' | 'seller'
  const base = await requireAuth(req);
  const resolved = await resolveImpersonation(req, base);

  if (mode === 'seller') {
    if (resolved.impersonation) {
      // Admin acting as the target company — validate the *target* company.
      return assertSeller(resolved, resolved.effectiveCompanyId);
    }
    return assertSeller(resolved);
  }

  return resolved;
}

const isPrismaKnownError = (err) =>
  typeof err?.code === 'string' && /^P2\d{3}$/.test(err.code);

export function withHandler(fn, { auth: authMode = 'none' } = {}) {
  return async (req, res) => {
    applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    try {
      const auth = await resolveAuth(req, authMode);
      return await fn(req, res, auth);
    } catch (err) {
      if (typeof err?.status === 'number') {
        return res.status(err.status).json({ error: err.message || 'Request failed' });
      }
      if (isPrismaKnownError(err)) {
        // Known Prisma request errors (constraint violations, missing rows,
        // bad input) are client errors — don't leak internals.
        console.error('[api] prisma error:', err.code, err.message);
        return res.status(400).json({ error: 'Invalid request' });
      }
      console.error('[api] unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export default withHandler;
