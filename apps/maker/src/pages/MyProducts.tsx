import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, BarChart3, Cpu, Ship, Archive, Package } from 'lucide-react'
import { productsApi } from '../api/products'
import { StatusBadge } from '../components/StatusBadge'
import { PageHeader, ErrorBanner } from '../components/Layout'
import { PageSpinner } from '../components/LoadingSpinner'
import type { Product, ProductStatus } from '../types'

/** Plain-language "what happens next" per status. Publishing is a Caliburn step. */
const NEXT_STEP: Record<ProductStatus, string> = {
  DRAFT: 'Open Edit and submit for Caliburn review when ready.',
  IN_REVIEW: 'Awaiting Caliburn review.',
  APPROVED: 'Approved — Caliburn will publish it to the marketplace.',
  ARCHIVED: '',
}

function ProductCard({
  product,
  onArchive,
}: {
  product: Product
  onArchive: (id: string) => void
}) {
  const [archiving, setArchiving] = useState(false)

  const handleArchive = async () => {
    if (!confirm(`Archive "${product.name}"? This cannot be undone.`)) return
    setArchiving(true)
    try {
      await productsApi.archive(product.id)
      onArchive(product.id)
    } catch {
      // silently reset — parent will refetch
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div className="flex items-center gap-4 bg-[#1a2530] border border-gray-700/40 rounded-xl p-4 hover:border-gray-600/60 transition-colors">
      {/* Product icon */}
      <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-[#2a3844] border border-gray-700/40 flex items-center justify-center">
        {product.type === 'PLATFORM' ? (
          <Ship size={22} className="text-gray-400" />
        ) : (
          <Cpu size={22} className="text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm truncate">{product.name}</span>
          <StatusBadge status={product.status} />
          {product.trlLevel && (
            <span className="text-xs text-gray-500 border border-gray-700/40 rounded px-1.5 py-0.5">
              TRL {product.trlLevel}
            </span>
          )}
        </div>
        {product.category && (
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
            {product.category}
          </div>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
          <span>{product._count?.events ?? 0} events</span>
          <span>·</span>
          <span>{product._count?.leads ?? 0} leads</span>
          <span>·</span>
          <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
        </div>
        {NEXT_STEP[product.status] && (
          <div className="text-xs text-gray-500 mt-1.5 italic">{NEXT_STEP[product.status]}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={`#edit/${product.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-[#2a3844] border border-gray-700/40 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
        >
          <Pencil size={12} />
          Edit
        </a>
        <a
          href={`#stats/${product.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-[#2a3844] border border-gray-700/40 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
        >
          <BarChart3 size={12} />
          View Stats
        </a>
        {product.status !== 'ARCHIVED' && (
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-[#2a3844] border border-gray-700/40 rounded-lg hover:border-red-700/50 hover:text-red-400 transition-colors disabled:opacity-40"
            title="Archive product"
          >
            <Archive size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export function MyProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productsApi.list()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleArchive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED' as const } : p)),
    )
  }

  const active = products.filter((p) => p.status !== 'ARCHIVED')
  const archived = products.filter((p) => p.status === 'ARCHIVED')

  return (
    <>
      <PageHeader
        title="My Products"
        action={
          <a
            href="#add-product"
            className="flex items-center gap-2 px-4 py-2 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm hover:bg-[#b8e600] transition-colors"
          >
            <Plus size={16} />
            Add Product
          </a>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1a2530] border border-gray-700/40 flex items-center justify-center mb-4">
            <Package size={24} className="text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm">No products yet.</p>
          <a
            href="#add-product"
            className="mt-4 text-sm text-[#cbfd00] hover:underline"
          >
            Add your first product →
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="space-y-3">
              {active.map((p) => (
                <ProductCard key={p.id} product={p} onArchive={handleArchive} />
              ))}
            </div>
          )}

          {archived.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">
                Archived ({archived.length})
              </div>
              <div className="space-y-3 opacity-60">
                {archived.map((p) => (
                  <ProductCard key={p.id} product={p} onArchive={handleArchive} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

