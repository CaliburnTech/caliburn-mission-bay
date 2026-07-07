import { useEffect, useState, useCallback } from 'react'
import { Eye, Search, Building2, RefreshCw } from 'lucide-react'
import { getAllCompanies, startImpersonation } from '../lib/api'
import { setImpersonationSession } from '../lib/api'
import type { Company, ImpersonationSession } from '../types'
import { StatusBadge } from '../components/StatusBadge'

interface Props {
  onImpersonate: (session: ImpersonationSession) => void
  activeSession: ImpersonationSession | null
}

export function ImpersonateSelector({ onImpersonate, activeSession }: Props) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllCompanies()
      setCompanies(res.companies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.contactEmail.toLowerCase().includes(q)
  })

  async function handleImpersonate(company: Company) {
    setActionInFlight(company.id)
    try {
      const { sessionId, expiresAt } = await startImpersonation(company.id)
      setImpersonationSession(sessionId)
      onImpersonate({
        id: sessionId,
        companyId: company.id,
        companyName: company.name,
        expiresAt,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Impersonation failed')
    } finally {
      setActionInFlight(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Impersonate Company</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Start a server-side impersonation session to act on behalf of a company. All actions are audit-logged.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {activeSession && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <span className="font-medium">Active session:</span> Acting as{' '}
          <span className="font-semibold">{activeSession.companyName}</span> — expires{' '}
          {new Date(activeSession.expiresAt).toLocaleTimeString()}. Starting a new session will replace it.
        </div>
      )}

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by company name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No companies match</div>
        )}
        {filtered.map((company) => {
          const isActive = activeSession?.companyId === company.id
          return (
            <div
              key={company.id}
              className={`flex items-center gap-3 p-4 border rounded-lg ${isActive ? 'border-amber-300 bg-amber-50' : 'bg-white border-gray-200'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Building2 size={15} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">{company.name}</span>
                  <StatusBadge status={company.status} />
                  {isActive && (
                    <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                      active
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{company.contactEmail}</div>
              </div>
              <button
                disabled={actionInFlight === company.id || isActive}
                onClick={() => handleImpersonate(company)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Eye size={13} />
                {isActive ? 'Active' : 'Act as'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
