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
