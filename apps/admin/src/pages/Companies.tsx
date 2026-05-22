import { useEffect, useState, useCallback } from 'react'
import { Search, Ban, CheckCircle, Eye, RefreshCw, Building2, Undo2 } from 'lucide-react'
import { getAllCompanies, approveCompany, banCompany, unbanCompany, startImpersonation } from '../lib/api'
import { setImpersonationSession } from '../lib/api'
import type { Company, BanType, ImpersonationSession } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { BanModal } from '../components/BanModal'

interface Props {
  onImpersonate: (session: ImpersonationSession) => void
}

export function Companies({ onImpersonate }: Props) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [banTarget, setBanTarget] = useState<Company | null>(null)
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (statusFilter !== 'ALL') params.status = statusFilter
      if (search.trim()) params.search = search.trim()
      const res = await getAllCompanies(params)
      setCompanies(res.companies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  async function handleApprove(company: Company) {
    setActionInFlight(company.id)
    try {
      const res = await approveCompany(company.id)
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? res.company : c)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approve failed')
    } finally {
      setActionInFlight(null)
    }
  }

  async function handleUnban(company: Company) {
    setActionInFlight(company.id)
    try {
      const res = await unbanCompany(company.id)
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? res.company : c)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unban failed')
    } finally {
      setActionInFlight(null)
    }
  }

  async function handleBanConfirm(type: BanType, reason: string) {
    if (!banTarget) return
    const id = banTarget.id
    setActionInFlight(id)
    setBanTarget(null)
    try {
      const res = await banCompany(id, { type, reason })
      setCompanies((prev) => prev.map((c) => (c.id === id ? res.company : c)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ban failed')
    } finally {
      setActionInFlight(null)
    }
  }

  async function handleImpersonate(company: Company) {
    setActionInFlight(company.id)
    try {
      const { sessionId, expiresAt } = await startImpersonation(company.id)
      setImpersonationSession(sessionId)
      onImpersonate({
        id: sessionId,
        actorUserId: '',
        targetCompanyId: company.id,
        targetCompanyName: company.name,
        startedAt: new Date().toISOString(),
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
          <h1 className="text-xl font-semibold text-gray-900">All Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage company status, bans, and impersonation
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

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING_APPROVAL">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Requested</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No companies found</td>
              </tr>
            )}
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-400">{company.contactEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={company.status} />
                  {company.lastBanType && (
                    <span className="ml-1 text-xs text-gray-400">({company.lastBanType.toLowerCase()})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(company.approvalRequestedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    {company.status === 'PENDING_APPROVAL' && (
                      <button
                        disabled={actionInFlight === company.id}
                        onClick={() => handleApprove(company)}
                        title="Approve"
                        className="p-1.5 rounded hover:bg-green-50 text-green-600 disabled:opacity-40"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {company.status === 'BANNED' && (
                      <button
                        disabled={actionInFlight === company.id}
                        onClick={() => handleUnban(company)}
                        title="Unban"
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600 disabled:opacity-40"
                      >
                        <Undo2 size={15} />
                      </button>
                    )}
                    {company.status !== 'BANNED' && (
                      <button
                        disabled={actionInFlight === company.id}
                        onClick={() => setBanTarget(company)}
                        title="Ban"
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-40"
                      >
                        <Ban size={15} />
                      </button>
                    )}
                    <button
                      disabled={actionInFlight === company.id}
                      onClick={() => handleImpersonate(company)}
                      title="Impersonate"
                      className="p-1.5 rounded hover:bg-amber-50 text-amber-600 disabled:opacity-40"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {banTarget && (
        <BanModal company={banTarget} onConfirm={handleBanConfirm} onClose={() => setBanTarget(null)} />
      )}
    </div>
  )
}
