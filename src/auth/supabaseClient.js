/**
 * Supabase browser client — singleton, safe to import anywhere in src/.
 *
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are both public/publishable values;
 * committing them is intentional. The anon key enforces Row Level Security policies
 * on the Supabase side — it does NOT bypass them.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Null when the env vars are not configured — consumers must handle this and
 * fall back to demo mode. Calling createClient(undefined, undefined) throws at
 * module load, which would crash the whole app at boot.
 */
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (console.warn(
      '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — ' +
      'Supabase client unavailable, falling back to demo auth.'
    ), null);
