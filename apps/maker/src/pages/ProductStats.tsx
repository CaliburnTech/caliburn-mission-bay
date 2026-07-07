import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Eye, Settings2, Users, Cpu, Ship, ExternalLink } from 'lucide-react'
import { productsApi } from '../api/products'
import { PageHeader, ErrorBanner } from '../components/Layout'
import { PageSpinner } from '../components/LoadingSpinner'
import type { Product, ProductStats, Lead, ConfigSummary } from '../types'

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex-1 bg-[#1a2530] border border-gray-700/40 rounded-xl p-6 flex flex-col items-center gap-2">
      <div className="text-gray-500">{icon}</div>
      <div className="text-4xl font-bold text-white tabular-nums">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}

function ConfigCard({ config }: { config: ConfigSummary }) {
  return (
    <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-4 hover:border-gray-600/60 transition-colors">
      <div className="text-sm font-medium text-white truncate mb-3">
        {config.configName ?? 'Unnamed config'}
      </div>
      {config.coProducts.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-xs text-gray-600 mb-2">Co-configured with:</div>
          {config.coProducts.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-400">
              {p.type === 'PLATFORM' ? (
                <Ship size={11} className="text-gray-600" />
              ) : (
                <Cpu size={11} className="text-gray-600" />
              )}
              <span className="truncate">{p.name}</span>
            </div>
          ))}
          {config.coProducts.length > 3 && (
            <div className="text-xs text-gray-600">
              +{config.coProducts.length - 3} more
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-600 italic">No co-products</div>
      )}
    </div>
  )
}

export function ProductStats({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [configs, setConfigs] = useState<ConfigSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, s, l, c] = await Promise.all([
        productsApi.get(productId),
        productsApi.stats(productId),
        productsApi.leads(productId),
        productsApi.configs(productId),
      ])
      setProduct(p)
      setStats(s)
      setLeads(l)
      setConfigs(c)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader
        title={product?.name ?? 'Product Stats'}
        action={
          <a
            href="#products"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Back to products
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
      ) : stats ? (
        <div className="space-y-8">
          {/* 30d summary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Past 30 days
              </h2>
              <span className="text-xs text-gray-600 border border-gray-700/40 rounded px-1.5 py-0.5">
                30d
              </span>
            </div>
            <div className="flex gap-4">
              <StatCard icon={<Eye size={20} />} label="Views" value={stats.views} />
              <StatCard
                icon={<Settings2 size={20} />}
                label="Configs"
                value={stats.configurations}
              />
              <StatCard icon={<Users size={20} />} label="Leads" value={stats.leads} />
            </div>
          </section>

          {/* Popular configurations */}
          <section>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              Popular Configurations
            </h2>
            {configs.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {configs.slice(0, 8).map((c) => (
                  <ConfigCard key={c.configId} config={c} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">
                No configurations saved with this product yet.
              </p>
            )}
          </section>

          {/* Interested buyers */}
          <section>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              Interested Buyers
            </h2>
            {leads.length === 0 ? (
              <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-6 text-center text-sm text-gray-600 italic">
                No leads yet.
              </div>
            ) : (
              <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/40">
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Buyer ID
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-gray-300 font-mono text-xs">
                          {lead.userId ?? <span className="text-gray-600 italic">Anonymous</span>}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <ExternalLink size={13} className="text-gray-700 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}
