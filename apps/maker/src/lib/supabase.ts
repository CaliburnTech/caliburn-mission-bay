import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

if (!url || !key) {
  console.warn('[maker-portal] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set — auth will not work')
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
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')
