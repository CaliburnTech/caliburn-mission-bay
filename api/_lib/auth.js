/**
 * Auth Middleware — Supabase JWT verification.
 *
 * Validates the Bearer token from the Authorization header using the
 * Supabase admin client. The admin client calls Supabase's token
 * introspection endpoint, so no local JWT secret is needed here.
 *
 * Required env vars (server-side only, never VITE_-prefixed):
 *   SUPABASE_URL              — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (never expose to browser)
 */

import { createClient } from '@supabase/supabase-js';

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

export const requireAuth = async (req) => {
  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new Error('Missing authorization token');

  const { data: { user }, error } = await adminClient().auth.getUser(token);
  if (error || !user) throw new Error('Invalid or expired token');

  return {
    userId: user.id,              // Supabase UUID (stored in User.authId)
    email: user.email,
    role: user.app_metadata?.role ?? 'BUYER',
  };
};

export const requireRole = (role) => async (req) => {
  const user = await requireAuth(req);
  if (user.role !== role && user.role !== 'ADMIN') {
    throw new Error(`Required role: ${role}`);
  }
  return user;
};

/**
 * Dual-check super-admin gate — requires BOTH:
 *  1. @caliburn.us email domain
 *  2. Supabase SSO provider (not an email/password sign-in)
 *
 * Provider names match what Supabase reports in app_metadata.provider.
 * Update CALIBURN_IDP_PROVIDERS once SSO is wired in the Supabase dashboard.
 */
const CALIBURN_EMAIL_DOMAIN = 'caliburn.us';
const CALIBURN_IDP_PROVIDERS = [
  'google',    // Google Workspace SSO
  'azure',     // Azure AD / Microsoft SSO (Supabase uses 'azure')
  'azuread',   // alternate Supabase label
];

export const requireCaliburnAdmin = async (req) => {
  const authHeader = req.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    const err = new Error('Missing authorization token');
    err.status = 401;
    throw err;
  }

  const { data: { user }, error } = await adminClient().auth.getUser(token);
  if (error || !user) {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }

  const emailOk =
    typeof user.email === 'string' &&
    user.email.toLowerCase().endsWith(`@${CALIBURN_EMAIL_DOMAIN}`);
  if (!emailOk) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  // Block email/password Caliburn accounts — must arrive via SSO.
  const provider = user.app_metadata?.provider ?? 'email';
  const idpOk = CALIBURN_IDP_PROVIDERS.includes(provider);
  if (!idpOk) {
    const err = new Error('Forbidden: Caliburn SSO required');
    err.status = 403;
    throw err;
  }

  return { id: user.id, email: user.email };
};

/**
 * Maps status codes set on thrown errors to HTTP responses.
 * Returns true if the error was handled, false if the caller should
 * fall through to its own serverError handler.
 */
export const handleAuthError = (err, res) => {
  if (err.status === 401) {
    res.status(401).json({ error: 'Unauthorized' });
    return true;
  }
  if (err.status === 403) {
    res.status(403).json({ error: 'Forbidden' });
    return true;
  }
  return false;
};
