/**
 * authedFetch — authenticated buyer-app API calls (production mode).
 *
 * Reads the current Supabase session token and attaches it as a Bearer
 * header. Throws with the server's JSON `error` message when the request
 * fails, so callers can surface real backend messages (e.g. "A company is
 * required to save configurations — complete onboarding first").
 *
 * Never used in demo mode — demo has no Supabase client and no authed calls.
 */

import { apiUrl } from './apiBase';
import { supabase } from '../auth/supabaseClient';

export async function authedFetch(path, options = {}) {
  if (!supabase) throw new Error('Authentication is not configured');

  const { data: { session } = {} } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You must be signed in to do this');

  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}
