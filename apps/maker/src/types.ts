export type ProductStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ARCHIVED'
export type ProductType = 'PLATFORM' | 'CAPABILITY'

export type CompanyStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'BANNED'
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER'

/** Company summary embedded in GET /api/me. */
export interface MeCompany {
  id: string
  name: string
  status: CompanyStatus
  isSeller: boolean
}

/** Response of GET /api/me — the authenticated user's DB row + company. */
export interface Me {
  /** null when the DB user row doesn't exist yet (pre-onboarding). */
  id: string | null
  authId: string
  email: string
  name: string | null
  role: UserRole | null
  companyId: string | null
  effectiveCompanyId: string | null
  onboardingComplete: boolean
  company: MeCompany | null
}

/** Response of GET/PUT/DELETE /api/company/anthropic-key. */
export interface AnthropicKeyStatus {
  configured: boolean
  last4?: string
}

export interface Product {
  id: string
  companyId: string
  type: ProductType
  name: string
  description: string | null
  category: string | null
  trlLevel: number | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
  _count?: { events: number; leads: number }
}

export interface Company {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  website: string | null
  email: string | null
  phone: string | null
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'BANNED'
}

export interface ProductStats {
  views: number
  configurations: number
  leads: number
  period: '30d'
}

export interface Lead {
  id: string
  productId: string
  userId: string | null
  createdAt: string
}

export interface ConfigSummary {
  configId: string
  configName: string | null
  coProducts: { id: string; name: string; type: ProductType; category: string | null }[]
}
