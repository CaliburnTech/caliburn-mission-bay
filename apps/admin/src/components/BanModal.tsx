import { useState } from 'react'
import { X, AlertTriangle, ShieldAlert } from 'lucide-react'
import type { BanType, Company } from '../types'

interface Props {
  company: Company
  onConfirm: (type: BanType, reason: string) => void
  onClose: () => void
}

export function BanModal({ company, onConfirm, onClose }: Props) {
  const [banType, setBanType] = useState<BanType>('SOFT')
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ban Company</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          You are banning <span className="font-medium text-gray-900">{company.name}</span>. Choose the ban type:
        </p>

        <div className="space-y-3 mb-5">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50">
            <input
              type="radio"
              name="banType"
              value="SOFT"
              checked={banType === 'SOFT'}
              onChange={() => setBanType('SOFT')}
              className="mt-0.5"
            />
            <div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-gray-800">
                <AlertTriangle size={14} className="text-yellow-500" />
                Soft ban — policy violation
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Company is restricted but sessions remain valid. Recoverable.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-red-400 has-[:checked]:bg-red-50">
            <input
              type="radio"
              name="banType"
              value="HARD"
              checked={banType === 'HARD'}
              onChange={() => setBanType('HARD')}
              className="mt-0.5"
            />
            <div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-gray-800">
                <ShieldAlert size={14} className="text-red-500" />
                Hard ban — security incident
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Immediately revokes all sessions via Supabase Admin API (auth.admin.signOut) + SessionDenyList. Two-step unban required.
              </p>
            </div>
          </label>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            rows={3}
            placeholder="Describe the reason for this ban…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(banType, reason)}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm ban
          </button>
        </div>
      </div>
    </div>
  )
}
