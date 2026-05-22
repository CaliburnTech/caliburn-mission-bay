import { supabase } from './supabase'
import type { BanPayload } from '../types'

/**
 * Base URL for the Mission Bay admin API.
 * In production this points at Supabase Edge Functions:
 *   https://<project>.supabase.co/functions/v1
 * Override via VITE_API_URL in your .env file.
 */
const API_URL =
  import.meta.env.VITE_API_URL ??
  `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1`

/** Server-side impersonation session ID, sent as X-Impersonation-Session-Id. */
let impersonationSessionId: string | null = null

export function setImpersonationSession(id: string | null) {
  impersonationSessionId = id
}

/**
 * Core fetch wrapper.
 * - Retrieves the Supabase access token from the active session on every call
 *   so the bearer token is always fresh (Supabase auto-refreshes under the hood).
 * - Attaches X-Impersonation-Session-Id when an impersonation session is active.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  if (impersonationSessionId) {
    headers['X-Impersonation-Session-Id'] = impersonationSessionId
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Pending approvals ────────────────────────────────────────────────────────

export const getPendingCompanies = () =>
  request<{ companies: import('../types').Company[] }>('/api/admin/companies/pending')

export const approveCompany = (id: string) =>
  request<{ company: import('../types').Company }>(`/api/admin/companies/${id}/approve`, {
    method: 'POST',
  })

export const banCompany = (id: string, payload: BanPayload) =>
  request<{ company: import('../types').Company }>(`/api/admin/companies/${id}/ban`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const unbanCompany = (id: string) =>
  request<{ company: import('../types').Company }>(`/api/admin/companies/${id}/unban`, {
    method: 'POST',
  })

// ─── All companies ────────────────────────────────────────────────────────────

export const getAllCompanies = (params?: { status?: string; search?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return request<{ companies: import('../types').Company[] }>(
    `/api/admin/companies${qs ? `?${qs}` : ''}`,
  )
}

// ─── Impersonation ────────────────────────────────────────────────────────────

/**
 * Start a server-side impersonation session.
 * The returned sessionId must be stored via setImpersonationSession() and
 * passed as X-Impersonation-Session-Id on subsequent requests.
 * The server validates the session against the ImpersonationSession table
 * and checks isSuperAdmin via DB lookup on every call.
 */
export const startImpersonation = (companyId: string) =>
  request<{ sessionId: string; expiresAt: string }>(
    `/api/admin/impersonate/${companyId}`,
    { method: 'POST' },
  )

/**
 * End the active impersonation session.
 * Marks ImpersonationSession.endedAt = now() and writes IMPERSONATION_ENDED
 * to the audit log. The X-Impersonation-Session-Id header is cleared
 * locally by the caller after this resolves.
 */
export const endImpersonation = () =>
  request<void>('/api/admin/impersonate', { method: 'DELETE' })

// ─── Audit log ────────────────────────────────────────────────────────────────

export const getAuditLog = (params?: {
  companyId?: string
  actorId?: string
  action?: string
  from?: string
  to?: string
}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return request<{ entries: import('../types').AuditLogEntry[] }>(
    `/api/admin/audit${qs ? `?${qs}` : ''}`,
  )
}

// ─── User management ─────────────────────────────────────────────────────────

/**
 * Trigger a password-reset email for a user.
 * The backend calls supabase.auth.admin.generateLink({ type: 'recovery', ... })
 * and delivers it via the Supabase email provider.
 */
export const resetUserPassword = (userId: string) =>
  request<void>(`/api/admin/users/${userId}/reset-password`, { method: 'POST' })
