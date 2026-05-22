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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
