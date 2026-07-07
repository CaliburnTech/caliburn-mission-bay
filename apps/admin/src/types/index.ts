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
 * Client-side view of a server-side impersonation session.
 * Created by POST /api/admin/impersonate/:companyId (which returns
 * { sessionId, expiresAt }) and validated on every subsequent request via
 * the X-Impersonation-Session-Id header. Only fields the client actually
 * knows are kept here — actor/start/end bookkeeping lives server-side.
 */
export interface ImpersonationSession {
  /** Server-issued session id (sent as X-Impersonation-Session-Id). */
  id: string
  /** Company being impersonated (chosen by the admin client-side). */
  companyId: string
  companyName: string
  /** ISO timestamp returned by the server. */
  expiresAt: string
}

export interface BanPayload {
  type: BanType
  reason: string
}

// ─── Demo submissions (SavedConfiguration) ───────────────────────────────────

export interface SbomComponent {
  name: string
  version?: string
  supplier?: { name: string }
  category?: string
  license?: string
  purl?: string
  isTopLevel?: boolean
}

export interface Sbom {
  bomFormat?: string
  specVersion?: string
  components?: SbomComponent[]
  context?: Record<string, unknown>
}

export interface ConfigData extends Record<string, unknown> {
  sbom?: Sbom
  slots?: Record<string, (string | null)[]>
  hullName?: string
}

/**
 * A saved boat configuration, as returned by GET /api/admin/submissions
 * (super-admin only; responds { submissions: Submission[] } ordered by
 * createdAt descending).
 */
export interface Submission {
  id: string
  name: string
  submittedBy: string | null
  configData: ConfigData
  companyId: string
  createdAt: string
  updatedAt: string
}
