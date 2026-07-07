import { Fragment, useEffect, useState, useCallback } from 'react'
import { RefreshCw, ChevronDown, ChevronRight, Inbox, Trash2 } from 'lucide-react'
import { getSubmissions, deleteSubmission } from '../lib/api'
import type { Sbom, Submission } from '../types'

function SlotsSummary({ slots }: { slots: Record<string, (string | null)[]> }) {
  // Key by category + slot index — capability names can repeat across
  // categories (or within one), so the name alone is not a stable key.
  const equipped = Object.entries(slots).flatMap(([category, names]) =>
    names.flatMap((name, i) =>
      name ? [{ key: `${category}:${i}`, name }] : [],
    ),
  )
  if (equipped.length === 0) return <span className="text-gray-400 italic text-xs">no capabilities equipped</span>
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {equipped.map(({ key, name }) => (
        <span key={key} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
          {name}
        </span>
      ))}
    </div>
  )
}

function SbomTable({ sbom }: { sbom: Sbom }) {
  const components = sbom.components ?? []
  if (components.length === 0) return <p className="text-xs text-gray-400 italic">No components in SBOM</p>

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Component</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Version</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Supplier</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">License</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {components.map((c, i) => (
            <tr key={i} className={c.isTopLevel ? 'bg-white font-medium' : 'bg-gray-50/50'}>
              <td className="px-3 py-2 text-gray-900">
                {c.isTopLevel && (
                  <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle" />
                )}
                {c.name}
              </td>
              <td className="px-3 py-2 text-gray-500 font-mono">{c.version ?? '—'}</td>
              <td className="px-3 py-2 text-gray-500">{c.supplier?.name ?? '—'}</td>
              <td className="px-3 py-2 text-gray-500">{c.category ?? '—'}</td>
              <td className="px-3 py-2 text-gray-500">{c.license ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
        CycloneDX {sbom.specVersion} · {components.length} components
        {' · '}
        <span className="text-blue-500">●</span> = top-level capability
      </div>
    </div>
  )
}

export function Submissions() {
  const [rows, setRows] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { submissions } = await getSubmissions()
      setRows(submissions)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  async function handleDelete(id: string) {
    if (deletingId) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteSubmission(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
      setExpanded((prev) => (prev === id ? null : prev))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete submission')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Demo Submissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Boat configurations saved during the navy demo — {rows.length} total
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-6 px-3 py-3" />
              <th className="text-left px-4 py-3 font-medium text-gray-600">Config Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Vessel</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted By</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Saved At</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  <Inbox size={32} className="mx-auto mb-2 opacity-30" />
                  No submissions yet
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const slots = row.configData?.slots
              const sbom = row.configData?.sbom
              const hasSbom = !!sbom?.components?.length
              const hullName = row.configData?.hullName
              return (
                <Fragment key={row.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(row.id)}
                  >
                    <td className="px-3 py-3 text-gray-400">
                      {expanded === row.id
                        ? <ChevronDown size={14} />
                        : <ChevronRight size={14} />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{row.name || '—'}</div>
                      {slots && <SlotsSummary slots={slots} />}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {hullName || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.submittedBy || <span className="text-gray-400 italic">anonymous</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {confirmDeleteId === row.id ? (
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Delete?</span>
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={deletingId === row.id}
                            className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                          >
                            {deletingId === row.id ? 'Deleting…' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === row.id}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(row.id)}
                          disabled={!!deletingId}
                          title="Delete submission"
                          aria-label="Delete submission"
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-5 space-y-4">
                        {hasSbom ? (
                          <>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                              Software Bill of Materials (CycloneDX)
                            </div>
                            <SbomTable sbom={sbom!} />
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Capabilities (no SBOM — saved before this feature)
                            </div>
                            {slots
                              ? <SlotsSummary slots={slots} />
                              : <pre className="text-xs text-gray-500 bg-white border border-gray-200 rounded p-3 overflow-x-auto max-h-48">
                                  {JSON.stringify(row.configData, null, 2)}
                                </pre>
                            }
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
