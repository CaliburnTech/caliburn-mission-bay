export type ProductStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ARCHIVED'
export type ProductType = 'PLATFORM' | 'CAPABILITY'

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
