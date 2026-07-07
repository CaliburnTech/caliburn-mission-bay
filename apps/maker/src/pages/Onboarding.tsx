import { useState } from 'react'
import { Building2, Clock, Ban, LogOut } from 'lucide-react'
import { meApi } from '../api/me'
import { signOut } from '../api/client'
import { LoadingSpinner } from '../components/LoadingSpinner'

/** Shared full-screen shell for pre-portal gate screens (matches Login styling). */
function GateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[#cbfd00] font-bold text-xs tracking-widest uppercase mb-2">
            Mission Bay
          </div>
          <h1 className="text-2xl font-semibold text-white">Maker Portal</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

function SignOutLink() {
  return (
    <button
      onClick={() => void signOut()}
      className="mt-6 mx-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
    >
      <LogOut size={13} />
      Sign out
    </button>
  )
}

/**
 * Seller application form, shown when the authenticated user has no company.
 * Submits POST /api/auth/complete-onboarding with role SELLER, then calls
 * onComplete so App.tsx re-fetches /api/me and moves to the pending screen.
 */
export function Onboarding({
  email,
  onComplete,
}: {
  email: string
  onComplete: () => Promise<void> | void
}) {
  const [companyName, setCompanyName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const name = companyName.trim()
    if (!name) {
      setError('Please enter your company name.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await meApi.completeOnboarding(name)
      await onComplete()
      // On success App.tsx re-renders into the pending-review screen.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
      setSubmitting(false)
    }
  }

  return (
    <GateShell>
      <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-6">
        <div className="w-12 h-12 mb-4 rounded-full bg-[#cbfd00]/10 border border-[#cbfd00]/30 flex items-center justify-center">
          <Building2 size={20} className="text-[#cbfd00]" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1.5">Apply as a seller</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          You're signed in as <span className="text-white font-medium">{email}</span>, but your
          account isn't linked to a company yet. Tell us who you are and we'll create your seller
          application — the Caliburn team reviews every company before it can list products.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              maxLength={200}
              placeholder="Acme Maritime Systems"
              className="w-full px-3.5 py-2.5 bg-[#0f1419] border border-gray-700/60 rounded-lg text-white placeholder-gray-700 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-3 py-2.5 rounded-lg text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !companyName.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-[#b8e600] transition-colors"
          >
            {submitting ? <LoadingSpinner size="sm" /> : null}
            {submitting ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </div>
      <SignOutLink />
    </GateShell>
  )
}

/** Shown while the company is PENDING_APPROVAL — no portal access yet. */
export function PendingApproval({ companyName }: { companyName?: string }) {
  return (
    <GateShell>
      <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
          <Clock size={20} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1.5">Application pending review</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          {companyName ? (
            <>
              Your seller application for{' '}
              <span className="text-white font-medium">{companyName}</span> is with the Caliburn
              team.
            </>
          ) : (
            <>Your seller application is with the Caliburn team.</>
          )}{' '}
          We'll email you once it's approved — you'll get full access to the Maker Portal then.
        </p>
      </div>
      <SignOutLink />
    </GateShell>
  )
}

/** Shown when the company has been banned — portal access is blocked. */
export function BannedNotice({ companyName }: { companyName?: string }) {
  return (
    <GateShell>
      <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <Ban size={20} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1.5">Account suspended</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          {companyName ? (
            <>
              <span className="text-white font-medium">{companyName}</span> has been suspended from
              the marketplace.
            </>
          ) : (
            <>Your company has been suspended from the marketplace.</>
          )}{' '}
          If you believe this is a mistake, contact the Caliburn team.
        </p>
      </div>
      <SignOutLink />
    </GateShell>
  )
}
