import { useState } from 'react'
import { Cpu, Ship, ChevronLeft, HelpCircle } from 'lucide-react'
import { productsApi } from '../api/products'
import { PageHeader, ErrorBanner } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { SpecEditor } from '../components/SpecEditor'
import type { ProductType, ProductSpec } from '../types'

type Step = 'type' | 'details'

const TRL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

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

export function AddProduct() {
  const [step, setStep] = useState<Step>('type')
  const [selectedType, setSelectedType] = useState<ProductType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [trlLevel, setTrlLevel] = useState('')
  const [spec, setSpec] = useState<ProductSpec>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = () => {
    if (!selectedType) return
    setStep('details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await productsApi.create({
        type: selectedType,
        name: name.trim(),
        description: description || undefined,
        category: category || undefined,
        trlLevel: trlLevel ? parseInt(trlLevel) : undefined,
        specJson: spec,
      })
      window.location.hash = 'products'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Add a new product"
        action={
          step === 'details' ? (
            <button
              onClick={() => setStep('type')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : undefined
        }
      />

      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      {step === 'type' && (
        <div className="max-w-xl">
          <p className="text-gray-400 text-sm mb-8">
            Select the type of product you want to list on Mission Bay.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Platform card */}
            <button
              onClick={() => setSelectedType('PLATFORM')}
              className={`relative flex flex-col items-center gap-4 p-8 rounded-xl border-2 transition-all text-left ${
                selectedType === 'PLATFORM'
                  ? 'border-[#cbfd00] bg-[#cbfd00]/10'
                  : 'border-gray-700/60 bg-[#1a2530] hover:border-gray-500'
              }`}
            >
              {selectedType === 'PLATFORM' && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#cbfd00]" />
              )}
              <Ship
                size={40}
                className={selectedType === 'PLATFORM' ? 'text-[#cbfd00]' : 'text-gray-400'}
              />
              <div>
                <div className="font-semibold text-white text-lg text-center">Platform</div>
                <div className="text-gray-400 text-xs text-center mt-1">
                  Vessel, vehicle, or host system
                </div>
              </div>
            </button>

            {/* Capability card */}
            <button
              onClick={() => setSelectedType('CAPABILITY')}
              className={`relative flex flex-col items-center gap-4 p-8 rounded-xl border-2 transition-all text-left ${
                selectedType === 'CAPABILITY'
                  ? 'border-[#cbfd00] bg-[#cbfd00]/10'
                  : 'border-gray-700/60 bg-[#1a2530] hover:border-gray-500'
              }`}
            >
              {selectedType === 'CAPABILITY' && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#cbfd00]" />
              )}
              <Cpu
                size={40}
                className={selectedType === 'CAPABILITY' ? 'text-[#cbfd00]' : 'text-gray-400'}
              />
              <div>
                <div className="font-semibold text-white text-lg text-center">Capability</div>
                <div className="text-gray-400 text-xs text-center mt-1">
                  Software, sensor, or payload module
                </div>
              </div>
            </button>
          </div>

          <a
            href="https://docs.missionbay.caliburn.us/product-types"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-8"
          >
            <HelpCircle size={13} />
            Don't know which to choose?
          </a>

          <div>
            <button
              onClick={handleContinue}
              disabled={!selectedType}
              className="px-8 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b8e600] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'details' && selectedType && (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#cbfd00]/10 border border-[#cbfd00]/30 rounded-full text-xs text-[#cbfd00] mb-2">
            {selectedType === 'PLATFORM' ? <Ship size={12} /> : <Cpu size={12} />}
            {selectedType === 'PLATFORM' ? 'Platform' : 'Capability'}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Product name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. NSYTE AI Maintenance System"
              className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Briefly describe what this product does and its key value proposition."
              className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors appearance-none"
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
                className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors appearance-none"
              >
                <option value="">Select TRL</option>
                {TRL_OPTIONS.map((n) => (
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b8e600] transition-colors"
            >
              {saving && <LoadingSpinner size="sm" />}
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
