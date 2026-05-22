/**
 * admin — Super-admin operations (Caliburn internal only)
 *
 * All routes require a @caliburn.us JWT.
 *
 * Routes:
 *  GET    /admin/companies                list all companies (any status)
 *  GET    /admin/companies/:id            get one company + users
 *  POST   /admin/companies/:id/approve    approve a pending company
 *  POST   /admin/companies/:id/ban        ban a company (soft or hard)
 *  POST   /admin/companies/:id/unban      restore a banned company
 *  GET    /admin/audit-logs              list audit logs (paginated)
 *  POST   /admin/impersonate/:company_id  start impersonation session
 *  DELETE /admin/impersonate/:session_id  end impersonation session
 *  GET    /admin/pending                  list companies pending approval
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { userClient, adminClient, jsonResponse, errorResponse } from '../_shared/supabase.ts'

async function requireSuperAdmin(req: Request) {
  const supabase = userClient(req)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  if (!user.email?.endsWith('@caliburn.us')) return null
  return user
}

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  const user = await requireSuperAdmin(req)
  if (!user) return errorResponse('Forbidden — Caliburn staff only', 403)

  const admin = adminClient()
  const url   = new URL(req.url)
  const parts = url.pathname.replace(/^\/functions\/v1\/admin\/?/, '').split('/').filter(Boolean)
  const section  = parts[0]  // 'companies' | 'audit-logs' | 'impersonate' | 'pending'
  const targetId = parts[1]  // company_id | session_id | audit_log UUID
  const action   = parts[2]  // 'approve' | 'ban' | 'unban'

  // Get the super-admin's DB user record for audit logging
  const { data: adminUser } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  async function writeAuditLog(
    targetCompanyId: string | null,
    actionName: string,
    metadata?: Record<string, unknown>,
  ) {
    await admin.from('audit_logs').insert({
      actor_type:        'SUPERADMIN',
      actor_user_id:     adminUser?.id ?? null,
      actor_email:       user.email,
      target_company_id: targetCompanyId,
      action:            actionName,
      metadata,
    })
  }

  try {
    // ── PENDING LIST ───────────────────────────────────────────────────────────

    if (req.method === 'GET' && section === 'pending') {
      const { data, error } = await admin
        .from('companies')
        .select('*, users(id, name, email, role)')
        .eq('status', 'PENDING_APPROVAL')
        .order('created_at', { ascending: true })

      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── LIST ALL COMPANIES ─────────────────────────────────────────────────────

    if (req.method === 'GET' && section === 'companies' && !targetId) {
      const status = url.searchParams.get('status')
      let q = admin
        .from('companies')
        .select('*, users(id, name, email, role, status)')
        .order('created_at', { ascending: false })

      if (status) q = q.eq('status', status)

      const { data, error } = await q
      if (error) return errorResponse(error.message)
      return jsonResponse(data)
    }

    // ── GET ONE COMPANY ────────────────────────────────────────────────────────

    if (req.method === 'GET' && section === 'companies' && targetId && !action) {
      const { data, error } = await admin
        .from('companies')
        .select(`
          *,
          users(id, name, email, role, status, created_at),
          products(id, name, type, status),
          missions(id, name, status)
        `)
        .eq('id', targetId)
        .maybeSingle()

      if (error) return errorResponse(error.message)
      if (!data)  return errorResponse('Not found', 404)
      return jsonResponse(data)
    }

    // ── APPROVE COMPANY ────────────────────────────────────────────────────────

    if (req.method === 'POST' && section === 'companies' && targetId && action === 'approve') {
      const { data, error } = await admin
        .from('companies')
        .update({ status: 'APPROVED', approved_at: new Date().toISOString(), approved_by_email: user.email })
        .eq('id', targetId)
        .eq('status', 'PENDING_APPROVAL')
        .select()
        .single()

      if (error) return errorResponse(error.message)
      await writeAuditLog(targetId, 'company.approved')
      return jsonResponse(data)
    }

    // ── BAN COMPANY ───────────────────────────────────────────────────────────

    if (req.method === 'POST' && section === 'companies' && targetId && action === 'ban') {
      const body = await req.json()
      const banType: 'SOFT' | 'HARD' = body.type ?? 'SOFT'

      const { data, error } = await admin
        .from('companies')
        .update({
          status:        'BANNED',
          last_ban_type: banType,
          banned_at:     new Date().toISOString(),
        })
        .eq('id', targetId)
        .select()
        .single()

      if (error) return errorResponse(error.message)

      if (banType === 'HARD') {
        // Hard ban: revoke all active sessions for company users
        const { data: companyUsers } = await admin
          .from('users')
          .select('id, auth_id')
          .eq('company_id', targetId)

        for (const u of companyUsers ?? []) {
          // Add a deny-list entry for all active JTIs
          // (The JWT JTI would normally come from the token; here we use a wildcard approach)
          await admin.from('session_deny_list').insert({
            jwt_jti:  `hard-ban-${u.id}-${Date.now()}`,
            user_id:  u.id,
            reason:   'hard_ban',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          }).eq('id', u.id)  // no-op guard — insert only

          // Revoke Supabase auth sessions via admin API
          if (u.auth_id) {
            await admin.auth.admin.signOut(u.auth_id, 'global')
          }
        }
      }

      await writeAuditLog(targetId, `company.${banType.toLowerCase()}_banned`, { reason: body.reason })
      return jsonResponse(data)
    }

    // ── UNBAN COMPANY ─────────────────────────────────────────────────────────

    if (req.method === 'POST' && section === 'companies' && targetId && action === 'unban') {
      const { data, error } = await admin
        .from('companies')
        .update({ status: 'PENDING_APPROVAL', banned_at: null, last_ban_type: null })
        .eq('id', targetId)
        .eq('status', 'BANNED')
        .select()
        .single()

      if (error) return errorResponse(error.message)
      await writeAuditLog(targetId, 'company.unbanned')
      return jsonResponse(data)
    }

    // ── AUDIT LOGS ─────────────────────────────────────────────────────────────

    if (req.method === 'GET' && section === 'audit-logs') {
      const page  = parseInt(url.searchParams.get('page')  ?? '1', 10)
      const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)
      const from  = (page - 1) * limit

      const { data, error, count } = await admin
        .from('audit_logs')
        .select('*, users!actor_user_id(name, email), companies!target_company_id(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1)

      if (error) return errorResponse(error.message)
      return jsonResponse({ data, total: count, page, limit })
    }

    // ── START IMPERSONATION ────────────────────────────────────────────────────

    if (req.method === 'POST' && section === 'impersonate' && targetId) {
      const body    = await req.json().catch(() => ({}))
      const ttlMins = body.ttl_minutes ?? 60

      const { data: session, error } = await admin
        .from('impersonation_sessions')
        .insert({
          super_admin_user_id: adminUser?.id,
          super_admin_email:   user.email!,
          target_company_id:   targetId,
          expires_at:          new Date(Date.now() + ttlMins * 60 * 1000).toISOString(),
          ip_address:          req.headers.get('x-forwarded-for'),
          user_agent:          req.headers.get('user-agent'),
        })
        .select()
        .single()

      if (error) return errorResponse(error.message)
      await writeAuditLog(targetId, 'impersonation.started', { session_id: session.id, ttl_minutes: ttlMins })
      return jsonResponse(session, 201)
    }

    // ── END IMPERSONATION ──────────────────────────────────────────────────────

    if (req.method === 'DELETE' && section === 'impersonate' && targetId) {
      const { data: session, error } = await admin
        .from('impersonation_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', targetId)
        .select()
        .single()

      if (error) return errorResponse(error.message)
      await writeAuditLog(session.target_company_id, 'impersonation.ended', { session_id: targetId })
      return jsonResponse(session)
    }

    return errorResponse('Not found', 404)
  } catch (err) {
    console.error('[admin]', err)
    return errorResponse('Internal error', 500)
  }
})
