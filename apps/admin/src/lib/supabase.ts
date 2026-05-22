import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env file')
}

/**
 * Singleton Supabase client for the admin portal.
 * Auth is handled via supabase.auth — call getSession() to retrieve the
 * current access token for outbound API requests.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
