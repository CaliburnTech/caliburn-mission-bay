import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, RefreshCw, Package, UploadCloud } from 'lucide-react'
import { getReviewProducts, approveProduct, rejectProduct, publishProduct } from '../lib/api'
import type { AdminProduct } from '../types'

/** Human-readable labels for maker-authored SWaP fields (mirror of the maker SpecEditor). */
const SWAP_LABELS: Record<string, string> = {
  lengthCm: 'Length (cm)',
  widthCm: 'Width (cm)',
  heightCm: 'Height (cm)',
  weightKg: 'Weight (kg)',
  powerW: 'Power draw (W)',
  voltageV: 'Voltage (V)',
  enduranceHr: 'Endurance (hr)',
  rangeKm: 'Range (km)',
  maxSpeedKn: 'Max speed (kn)',
  payloadKg: 'Payload capacity (kg)',
  interfaces: 'Interfaces / mounts',
  ipRating: 'Environmental / IP rating',
}

/** Flatten a product's spec (SWaP + custom fields) into label/value rows for display. */
function specRows(p: AdminProduct): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []
  const swap = p.specJson?.swap ?? {}
  for (const [k, v] of Object.entries(swap)) {
    if (v === '' || v == null) continue
    rows.push({ label: SWAP_LABELS[k] ?? k, value: String(v) })
  }
  for (const cf of p.specJson?.customFields ?? []) {
    if (cf?.label || cf?.value) rows.push({ label: cf.label || '—', value: cf.value })
  }
  return rows
}

/**
 * Product Review — Caliburn admin actions on the product lifecycle:
 *   IN_REVIEW → Approve / Reject
 *   APPROVED  → Publish (creates a ProductVersion; makes it available to buyers)
 * Publishing is admin-only for now (see product-pipeline plan, Decision 4).
 */
export function ProductReview() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInFlight, setActionInFlight] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await getReviewProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleApprove(p: AdminProduct) {
    setActionInFlight(p.id)
    try {
      await approveProduct(p.id)
      // Moves IN_REVIEW → APPROVED; reload so it appears in the publish group.
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approve failed')
    } finally {
      setActionInFlight(null)
    }
  }

  async function handleReject(p: AdminProduct) {
    const reason = prompt(`Reject "${p.name}"? Optional reason (sent back to the maker):`)
    if (reason === null) return // cancelled
    setActionInFlight(p.id)
    try {
      await rejectProduct(p.id, reason)
      setProducts((prev) => prev.filter((x) => x.id !== p.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Reject failed')
    } finally {
      setActionInFlight(null)
    }
  }

  async function handlePublish(p: AdminProduct) {
    const changelog = prompt(`Publish "${p.name}"? Optional changelog for this version:`)
    if (changelog === null) return // cancelled
    setActionInFlight(p.id)
    try {
      const { version } = await publishProduct(p.id, changelog)
      alert(`Published "${p.name}" as v${version.versionNumber}.`)
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setActionInFlight(null)
    }
  }

  const inReview = products.filter((p) => p.status === 'IN_REVIEW')
  const approved = products.filter((p) => p.status === 'APPROVED')

  function Card({ p, children }: { p: AdminProduct; children: React.ReactNode }) {
    const latest = p.versions[0]
    const rows = specRows(p)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Package size={18} className="text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{p.name}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">{p.type}</span>
            {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
            {typeof p.trlLevel === 'number' && (
              <span className="text-xs text-gray-400">TRL {p.trlLevel}</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{p.company.name}</p>
          {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}

          {rows.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-gray-100 pt-3">
              {rows.map((r, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <dt className="text-gray-500 truncate">{r.label}</dt>
                  <dd className="text-gray-900 font-medium text-right">{r.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="text-xs text-gray-400 mt-3">
            {latest
              ? `Published v${latest.versionNumber} · ${new Date(latest.publishedAt).toLocaleString()}`
              : 'Not yet published'}
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">{children}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Product Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Approve or reject submissions, then publish approved products to the marketplace
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

      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nothing awaiting review or publish</p>
        </div>
      )}

      {inReview.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Awaiting review ({inReview.length})
          </h2>
          <div className="space-y-3">
            {inReview.map((p) => (
              <Card key={p.id} p={p}>
                <button
                  disabled={actionInFlight === p.id}
                  onClick={() => handleApprove(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-40"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  disabled={actionInFlight === p.id}
                  onClick={() => handleReject(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Approved — ready to publish ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.map((p) => (
              <Card key={p.id} p={p}>
                <button
                  disabled={actionInFlight === p.id}
                  onClick={() => handlePublish(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  <UploadCloud size={14} />
                  {p.versions[0] ? 'Publish update' : 'Publish'}
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
