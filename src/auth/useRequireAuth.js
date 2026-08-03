/**
 * useRequireAuth — gate ACTIONS (not browsing) behind sign-in in production.
 *
 * Returns a function: requireAuth(actionLabel?) => boolean
 *   - demo mode (or Supabase-unavailable fallback): always true — demo
 *     behavior is 100% unchanged
 *   - production, signed in: true
 *   - production, signed out: opens the sign-in modal (with the action label
 *     for context) and returns false — caller should abort the action
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   const handleSave = () => {
 *     if (!requireAuth('save this configuration')) return;
 *     ...
 *   };
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import useAuthUIStore from './authUIStore';

export const useRequireAuth = () => {
  const { isAuthenticated, mode } = useAuth();
  const openSignIn = useAuthUIStore((s) => s.openSignIn);

  return useCallback(
    (actionLabel = null) => {
      // Demo mode (including the production demo-fallback when Supabase env
      // vars are missing) — never gate anything.
      if (mode !== 'production') return true;
      if (isAuthenticated) return true;

      openSignIn(actionLabel);
      return false;
    },
    [mode, isAuthenticated, openSignIn]
  );
};

export default useRequireAuth;
