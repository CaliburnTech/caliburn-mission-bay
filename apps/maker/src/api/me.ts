import { api } from './client'
import type { Me } from '../types'

export const meApi = {
  /** Fetch the authenticated user + company (drives onboarding/approval gating). */
  get: () => api.get<Me>('/api/me'),

  /**
   * Complete seller onboarding: creates a PENDING_APPROVAL company with the
   * caller as OWNER and marks onboardingComplete. Re-fetch /api/me afterwards
   * to pick up the new company. Server responds 400 { error } on bad input.
   */
  completeOnboarding: (companyName: string) =>
    api.post<unknown>('/api/auth/complete-onboarding', {
      role: 'SELLER',
      companyName,
    }),
}
