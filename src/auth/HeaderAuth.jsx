/**
 * HeaderAuth (production mode only)
 *
 * Marketplace header widget:
 *   - signed out → "Sign In" button (opens the sign-in modal)
 *   - signed in  → email + company chip with a sign-out action
 *
 * Also owns the /api/me lifecycle: fetches it when a session appears
 * (identity + onboarding state) and clears it on sign-out. Renders nothing
 * in demo mode or the Supabase-unavailable fallback (mode !== 'production').
 */

import { useEffect } from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuth } from './useAuth';
import useAuthUIStore from './authUIStore';

const HeaderAuth = () => {
  const { mode, isAuthenticated, isLoading, user, signOut } = useAuth();
  const { me, openSignIn, fetchMe, clearMe } = useAuthUIStore();

  const isProductionAuth = mode === 'production';

  // Load /api/me when a session appears; clear it when the session ends.
  // Zustand actions (not React setState) — safe to call from an effect.
  useEffect(() => {
    if (!isProductionAuth) return;
    if (isAuthenticated) {
      fetchMe();
    } else {
      clearMe();
    }
  }, [isProductionAuth, isAuthenticated, fetchMe, clearMe]);

  if (!isProductionAuth || isLoading) return null;

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => openSignIn()}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-transparent border border-lime-brand/50 text-lime-brand rounded-lg text-xs md:text-sm font-semibold hover:bg-lime-brand/10 transition-colors flex-shrink-0 whitespace-nowrap"
      >
        <LogIn size={15} />
        Sign In
      </button>
    );
  }

  const email = me?.email || user?.email || '';
  const companyName = me?.company?.name || null;

  return (
    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 min-w-0">
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600/40 bg-darkest min-w-0">
        <UserRound size={14} className="text-lime-brand flex-shrink-0" />
        <div className="min-w-0 text-right md:text-left">
          <div className="text-gray-200 text-xs font-semibold truncate max-w-[180px]" title={email}>
            {email}
          </div>
          {companyName && (
            <div className="text-gray-500 text-[10px] truncate max-w-[180px]" title={companyName}>
              {companyName}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => { clearMe(); signOut(); }}
        title={email ? `Sign out (${email})` : 'Sign out'}
        className="flex items-center gap-1.5 px-3 py-2 bg-transparent border border-gray-600/40 text-gray-400 rounded-lg text-xs font-semibold hover:text-gray-200 hover:border-gray-500/60 transition-colors whitespace-nowrap"
      >
        <LogOut size={13} />
        <span className="hidden md:inline">Sign Out</span>
      </button>
    </div>
  );
};

export default HeaderAuth;
