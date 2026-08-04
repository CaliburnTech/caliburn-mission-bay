/**
 * Onboarding Modal (production mode only)
 *
 * Shown after sign-in when GET /api/me reports onboardingComplete === false
 * (or when the DB user row doesn't exist yet — id === null; the endpoint
 * creates it). Submits POST /api/auth/complete-onboarding:
 *
 *   { role: 'BUYER' }                          — buyer: marks onboarding done
 *   { role: 'SELLER', companyName: '...' }     — seller: creates a
 *     PENDING_APPROVAL company and makes the user its OWNER
 *
 * Blocking by design (no backdrop close) — it's a one-time, single-form step;
 * a sign-out escape hatch is provided. Renders nothing outside production.
 */

import { useState } from 'react';
import { Building2, ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from './useAuth';
import useAuthUIStore from './authUIStore';

const OnboardingModal = () => {
  const { mode, isAuthenticated, user, signOut } = useAuth();
  const { me, meStatus, completeOnboarding, clearMe } = useAuthUIStore();

  const [role, setRole] = useState('BUYER'); // 'BUYER' | 'SELLER'
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const needsOnboarding =
    mode === 'production' &&
    isAuthenticated &&
    meStatus === 'ready' &&
    me &&
    !me.onboardingComplete;

  if (!needsOnboarding) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (role === 'SELLER' && !existingCompany && !companyName.trim()) {
      setError('Please enter your company name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await completeOnboarding({
        role,
        companyName: role === 'SELLER' && !existingCompany ? companyName.trim() : undefined,
      });
      // fetchMe inside completeOnboarding refreshes `me`; onboardingComplete
      // flips true and this modal unmounts.
    } catch (err) {
      setError(err?.message || 'Failed to complete setup');
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    clearMe();
    await signOut();
  };

  const email = me?.email || user?.email || '';
  // A company may already exist (e.g. the auth webhook auto-created one from
  // the email domain on first sign-in). In that case the backend ignores any
  // typed companyName — so show the existing company instead of asking.
  const existingCompany = me?.company || null;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4" style={{ zIndex: 11000 }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-lime-brand font-bold text-xs tracking-widest uppercase mb-2">
            Mission Bay
          </div>
          <h1 className="text-2xl font-semibold text-white">Finish setting up</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Signed in as <span className="text-gray-300">{email}</span>
          </p>
        </div>

        <div className="bg-darker border border-gray-700/40 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                How will you use Mission Bay?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setRole('BUYER'); setError(null); }}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    role === 'BUYER'
                      ? 'border-lime-brand/60 bg-lime-brand/10 text-white'
                      : 'border-gray-700/60 bg-darkest text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <ShoppingCart size={16} className={role === 'BUYER' ? 'text-lime-brand' : 'text-gray-500'} />
                  I&apos;m buying
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('SELLER'); setError(null); }}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    role === 'SELLER'
                      ? 'border-lime-brand/60 bg-lime-brand/10 text-white'
                      : 'border-gray-700/60 bg-darkest text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Building2 size={16} className={role === 'SELLER' ? 'text-lime-brand' : 'text-gray-500'} />
                  I&apos;m selling
                </button>
              </div>
            </div>

            {role === 'SELLER' && existingCompany && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Your company
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-darkest border border-gray-700/60 rounded-lg">
                  <Building2 size={14} className="text-lime-brand shrink-0" />
                  <span className="text-white text-sm">{existingCompany.name}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-gray-500">
                    {existingCompany.status === 'PENDING_APPROVAL' ? 'pending review' : (existingCompany.status || '').toLowerCase()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                  You already belong to this company; continuing links your seller account to it.
                </p>
              </div>
            )}

            {role === 'SELLER' && !existingCompany && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Company name
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    maxLength={200}
                    placeholder="Acme Maritime Systems"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-darkest border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-lime-brand/50 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                  Seller accounts are reviewed by the Caliburn team before listings go live.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-3 py-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (role === 'SELLER' && !existingCompany && !companyName.trim())}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-lime-brand text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-lime-brand/90 transition-colors"
            >
              {submitting ? 'Saving…' : 'Continue'}
            </button>
          </form>
        </div>

        <button
          onClick={handleSignOut}
          className="mx-auto mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
