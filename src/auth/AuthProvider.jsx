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
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }

  return (
    <AuthContext.Provider value={DEMO_AUTH}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
