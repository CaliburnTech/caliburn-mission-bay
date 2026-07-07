import { supabase } from './supabase'
import type { BanPayload } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string

if (!API_URL) {
  console.warn('[admin] VITE_API_URL is not set — API calls will fail')
}

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

export const getAllCompanies = (
  params?: { status?: string; search?: string },
  signal?: AbortSignal,
) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return request<{ companies: import('../types').Company[] }>(
    `/api/admin/companies${qs ? `?${qs}` : ''}`,
    { signal },
  )
}

// ─── Demo submissions ─────────────────────────────────────────────────────────

/**
 * List saved boat configurations (SavedConfiguration table), super-admin only.
 * Goes through the authenticated API (bearer token) instead of reading the
 * table directly with the anon key.
 * Response: { submissions: Submission[] } ordered by createdAt descending.
 */
export const getSubmissions = () =>
  request<{ submissions: import('../types').Submission[] }>('/api/admin/submissions')

/**
 * Permanently delete a saved boat configuration, super-admin only.
 * Response: { deleted: true, id }.
 */
export const deleteSubmission = (id: string) =>
  request<{ deleted: true; id: string }>(`/api/admin/submissions/${id}`, {
    method: 'DELETE',
  })

// ─── Product review & publish ─────────────────────────────────────────────────

/** Products awaiting Caliburn action (IN_REVIEW to approve/reject, APPROVED to publish). */
export const getReviewProducts = () =>
  request<import('../types').AdminProduct[]>('/api/admin/products')

export const approveProduct = (id: string) =>
  request<import('../types').AdminProduct>(`/api/admin/products/${id}/approve`, {
    method: 'POST',
  })

export const rejectProduct = (id: string, reason?: string) =>
  request<import('../types').AdminProduct>(`/api/admin/products/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason ?? '' }),
  })

/** Admin-only publish (creates a new ProductVersion snapshot). */
export const publishProduct = (id: string, changelog?: string) =>
  request<{ version: { versionNumber: number } }>(`/api/products/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify({ changelog: changelog ?? '' }),
  })

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
