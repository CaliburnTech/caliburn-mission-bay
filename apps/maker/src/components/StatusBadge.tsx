import type { ProductStatus } from '../types'

const CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-gray-700 text-gray-300 border border-gray-600',
  },
  IN_REVIEW: {
    label: 'In Review',
    className: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-lime-900/40 text-[#cbfd00] border border-[#cbfd00]/40',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-gray-900/50 text-gray-500 border border-gray-700/50',
  },
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
