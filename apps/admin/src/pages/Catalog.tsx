import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Building2,
  Package,
  Plus,
  Pencil,
  RefreshCw,
  UploadCloud,
  X,
} from 'lucide-react'
import {
  createCompany,
  getAllCompanies,
  getCatalogProducts,
  startImpersonation,
  endImpersonationAs,
  createProductAs,
  updateProductAs,
  submitProductAs,
  approveProduct,
  publishProduct,
} from '../lib/api'
import type { AdminProduct, Company, ProductSpec, ProductType } from '../types'

/**
 * Catalog (white-glove listing).
 *
 * Caliburn lists certified vendors and their products on their behalf, before
 * the vendor ever signs up. Companies are created directly in APPROVED state;
 * products are written through the normal seller endpoints inside a scoped
 * impersonation session, so the audit trail records every step as
 * "Caliburn, acting as <company>" — exactly as if the vendor had listed it,
 * with provenance preserved.
 */

const CATEGORIES = [
  'Command & Control',
  'Communications',
  'Electronic Warfare',
  'Intelligence / Surveillance',
  'Logistics',
  'Navigation',
  'Propulsion',
  'Sensors',
  'Weapons',
  'Other',
]

const TRL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Mirror of the maker SpecEditor's standard SWaP fields. */
const SWAP_FIELDS: { key: string; label: string; type: 'number' | 'text' }[] = [
  { key: 'weightKg', label: 'Weight (kg)', type: 'number' },
  { key: 'powerW', label: 'Power draw (W)', type: 'number' },
  { key: 'lengthCm', label: 'Length (cm)', type: 'number' },
  { key: 'widthCm', label: 'Width (cm)', type: 'number' },
  { key: 'heightCm', label: 'Height (cm)', type: 'number' },
  { key: 'voltageV', label: 'Voltage (V)', type: 'number' },
  { key: 'enduranceHr', label: 'Endurance (hr)', type: 'number' },
  { key: 'rangeKm', label: 'Range (km)', type: 'number' },
  { key: 'maxSpeedKn', label: 'Max speed (kn)', type: 'number' },
  { key: 'payloadKg', label: 'Payload capacity (kg)', type: 'number' },
  { key: 'interfaces', label: 'Interfaces / mounts', type: 'text' },
  { key: 'ipRating', label: 'Environmental / IP rating', type: 'text' },
]

interface ProductFormState {
  id: string | null // null = creating
  companyId: string
  type: ProductType
  name: string
  description: string
  category: string
  trlLevel: string
  swap: Record<string, string>
  customFields: { label: string; value: string }[]
  publishNow: boolean
}

const emptyForm = (companyId = ''): ProductFormState => ({
  id: null,
  companyId,
  type: 'CAPABILITY',
  name: '',
  description: '',
  category: '',
  trlLevel: '',
  swap: {},
  customFields: [],
  publishNow: true,
})

function formFromProduct(p: AdminProduct): ProductFormState {
  const swap: Record<string, string> = {}
  for (const [k, v] of Object.entries(p.specJson?.swap ?? {})) swap[k] = String(v)
  return {
    id: p.id,
    companyId: p.company.id,
    type: p.type,
    name: p.name,
    description: p.description ?? '',
    category: p.category ?? '',
    trlLevel: p.trlLevel != null ? String(p.trlLevel) : '',
    swap,
    customFields: (p.specJson?.customFields ?? []).map((f) => ({ ...f })),
    publishNow: true,
  }
}

function buildSpec(form: ProductFormState): ProductSpec {
  const swap: Record<string, number | string> = {}
  for (const f of SWAP_FIELDS) {
    const raw = (form.swap[f.key] ?? '').trim()
    if (!raw) continue
    if (f.type === 'number') {
      const n = Number(raw)
      swap[f.key] = Number.isFinite(n) ? n : raw
    } else {
      swap[f.key] = raw
    }
  }
  return {
    swap: Object.keys(swap).length ? swap : undefined,
    customFields: form.customFields.filter((f) => f.label.trim() || f.value.trim()),
  }
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-400 line-through',
}

export function Catalog() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Company modal
  const [companyModalOpen, setCompanyModalOpen] = useState(false)
  const [newCompany, setNewCompany] = useState({ name: '', email: '', website: '', description: '' })
  const [savingCompany, setSavingCompany] = useState(false)
  const [companyError, setCompanyError] = useState<string | null>(null)

  // Product modal
  const [form, setForm] = useState<ProductFormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [companiesRes, productsRes] = await Promise.all([
        getAllCompanies(),
        getCatalogProducts(),
      ])
      setCompanies(companiesRes.companies)
      setProducts(productsRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sellerCompanies = useMemo(
    () => companies.filter((c) => c.status === 'APPROVED'),
    [companies],
  )

  const productsByCompany = useMemo(() => {
    const map = new Map<string, AdminProduct[]>()
    for (const p of products) {
      const list = map.get(p.company.id) ?? []
      list.push(p)
      map.set(p.company.id, list)
    }
    return map
  }, [products])

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault()
    if (!newCompany.name.trim()) return
    setSavingCompany(true)
    setCompanyError(null)
    try {
      await createCompany({
        name: newCompany.name.trim(),
        email: newCompany.email.trim() || undefined,
        website: newCompany.website.trim() || undefined,
        description: newCompany.description.trim() || undefined,
      })
      setCompanyModalOpen(false)
      setNewCompany({ name: '', email: '', website: '', description: '' })
      await load()
    } catch (err) {
      setCompanyError(err instanceof Error ? err.message : 'Failed to create company')
    } finally {
      setSavingCompany(false)
    }
  }

  /**
   * Run the full white-glove chain for the product form.
   * Create: draft → submit → approve → publish.
   * Edit:   update → (whatever lifecycle steps remain) → publish.
   * If a step fails, the product stays wherever it got to — it remains
   * visible here (and in Product Review) so the chain can be finished by hand.
   */
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !form.companyId || !form.name.trim()) return
    setSaving(true)
    setFormError(null)

    let sessionId: string | null = null
    let step = 'starting impersonation session'
    try {
      const session = await startImpersonation(form.companyId)
      sessionId = session.sessionId

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        trlLevel: form.trlLevel ? parseInt(form.trlLevel) : undefined,
        specJson: buildSpec(form),
      }

      let productId = form.id
      let status = form.id ? products.find((p) => p.id === form.id)?.status ?? 'DRAFT' : null

      if (productId) {
        step = 'updating product'
        setProgress('Updating product…')
        await updateProductAs(sessionId, productId, payload)
      } else {
        step = 'creating draft'
        setProgress('Creating draft…')
        const created = await createProductAs(sessionId, { type: form.type, ...payload })
        productId = created.id
        status = 'DRAFT'
      }

      if (form.publishNow && status !== 'ARCHIVED') {
        if (status === 'DRAFT') {
          step = 'submitting for review'
          setProgress('Submitting for review…')
          await submitProductAs(sessionId, productId)
          status = 'IN_REVIEW'
        }
        if (status === 'IN_REVIEW') {
          step = 'approving'
          setProgress('Approving…')
          await approveProduct(productId)
          status = 'APPROVED'
        }
        step = 'publishing'
        setProgress('Publishing to marketplace…')
        await publishProduct(productId, form.id ? 'White-glove update by Caliburn' : 'Initial white-glove listing by Caliburn')
      }

      setForm(null)
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setFormError(`Failed while ${step}: ${msg}`)
      await load() // reflect however far the chain got
    } finally {
      if (sessionId) {
        try {
          await endImpersonationAs(sessionId)
        } catch {
          // best-effort — session expires on its own
        }
      }
      setProgress(null)
      setSaving(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            White-glove listing — create vendor companies and list products on their behalf.
            Every step is audit-logged as Caliburn acting for the company.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setCompanyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Building2 size={14} />
            New company
          </button>
          <button
            onClick={() => setForm(emptyForm(sellerCompanies[0]?.id ?? ''))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            List product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      {!loading && sellerCompanies.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No approved vendor companies yet — create one to start listing.</p>
        </div>
      )}

      <div className="space-y-6">
        {sellerCompanies.map((c) => {
          const list = productsByCompany.get(c.id) ?? []
          return (
            <section key={c.id} className="bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Building2 size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">
                    {list.length} product{list.length === 1 ? '' : 's'}
                  </span>
                </div>
                <button
                  onClick={() => setForm(emptyForm(c.id))}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={13} />
                  List product
                </button>
              </div>

              {list.length > 0 && (
                <ul className="divide-y divide-gray-50">
                  {list.map((p) => {
                    const latest = p.versions[0]
                    return (
                      <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                        <Package size={15} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
                            <span className="text-[11px] text-gray-400 uppercase tracking-wide">{p.type}</span>
                            <span
                              className={`text-[11px] px-1.5 py-0.5 rounded ${STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                            >
                              {p.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {latest
                              ? `Published v${latest.versionNumber} · ${new Date(latest.publishedAt).toLocaleDateString()}`
                              : 'Not yet published'}
                          </p>
                        </div>
                        {p.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => setForm(formFromProduct(p))}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      {/* ── New company modal ── */}
      {companyModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">New vendor company</h2>
              <button onClick={() => setCompanyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} className="p-5 space-y-4">
              <p className="text-xs text-gray-500">
                Created directly in APPROVED state, ready to list products. When the vendor later
                signs up, their account can be attached to this company.
              </p>
              <div>
                <label className={labelCls}>
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. FarSounder"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Contact email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  placeholder="optional"
                />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input
                  className={inputCls}
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  placeholder="optional"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  placeholder="optional"
                />
              </div>
              {companyError && <p className="text-sm text-red-600">{companyError}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCompany || !newCompany.name.trim()}
                  className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  {savingCompany ? 'Creating…' : 'Create company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product modal ── */}
      {form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">
                {form.id ? 'Edit product' : 'List a product'}
              </h2>
              <button onClick={() => !saving && setForm(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Company <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.companyId}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    disabled={!!form.id}
                    required
                  >
                    <option value="">Select company</option>
                    {sellerCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    className={inputCls}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}
                    disabled={!!form.id}
                  >
                    <option value="CAPABILITY">Capability (payload / software)</option>
                    <option value="PLATFORM">Platform (vessel / vehicle)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Product name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. FarSounder Argos 350"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What it does and its key value proposition."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>TRL level</label>
                  <select
                    className={inputCls}
                    value={form.trlLevel}
                    onChange={(e) => setForm({ ...form, trlLevel: e.target.value })}
                  >
                    <option value="">Select TRL</option>
                    {TRL_OPTIONS.map((n) => (
                      <option key={n} value={String(n)}>
                        TRL {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">SWaP &amp; specifications</p>
                <p className="text-xs text-gray-500 mb-3">
                  Weight and power drive "Will it fit?" compatibility on the buyer side — fill them
                  in whenever the vendor publishes them.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {SWAP_FIELDS.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                      <input
                        className={inputCls}
                        type={f.type === 'number' ? 'number' : 'text'}
                        step="any"
                        value={form.swap[f.key] ?? ''}
                        onChange={(e) =>
                          setForm({ ...form, swap: { ...form.swap, [f.key]: e.target.value } })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Custom spec fields</p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, customFields: [...form.customFields, { label: '', value: '' }] })
                    }
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={13} />
                    Add field
                  </button>
                </div>
                {form.customFields.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      className={inputCls}
                      placeholder="Label (e.g. Frequency band)"
                      value={f.label}
                      onChange={(e) => {
                        const next = [...form.customFields]
                        next[i] = { ...next[i], label: e.target.value }
                        setForm({ ...form, customFields: next })
                      }}
                    />
                    <input
                      className={inputCls}
                      placeholder="Value"
                      value={f.value}
                      onChange={(e) => {
                        const next = [...form.customFields]
                        next[i] = { ...next[i], value: e.target.value }
                        setForm({ ...form, customFields: next })
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, customFields: form.customFields.filter((_, j) => j !== i) })
                      }
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 border-t border-gray-100 pt-4">
                <input
                  type="checkbox"
                  checked={form.publishNow}
                  onChange={(e) => setForm({ ...form, publishNow: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <UploadCloud size={14} className="text-gray-400" />
                Publish to the marketplace immediately (submit → approve → publish)
              </label>

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <div className="flex items-center justify-end gap-3 pt-1">
                {progress && <span className="text-sm text-gray-500">{progress}</span>}
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.companyId || !form.name.trim()}
                  className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  {saving ? 'Working…' : form.id ? 'Save changes' : 'List product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
