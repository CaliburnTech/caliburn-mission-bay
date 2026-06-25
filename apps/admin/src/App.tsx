import { useState, useEffect } from 'react'
import { Shield, Clock, Building2, Eye, ScrollText, Inbox } from 'lucide-react'
import { PendingApprovals } from './pages/PendingApprovals'
import { Companies } from './pages/Companies'
import { ImpersonateSelector } from './pages/ImpersonateSelector'
import { AuditLog } from './pages/AuditLog'
import { Submissions } from './pages/Submissions'
import { ImpersonationBanner } from './components/ImpersonationBanner'
import { endImpersonation, setImpersonationSession } from './lib/api'
import { supabase } from './lib/supabase'
import type { ImpersonationSession } from './types'
import type { Session } from '@supabase/supabase-js'

type Page = 'pending' | 'companies' | 'impersonate' | 'audit' | 'submissions'

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'pending', label: 'Pending Approvals', icon: <Clock size={16} /> },
  { id: 'companies', label: 'Companies', icon: <Building2 size={16} /> },
  { id: 'impersonate', label: 'Impersonate', icon: <Eye size={16} /> },
  { id: 'audit', label: 'Audit Log', icon: <ScrollText size={16} /> },
  { id: 'submissions', label: 'Demo Submissions', icon: <Inbox size={16} /> },
]

export default function App() {
  const [page, setPage] = useState<Page>('pending')
  const [impersonationSession, setImpersonationSessionState] = useState<ImpersonationSession | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleImpersonate(s: ImpersonationSession) {
    setImpersonationSessionState(s)
    setPage('companies')
  }

  async function handleExitImpersonation() {
    try {
      await endImpersonation()
    } catch {
      // best-effort — clear locally regardless
    }
    setImpersonationSession(null)
    setImpersonationSessionState(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoggingIn(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError(error.message)
    setLoggingIn(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <Shield size={20} className="text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Caliburn Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-600">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm py-2 px-4 rounded-md transition-colors"
            >
              {loggingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!session.user.email?.endsWith('@caliburn.us')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <Shield size={24} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Access denied</h1>
          <p className="text-sm text-gray-600 mb-6">This portal is restricted to Caliburn staff.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-blue-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${impersonationSession ? 'pt-10' : ''}`}>
      {impersonationSession && (
        <ImpersonationBanner session={impersonationSession} onExit={handleExitImpersonation} />
      )}

      <div className="flex h-[calc(100vh-2.5rem)]" style={{ height: impersonationSession ? 'calc(100vh - 2.5rem)' : '100vh' }}>
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <Shield size={18} className="text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">Caliburn Admin</span>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  page === item.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Mission Bay · Super-admin
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8">
          {page === 'pending' && <PendingApprovals />}
          {page === 'companies' && (
            <Companies onImpersonate={handleImpersonate} />
          )}
          {page === 'impersonate' && (
            <ImpersonateSelector
              onImpersonate={handleImpersonate}
              activeSession={impersonationSession}
            />
          )}
          {page === 'audit' && <AuditLog />}
          {page === 'submissions' && <Submissions />}
        </main>
      </div>
    </div>
  )
}
