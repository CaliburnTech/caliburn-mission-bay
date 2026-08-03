/**
 * Sign-In Modal (production mode only)
 *
 * Magic-link-first sign-in (Supabase signInWithOtp), with password sign-in as
 * a secondary tab. Visual pattern mirrors the proven Maker Portal login
 * (apps/maker/src/pages/Login.tsx) using the buyer portal's Tailwind tokens
 * (bg-darkest #0f1419, lime-brand #cbfd00).
 *
 * Opened by useRequireAuth() when a signed-out user hits a gated action, or
 * by the header "Sign In" button. Renders nothing outside production mode.
 */

import { useState, useEffect } from 'react';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { useAuth } from './useAuth';
import useAuthUIStore from './authUIStore';

const inputClass =
  'w-full pl-9 pr-3.5 py-2.5 bg-darkest border border-gray-700/60 rounded-lg text-white ' +
  'placeholder-gray-600 text-sm focus:outline-none focus:border-lime-brand/50 transition-colors';

const primaryButtonClass =
  'w-full flex items-center justify-center gap-2 py-2.5 bg-lime-brand text-black font-semibold ' +
  'rounded-lg text-sm disabled:opacity-40 hover:bg-lime-brand/90 transition-colors';

const SignInModal = () => {
  const { mode, isAuthenticated, signIn, signInWithMagicLink } = useAuth();
  const { signInOpen, signInReason, closeSignIn } = useAuthUIStore();

  const [tab, setTab] = useState('magic-link'); // 'magic-link' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [magicSent, setMagicSent] = useState(false);

  // Close automatically once the session lands (password sign-in success).
  useEffect(() => {
    if (signInOpen && isAuthenticated) {
      closeSignIn();
    }
  }, [signInOpen, isAuthenticated, closeSignIn]);

  // Escape closes
  useEffect(() => {
    if (!signInOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeSignIn(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [signInOpen, closeSignIn]);

  if (mode !== 'production' || !signInOpen) return null;

  const resetTransient = () => { setError(null); setLoading(false); };

  const handleClose = () => {
    resetTransient();
    setMagicSent(false);
    closeSignIn();
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await signInWithMagicLink(email);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setMagicSent(true);
    }
  };

  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // On success onAuthStateChange fires → isAuthenticated → effect closes modal.
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: 12000 }} /* above all app modals (SBOM/SV-2 use 9999) */
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-sm">
        {magicSent ? (
          /* ── Magic link sent confirmation ── */
          <div className="bg-darker border border-gray-700/40 rounded-xl p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-lime-brand/10 border border-lime-brand/30 flex items-center justify-center">
              <Mail size={22} className="text-lime-brand" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We sent a sign-in link to{' '}
              <span className="text-white font-medium">{email}</span>.
              Click it to sign in to Mission Bay — no password needed.
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to sign in
            </button>
            <button
              onClick={handleClose}
              className="block mx-auto mt-2 text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              Continue browsing
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-lime-brand font-bold text-xs tracking-widest uppercase mb-2">
                Mission Bay
              </div>
              <h1 className="text-2xl font-semibold text-white">Sign in</h1>
              <p className="text-gray-500 text-sm mt-1.5">
                {signInReason
                  ? `Sign in to ${signInReason}.`
                  : 'Sign in to save configurations, request purchases, and export SBOMs.'}
              </p>
            </div>

            {/* Tab switcher — magic link is primary */}
            <div className="flex rounded-lg bg-darker border border-gray-700/40 p-1 mb-4">
              <button
                onClick={() => { setTab('magic-link'); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'magic-link' ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Sparkles size={11} />
                Magic link
              </button>
              <button
                onClick={() => { setTab('password'); setError(null); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'password' ? 'bg-gray-700/60 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Password
              </button>
            </div>

            {/* Form card */}
            <div className="bg-darker border border-gray-700/40 rounded-xl p-6">
              {tab === 'magic-link' ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enter your email and we&apos;ll send a one-click sign-in link — no password required.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-3 py-2.5 rounded-lg text-xs">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || !email} className={primaryButtonClass}>
                    {loading ? 'Sending…' : (
                      <>
                        <Sparkles size={14} /> Send magic link
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-3 py-2.5 rounded-lg text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className={primaryButtonClass}
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={handleClose}
              className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Continue browsing without signing in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInModal;
