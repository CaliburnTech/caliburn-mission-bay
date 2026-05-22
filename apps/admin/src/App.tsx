import { useState } from 'react'
import { Shield, Clock, Building2, Eye, ScrollText } from 'lucide-react'
import { PendingApprovals } from './pages/PendingApprovals'
import { Companies } from './pages/Companies'
import { ImpersonateSelector } from './pages/ImpersonateSelector'
import { AuditLog } from './pages/AuditLog'
import { ImpersonationBanner } from './components/ImpersonationBanner'
import { endImpersonation, setImpersonationSession } from './lib/api'
import type { ImpersonationSession } from './types'

type Page = 'pending' | 'companies' | 'impersonate' | 'audit'

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'pending', label: 'Pending Approvals', icon: <Clock size={16} /> },
  { id: 'companies', label: 'Companies', icon: <Building2 size={16} /> },
  { id: 'impersonate', label: 'Impersonate', icon: <Eye size={16} /> },
  { id: 'audit', label: 'Audit Log', icon: <ScrollText size={16} /> },
]

export default function App() {
  const [page, setPage] = useState<Page>('pending')
  const [impersonationSession, setImpersonationSessionState] = useState<ImpersonationSession | null>(null)

  function handleImpersonate(session: ImpersonationSession) {
    setImpersonationSessionState(session)
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
        </main>
      </div>
    </div>
  )
}
