import { useState } from 'react'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/LoadingSpinner'

type Mode = 'password' | 'magic-link'

export function Login() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
    // On success the SDK fires onAuthStateChange → App.tsx routes to #products automatically.
    // Keep the spinner visible during that transition.
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setMagicSent(true)
    }
  }

  // ── Magic link sent confirmation ──────────────────────────────────────────
  if (magicSent) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#cbfd00]/10 border border-[#cbfd00]/30 flex items-center justify-center">
            <Mail size={22} className="text-[#cbfd00]" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a sign-in link to{' '}
            <span className="text-white font-medium">{email}</span>. Click it to access the Maker
            Portal — no password needed.
          </p>
          <button
            onClick={() => {
              setMagicSent(false)
              setMode('password')
            }}
            className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    )
  }

  // ── Main login card ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[#cbfd00] font-bold text-xs tracking-widest uppercase mb-2">
            Mission Bay
          </div>
          <h1 className="text-2xl font-semibold text-white">Maker Portal</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Sign in to manage your products and listings.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-[#1a2530] border border-gray-700/40 p-1 mb-5">
          <button
            onClick={() => { setMode('password'); setError(null) }}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'password'
                ? 'bg-[#2a3844] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => { setMode('magic-link'); setError(null) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'magic-link'
                ? 'bg-[#2a3844] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Sparkles size={11} />
            Magic link
          </button>
        </div>

        {/* Form card */}
        <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-6">
          {mode === 'password' ? (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f1419] border border-gray-700/60 rounded-lg text-white placeholder-gray-700 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f1419] border border-gray-700/60 rounded-lg text-white placeholder-gray-700 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-[#b8e600] transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" /> : null}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter your email and we'll send a one-click sign-in link — no password required.
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f1419] border border-gray-700/60 rounded-lg text-white placeholder-gray-700 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
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
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-[#b8e600] transition-colors"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Sparkles size={14} />}
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
