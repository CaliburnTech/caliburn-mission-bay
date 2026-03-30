/**
 * Auth context and demo defaults — separated for fast-refresh compatibility.
 * AuthProvider.jsx imports from here to avoid exporting non-components.
 */
import { createContext } from 'react';

export const AuthContext = createContext(null);

// Demo auth state — no login required, full access
export const DEMO_AUTH = {
  isAuthenticated: true,
  isLoading: false,
  user: null,
  company: null,
  role: 'admin',
  mode: 'demo',

  // No-op methods
  signIn: () => console.warn('[Demo] Sign in not available'),
  signOut: () => console.warn('[Demo] Sign out not available'),
};
