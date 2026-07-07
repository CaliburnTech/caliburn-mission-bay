import { Plus, X } from 'lucide-react'
import type { ProductSpec } from '../types'

/**
 * Standard SWaP / spec fields — all optional and zero-able. Software-only
 * capabilities simply leave the physical ones blank. Anything not covered here
 * can be added by the maker as a custom field below.
 */
export const SWAP_FIELDS: {
  key: string
  label: string
  unit?: string
  type: 'number' | 'text'
}[] = [
  { key: 'lengthCm', label: 'Length', unit: 'cm', type: 'number' },
  { key: 'widthCm', label: 'Width', unit: 'cm', type: 'number' },
  { key: 'heightCm', label: 'Height', unit: 'cm', type: 'number' },
  { key: 'weightKg', label: 'Weight', unit: 'kg', type: 'number' },
  { key: 'powerW', label: 'Power draw', unit: 'W', type: 'number' },
  { key: 'voltageV', label: 'Voltage', unit: 'V', type: 'number' },
  { key: 'enduranceHr', label: 'Endurance', unit: 'hr', type: 'number' },
  { key: 'rangeKm', label: 'Range', unit: 'km', type: 'number' },
  { key: 'maxSpeedKn', label: 'Max speed', unit: 'kn', type: 'number' },
  { key: 'payloadKg', label: 'Payload capacity', unit: 'kg', type: 'number' },
  { key: 'interfaces', label: 'Interfaces / mounts', type: 'text' },
  { key: 'ipRating', label: 'Environmental / IP rating', type: 'text' },
]

const inputClass =
  'w-full px-3 py-2 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors'

export function SpecEditor({
  value,
  onChange,
}: {
  value: ProductSpec
  onChange: (spec: ProductSpec) => void
}) {
  const swap = value.swap ?? {}
  const customFields = value.customFields ?? []

  const setSwap = (key: string, raw: string, type: 'number' | 'text') => {
    const next = { ...swap }
    if (raw === '') delete next[key]
    else next[key] = type === 'number' ? Number(raw) : raw
    onChange({ ...value, swap: next })
  }

  const setCustom = (i: number, patch: Partial<{ label: string; value: string }>) =>
    onChange({
      ...value,
      customFields: customFields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    })

  const addCustom = () =>
    onChange({ ...value, customFields: [...customFields, { label: '', value: '' }] })

  const removeCustom = (i: number) =>
    onChange({ ...value, customFields: customFields.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-medium text-gray-300">Specifications (SWaP & more)</div>
        <p className="text-xs text-gray-500 mt-0.5">
          All optional. Leave physical fields blank for software-only capabilities.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SWAP_FIELDS.map((f) => {
          const current = swap[f.key]
          return (
            <div key={f.key}>
              <label className="block text-xs text-gray-400 mb-1">
                {f.label}
                {f.unit ? ` (${f.unit})` : ''}
              </label>
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={current === undefined || current === null ? '' : String(current)}
                onChange={(e) => setSwap(f.key, e.target.value, f.type)}
                min={f.type === 'number' ? 0 : undefined}
                step={f.type === 'number' ? 'any' : undefined}
                placeholder={f.type === 'number' ? '0' : '—'}
                className={inputClass}
              />
            </div>
          )
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-300">Custom fields</div>
          <button
            type="button"
            onClick={addCustom}
            className="flex items-center gap-1 text-xs text-[#cbfd00] hover:underline"
          >
            <Plus size={13} />
            Add field
          </button>
        </div>
        {customFields.length === 0 ? (
          <p className="text-xs text-gray-600">
            Add your own labelled fields to describe anything not covered above.
          </p>
        ) : (
          <div className="space-y-2">
            {customFields.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={f.label}
                  onChange={(e) => setCustom(i, { label: e.target.value })}
                  placeholder="Label (e.g. Data link)"
                  className={`${inputClass} flex-[2]`}
                />
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => setCustom(i, { value: e.target.value })}
                  placeholder="Value (e.g. MADL, Link 16)"
                  className={`${inputClass} flex-[3]`}
                />
                <button
                  type="button"
                  onClick={() => removeCustom(i)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove field"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
