/**
 * useAuth hook — separated from AuthProvider for fast-refresh compatibility.
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
import { useContext } from 'react';
import { AuthContext, DEMO_AUTH } from './authContext';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Outside provider — return demo defaults
    return DEMO_AUTH;
  }
  return ctx;
};
