import { useState, useEffect } from 'react'
import { ChevronLeft, Send } from 'lucide-react'
import { productsApi } from '../api/products'
import { StatusBadge } from '../components/StatusBadge'
import { PageHeader, ErrorBanner } from '../components/Layout'
import { PageSpinner, LoadingSpinner } from '../components/LoadingSpinner'
import { SpecEditor } from '../components/SpecEditor'
import type { Product, ProductSpec } from '../types'

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

export function EditProduct({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [trlLevel, setTrlLevel] = useState('')
  const [spec, setSpec] = useState<ProductSpec>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    productsApi
      .get(productId)
      .then((p) => {
        setProduct(p)
        setName(p.name)
        setDescription(p.description ?? '')
        setCategory(p.category ?? '')
        setTrlLevel(p.trlLevel?.toString() ?? '')
        setSpec(p.specJson ?? {})
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [productId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const updated = await productsApi.update(productId, {
        name: name.trim(),
        description: description || undefined,
        category: category || undefined,
        trlLevel: trlLevel ? parseInt(trlLevel) : undefined,
        specJson: spec,
      })
      setProduct(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Submit for Caliburn review? The product status will change to In Review.')) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await productsApi.submit(productId)
      setProduct(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageSpinner />

  const isArchived = product?.status === 'ARCHIVED'
  const canSubmit = product?.status === 'DRAFT'

  return (
    <>
      <PageHeader
        title={product?.name ?? 'Edit Product'}
        action={
          <div className="flex items-center gap-3">
            {product && <StatusBadge status={product.status} />}
            <a
              href="#products"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </a>
          </div>
        }
      />

      {(fetchError ?? error) && (
        <div className="mb-6">
          <ErrorBanner message={(fetchError ?? error)!} />
        </div>
      )}

      {product && (
        <form onSubmit={handleSave} className="max-w-xl space-y-5">
          <fieldset disabled={isArchived} className="space-y-5">
            {isArchived && (
              <div className="bg-gray-900/40 border border-gray-700/40 text-gray-500 px-4 py-3 rounded-lg text-sm">
                Archived products cannot be edited.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Product name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors resize-none disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors appearance-none disabled:opacity-50"
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
                <label className="block text-sm font-medium text-gray-300 mb-1.5">TRL Level</label>
                <select
                  value={trlLevel}
                  onChange={(e) => setTrlLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="">Select TRL</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      TRL {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-700/40 pt-5">
              <SpecEditor value={spec} onChange={setSpec} />
            </div>
          </fieldset>

          {!isArchived && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-[#b8e600] transition-colors"
              >
                {saving && <LoadingSpinner size="sm" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>

              {canSubmit && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2530] border border-[#cbfd00]/40 text-[#cbfd00] font-medium rounded-lg text-sm hover:border-[#cbfd00]/70 disabled:opacity-40 transition-colors"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : <Send size={14} />}
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </>
  )
}
