/**
 * Auth Provider
 *
 * Wraps the app with authentication context.
 * - Demo mode: no-op, everything is accessible
 * - Production mode: Clerk auth (Phase 2 will implement this)
 *
 * Components use the useAuth() hook which returns the same interface
 * regardless of mode.
 */

import { createContext, useContext } from 'react';
import { APP_MODE } from '../providers/dataInterface';

const AuthContext = createContext(null);

// Demo auth state — no login required, full access
const DEMO_AUTH = {
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

/**
 * Auth Provider component.
 * In demo mode, provides a static auth context.
 * In production mode, will wrap with Clerk (Phase 2).
 */
export const AuthProvider = ({ children }) => {
  if (APP_MODE === 'production') {
    // Phase 2: Replace with Clerk provider
    // return <ClerkProvider publishableKey={...}><ClerkAuthBridge>{children}</ClerkAuthBridge></ClerkProvider>
    console.warn('[Production] Clerk auth not yet configured — falling back to demo auth');
  }

  return (
    <AuthContext.Provider value={DEMO_AUTH}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Auth hook — same interface in both modes.
 *
 * @returns {{
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   user: Object|null,
 *   company: Object|null,
 *   role: string,
 *   mode: string,
 *   signIn: Function,
 *   signOut: Function
 * }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Outside provider — return demo defaults
    return DEMO_AUTH;
  }
  return ctx;
};

export default AuthProvider;
