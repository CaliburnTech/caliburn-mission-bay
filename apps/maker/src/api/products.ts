import { api } from './client'
import type { Product, ProductStats, Lead, ConfigSummary, ProductType } from '../types'

export const productsApi = {
  list: () => api.get<Product[]>('/api/products'),

  get: (id: string) => api.get<Product>(`/api/products/${id}`),

  create: (data: {
    type: ProductType
    name: string
    description?: string
    category?: string
    trlLevel?: number
  }) => api.post<Product>('/api/products', data),

  update: (
    id: string,
    data: { name: string; description?: string; category?: string; trlLevel?: number },
  ) => api.put<Product>(`/api/products/${id}`, data),

  archive: (id: string) => api.delete<{ archived: boolean }>(`/api/products/${id}`),

  submit: (id: string) => api.post<Product>(`/api/products/${id}/submit`, {}),

  stats: (id: string) => api.get<ProductStats>(`/api/products/${id}/stats`),

  leads: (id: string) => api.get<Lead[]>(`/api/products/${id}/leads`),

  configs: (id: string) => api.get<ConfigSummary[]>(`/api/products/${id}/configs`),
}
