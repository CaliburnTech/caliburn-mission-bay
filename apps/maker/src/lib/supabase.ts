import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  // Fail fast (same behavior as the admin portal) instead of silently
  // creating a client against a placeholder URL that can never work.
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env file')
}

/**
 * Singleton Supabase client.
 * Session is persisted automatically in localStorage by the SDK.
 * Access tokens are refreshed transparently on expiry.
 *
 * Required env vars (see .env.example):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */
export const supabase = createClient(url, key)
