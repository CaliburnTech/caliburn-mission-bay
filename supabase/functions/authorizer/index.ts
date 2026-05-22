/**
 * authorizer — JWT validation + session deny-list check
 *
 * Called as middleware by other Edge Functions, or directly by the frontend
 * to validate a token before making sensitive requests.
 *
 * POST /functions/v1/authorizer
 * Body: { jti?: string }  (optional — supply to check deny list)
 * Returns: { valid: boolean, user_id?: string, company_id?: string, is_super_admin?: boolean }
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, errorResponse, jsonResponse } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = userClient(req)

    // 1. Validate JWT via Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Check session deny list (hard bans / security revocations)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const jti: string | undefined = body?.jti

    if (jti) {
      const admin = adminClient()
      const { data: denied } = await admin
        .from('session_deny_list')
        .select('id, expires_at')
        .eq('jwt_jti', jti)
        .maybeSingle()

      if (denied) {
        const expired = denied.expires_at && new Date(denied.expires_at) < new Date()
        if (!expired) {
          return new Response(JSON.stringify({ valid: false, error: 'Session revoked' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
    }

    // 3. Fetch the users row for company context
    const admin = adminClient()
    const { data: dbUser } = await admin
      .from('users')
      .select('id, company_id, role, status')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (!dbUser || dbUser.status === 'SUSPENDED') {
      return new Response(JSON.stringify({ valid: false, error: 'Account suspended' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isSuperAdmin = user.email?.endsWith('@caliburn.us') ?? false

    return jsonResponse({
      valid: true,
      user_id: dbUser.id,
      auth_id: user.id,
      company_id: dbUser.company_id,
      role: dbUser.role,
      is_super_admin: isSuperAdmin,
      email: user.email,
    })
  } catch (err) {
    console.error('[authorizer]', err)
    return errorResponse('Internal error', 500)
  }
})
