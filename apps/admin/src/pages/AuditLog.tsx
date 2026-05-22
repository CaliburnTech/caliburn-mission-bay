import { useEffect, useState, useCallback } from 'react'
import { Search, RefreshCw, Filter } from 'lucide-react'
import { getAuditLog } from '../lib/api'
import type { AuditLogEntry } from '../types'

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  COMPANY_APPROVED: { label: 'Approved', color: 'text-green-700 bg-green-50' },
  COMPANY_BANNED: { label: 'Banned', color: 'text-red-700 bg-red-50' },
  COMPANY_UNBANNED: { label: 'Unbanned', color: 'text-blue-700 bg-blue-50' },
  IMPERSONATION_STARTED: { label: 'Impersonate start', color: 'text-amber-700 bg-amber-50' },
  IMPERSONATION_ENDED: { label: 'Impersonate end', color: 'text-gray-700 bg-gray-100' },
  PASSWORD_RESET: { label: 'Password reset', color: 'text-purple-700 bg-purple-50' },
}

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_LABELS[action]
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${meta?.color ?? 'text-gray-700 bg-gray-100'}`}>
      {meta?.label ?? action}
    </span>
  )
}

export function AuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    companyId: '',
    actorId: '',
    action: '',
    from: '',
    to: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      Object.entries(filters).forEach(([k, v]) => { if (v.trim()) params[k] = v.trim() })
      const res = await getAuditLog(params)
      setEntries(res.entries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All admin actions — including impersonation start/end events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter size={13} />
            Filters
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg grid grid-cols-2 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Company ID</label>
            <input
              type="text"
              value={filters.companyId}
              onChange={(e) => handleFilterChange('companyId', e.target.value)}
              placeholder="cuid…"
              className="w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Actor ID</label>
            <input
              type="text"
              value={filters.actorId}
              onChange={(e) => handleFilterChange('actorId', e.target.value)}
              placeholder="cuid…"
              className="w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">All actions</option>
              {Object.keys(ACTION_LABELS).map((a) => (
                <option key={a} value={a}>{ACTION_LABELS[a].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="datetime-local"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="datetime-local"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ companyId: '', actorId: '', action: '', from: '', to: '' })}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">When</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Impersonating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  No audit entries match
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{entry.actorEmail ?? entry.actorUserId}</div>
                </td>
                <td className="px-4 py-3">
                  <ActionBadge action={entry.action} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-500 text-xs">{entry.targetType}</span>{' '}
                  <span className="font-mono text-xs text-gray-700">{entry.targetId}</span>
                </td>
                <td className="px-4 py-3">
                  {entry.impersonatingCompanyName ? (
                    <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {entry.impersonatingCompanyName}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
