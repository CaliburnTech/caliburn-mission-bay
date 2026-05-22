import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

// ─── Re-export Supabase's auth user as a named alias ─────────────────────────
// Use this type when you need to work with the currently-signed-in Caliburn
// super-admin (e.g. reading user.email to derive isSuperAdmin, accessing
// user.app_metadata set by the Supabase Auth hook).
export type { SupabaseAuthUser }

// ─── Domain types ─────────────────────────────────────────────────────────────

export type CompanyStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'BANNED'
export type BanType = 'SOFT' | 'HARD'
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Company {
  id: string
  name: string
  status: CompanyStatus
  approvalRequestedAt: string
  approvedAt?: string
  approvedByUserId?: string
  bannedAt?: string
  bannedByUserId?: string
  banReason?: string
  /** Which ban intent was used most recently — informs unban behavior. */
  lastBanType?: BanType
  contactEmail: string
  description?: string
  userCount?: number
}

/** A Mission Bay platform user stored in our database. Distinct from SupabaseAuthUser. */
export interface User {
  id: string           // matches auth.users.id (Supabase UUID)
  email: string
  role: UserRole
  companyId: string
  companyName?: string
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  actorUserId: string
  actorEmail?: string
  /** Set when the action was taken inside an impersonation session. */
  impersonationSessionId?: string
  /** Denormalized from ImpersonationSession for fast filtering. */
  impersonatingCompanyId?: string
  impersonatingCompanyName?: string
  action: string       // e.g. 'COMPANY_APPROVED' | 'COMPANY_BANNED' | 'IMPERSONATION_STARTED'
  targetType: string   // e.g. 'COMPANY' | 'USER'
  targetId: string
  metadata?: Record<string, unknown>
  createdAt: string
}

/**
 * Server-side impersonation session.
 * Created by POST /api/admin/impersonate/:companyId and validated on every
 * subsequent request via the X-Impersonation-Session-Id header.
 */
export interface ImpersonationSession {
  id: string
  actorUserId: string
  targetCompanyId: string
  targetCompanyName: string
  startedAt: string
  expiresAt: string       // default: startedAt + 1 hour
  endedAt?: string
  endReason?: 'manual' | 'expired' | 'super_admin_revoked'
}

export interface BanPayload {
  type: BanType
  reason: string
}
