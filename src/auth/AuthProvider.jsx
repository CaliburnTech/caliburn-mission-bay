/**
 * Auth Provider
 *
 * Wraps the app with authentication context.
 * - Demo mode: no-op, static auth context, everything accessible
 * - Production mode: Supabase Auth — listens for session changes and
 *   initializes the data store with the bearer token
 *
 * Components consume via useAuth() — same interface in both modes.
 */

import { useState, useEffect } from 'react';
import { APP_MODE } from '../providers/dataInterface';
import { AuthContext, DEMO_AUTH } from './authContext';
import { supabase } from './supabaseClient';
import useDataStore from '../providers/dataStore';

/**
 * Fallback for production mode when the Supabase client could not be created
 * (VITE_SUPABASE_* env vars unset). Provides demo auth so the app still boots,
 * and initializes the data store with no token.
 */
const DemoFallbackProvider = ({ children }) => {
  const initialize = useDataStore(s => s.initialize);

  useEffect(() => {
    console.warn('[AuthProvider] Supabase client unavailable — running with demo auth.');
    initialize(null);
  }, [initialize]);

  return (
    <AuthContext.Provider value={DEMO_AUTH}>
      {children}
    </AuthContext.Provider>
  );
};

const SupabaseAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialize = useDataStore(s => s.initialize);

  useEffect(() => {
    // Hydrate existing session on mount, then initialize the data store
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      initialize(s?.access_token ?? null);
      setIsLoading(false);
    });

    // Re-initialize whenever the session changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      initialize(s?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, [initialize]);

  const value = {
    isAuthenticated: !!session,
    isLoading,
    user: session?.user ?? null,
    company: null,     // populated from /me endpoint by consuming components
    role: session?.user?.app_metadata?.role ?? 'viewer',
    mode: 'production',
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signInWithOAuth: (provider) => supabase.auth.signInWithOAuth({ provider }),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }) => {
  if (APP_MODE === 'production') {
    // If the Supabase client could not be created (missing env vars),
    // fall back to demo auth instead of crashing at boot.
    if (!supabase) {
      return <DemoFallbackProvider>{children}</DemoFallbackProvider>;
    }
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }

  return (
    <AuthContext.Provider value={DEMO_AUTH}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
