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

import { APP_MODE } from '../providers/dataInterface';
import { AuthContext, DEMO_AUTH } from './authContext';

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

export default AuthProvider;
