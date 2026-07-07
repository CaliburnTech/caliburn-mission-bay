/**
 * Auth Middleware — Supabase JWT verification + DB identity resolution.
 *
 * Identity contract: every authenticated request resolves BOTH the Supabase
 * auth user (via token introspection) and the application User row (via
 * User.authId). Handlers always receive DB values:
 *
 *   { id, authId, email, name, role, companyId, onboardingComplete, user }
 *
 *   id        — DB User.id (cuid) — null if the user row doesn't exist yet
 *               (e.g. webhook missed; onboarding will create it)
 *   authId    — Supabase auth UUID
 *   role      — DB UserRole (OWNER | ADMIN | MEMBER) or null
 *   user      — the full DB User row (with company) or null
 *
 * All thrown errors carry `.status` (401/403) so wrappers can map them to
 * proper JSON responses instead of 500s.
 *
 * Required env vars (server-side only, never VITE_-prefixed):
 *   SUPABASE_URL              — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (never expose to browser)
 * Optional:
 *   SUPER_ADMIN_EMAILS        — comma-separated allowlist for super-admins
 */

import { createClient } from '@supabase/supabase-js';
import prisma from './db.js';

let _adminClient = null;
const adminClient = () => {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return _adminClient;
};

export const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const bearerToken = (req) => {
  const authHeader = req.headers?.authorization ?? '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

/**
 * Verifies the Bearer token with Supabase, then resolves the DB User row
 * via User.authId. Returns DB values. If no DB row exists yet, id is null
 * but authId/email are still returned so onboarding can proceed.
 */
export const requireAuth = async (req) => {
  const token = bearerToken(req);
  if (!token) throw httpError(401, 'Missing authorization token');

  const { data, error } = await adminClient().auth.getUser(token);
  const authUser = data?.user;
  if (error || !authUser) throw httpError(401, 'Invalid or expired token');

  const dbUser = await prisma.user.findUnique({
    where: { authId: authUser.id },
    include: { company: true },
  });

  return {
    id: dbUser?.id ?? null,
    authId: authUser.id,
    email: dbUser?.email ?? authUser.email ?? null,
    name:
      dbUser?.name ??
      authUser.user_metadata?.name ??
      authUser.user_metadata?.full_name ??
      null,
    role: dbUser?.role ?? null,
    companyId: dbUser?.companyId ?? null,
    onboardingComplete: dbUser?.onboardingComplete ?? false,
    user: dbUser,
  };
};

/**
 * Asserts an already-resolved auth object belongs to a seller: the user
 * exists in the DB, has a company, and that company has isSeller=true.
 * BANNED companies are rejected. app_metadata.role is never trusted.
 */
export const assertSeller = async (auth, companyOverride = null) => {
  const companyId = companyOverride ?? auth.companyId;
  if (!auth.id && !companyOverride) throw httpError(403, 'Account setup incomplete — no user record');
  if (!companyId) throw httpError(403, 'No company associated with this account');

  const company =
    auth.user?.company && auth.user.company.id === companyId
      ? auth.user.company
      : await prisma.company.findUnique({ where: { id: companyId } });

  if (!company || !company.isSeller) throw httpError(403, 'Seller account required');
  if (company.status === 'BANNED') throw httpError(403, 'Company is banned');

  return { ...auth, company, companyId: auth.companyId, effectiveCompanyId: companyId };
};

/** Requires auth + a company with isSeller=true (and not BANNED). */
export const requireSeller = async (req) => {
  const auth = await requireAuth(req);
  return assertSeller(auth);
};

/**
 * Super-admin gate — requires:
 *  1. @caliburn.us email domain
 *  2. when SUPER_ADMIN_EMAILS is set, membership in that comma-separated
 *     allowlist (defense in depth against arbitrary domain accounts)
 *  3. when SUPER_ADMIN_REQUIRE_SSO=true, sign-in via an approved SSO
 *     provider (SUPER_ADMIN_SSO_PROVIDERS, default 'azure,google,saml') —
 *     email/password logins are rejected. Unset = unchanged behavior.
 */
const CALIBURN_EMAIL_DOMAIN = 'caliburn.us';
const DEFAULT_SSO_PROVIDERS = 'azure,google,saml';

/**
 * SSO dual-check: when SUPER_ADMIN_REQUIRE_SSO === 'true', the Supabase auth
 * user's identity provider (app_metadata.provider / app_metadata.providers)
 * must include one of the approved SSO providers. No-op when unset.
 */
const assertSsoProvider = (authUser) => {
  if (process.env.SUPER_ADMIN_REQUIRE_SSO !== 'true') return;

  const allowed = (process.env.SUPER_ADMIN_SSO_PROVIDERS ?? DEFAULT_SSO_PROVIDERS)
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  const meta = authUser?.app_metadata ?? {};
  const providers = [
    ...(Array.isArray(meta.providers) ? meta.providers : []),
    ...(typeof meta.provider === 'string' ? [meta.provider] : []),
  ].map((p) => String(p).toLowerCase());

  if (!providers.some((p) => allowed.includes(p))) {
    throw httpError(403, 'SSO sign-in required for admin access');
  }
};

export const isCaliburnAdmin = (email) => {
  if (typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  if (!normalized.endsWith(`@${CALIBURN_EMAIL_DOMAIN}`)) return false;

  const allowlist = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length > 0 && !allowlist.includes(normalized)) return false;

  return true;
};

export const requireCaliburnAdmin = async (req) => {
  const token = bearerToken(req);
  if (!token) throw httpError(401, 'Missing authorization token');

  const { data, error } = await adminClient().auth.getUser(token);
  const authUser = data?.user;
  if (error || !authUser) throw httpError(401, 'Invalid or expired token');

  if (!isCaliburnAdmin(authUser.email)) throw httpError(403, 'Forbidden');
  assertSsoProvider(authUser);

  return { id: authUser.id, authId: authUser.id, email: authUser.email };
};

/**
 * Maps status codes set on thrown errors to HTTP responses.
 * Returns true if the error was handled, false if the caller should
 * fall through to its own serverError handler.
 */
export const handleAuthError = (err, res) => {
  if (err?.status === 401) {
    res.status(401).json({ error: err.message || 'Unauthorized' });
    return true;
  }
  if (err?.status === 403) {
    res.status(403).json({ error: err.message || 'Forbidden' });
    return true;
  }
  return false;
};
