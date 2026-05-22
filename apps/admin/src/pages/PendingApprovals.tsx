import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Ban, Clock, RefreshCw, Building2 } from 'lucide-react'
import { getPendingCompanies, approveCompany, banCompany } from '../lib/api'
import type { Company, BanType } from '../types'
import { BanModal } from '../components/BanModal'

export function PendingApprovals() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banTarget, setBanTarget] = useState<Company | null>(null)
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPendingCompanies()
      setCompanies(res.companies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleApprove(company: Company) {
    setActionInFlight(company.id)
    try {
      await approveCompany(company.id)
      setCompanies((prev) => prev.filter((c) => c.id !== company.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approve failed')
    } finally {
      setActionInFlight(null)
    }
  }

  async function handleBanConfirm(type: BanType, reason: string) {
    if (!banTarget) return
    setActionInFlight(banTarget.id)
    setBanTarget(null)
    try {
      await banCompany(banTarget.id, { type, reason })
      setCompanies((prev) => prev.filter((c) => c.id !== banTarget.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ban failed')
    } finally {
      setActionInFlight(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            New company signups waiting for Caliburn review
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      {!loading && companies.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Clock size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No pending approvals</p>
        </div>
      )}

      <div className="space-y-3">
        {companies.map((company) => (
          <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{company.name}</span>
              </div>
              <p className="text-sm text-gray-500">{company.contactEmail}</p>
              {company.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{company.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Requested {new Date(company.approvalRequestedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                disabled={actionInFlight === company.id}
                onClick={() => handleApprove(company)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-40"
              >
                <CheckCircle size={14} />
                Approve
              </button>
              <button
                disabled={actionInFlight === company.id}
                onClick={() => setBanTarget(company)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                <Ban size={14} />
                Ban
              </button>
            </div>
          </div>
        ))}
      </div>

      {banTarget && (
        <BanModal company={banTarget} onConfirm={handleBanConfirm} onClose={() => setBanTarget(null)} />
      )}
    </div>
  )
}
