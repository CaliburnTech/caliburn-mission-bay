/**
 * Auth UI Store (production mode only)
 *
 * Zustand store driving the production login/onboarding UI:
 *   - Sign-in modal open state (+ the action that triggered it, for context)
 *   - /api/me profile (drives onboarding + header identity)
 *   - complete-onboarding submission
 *
 * Demo mode never opens the sign-in modal (useRequireAuth short-circuits)
 * and never calls fetchMe, so this store stays inert there.
 */

import { create } from 'zustand';
import { authedFetch } from '../services/authedFetch';

const useAuthUIStore = create((set, get) => ({
  // ── Sign-in modal ──
  signInOpen: false,
  signInReason: null, // e.g. 'save this configuration' — shown in the modal

  openSignIn: (reason = null) => set({ signInOpen: true, signInReason: reason }),
  closeSignIn: () => set({ signInOpen: false, signInReason: null }),

  // ── /api/me profile ──
  // Shape: { id, authId, email, name, role, companyId, effectiveCompanyId,
  //          onboardingComplete, company } — see api/me.js
  me: null,
  meStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  meError: null,

  fetchMe: async () => {
    if (get().meStatus === 'loading') return;
    set({ meStatus: 'loading', meError: null });
    try {
      const me = await authedFetch('/me');
      set({ me, meStatus: 'ready', meError: null });
    } catch (err) {
      set({ me: null, meStatus: 'error', meError: err?.message || 'Failed to load account' });
    }
  },

  clearMe: () => set({ me: null, meStatus: 'idle', meError: null }),

  /**
   * POST /api/auth/complete-onboarding — body { role: 'BUYER'|'SELLER', companyName? }.
   * companyName is required by the API only when role is SELLER.
   * Re-fetches /api/me afterwards so onboardingComplete/company update.
   */
  completeOnboarding: async ({ role, companyName }) => {
    await authedFetch('/auth/complete-onboarding', {
      method: 'POST',
      body: JSON.stringify(
        role === 'SELLER' ? { role, companyName } : { role }
      ),
    });
    await get().fetchMe();
  },
}));

export default useAuthUIStore;
