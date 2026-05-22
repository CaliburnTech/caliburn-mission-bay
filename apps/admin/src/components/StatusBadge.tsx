import type { CompanyStatus } from '../types'

const styles: Record<CompanyStatus, string> = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  BANNED: 'bg-red-100 text-red-800 border-red-200',
}

const labels: Record<CompanyStatus, string> = {
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  BANNED: 'Banned',
}

export function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
