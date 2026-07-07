import { useEffect, useState } from 'react'
import { LogOut, Eye } from 'lucide-react'
import type { ImpersonationSession } from '../types'

interface Props {
  session: ImpersonationSession
  onExit: () => void
}

/**
 * Live countdown to session expiry.
 * The impersonation session is a server-side row (ImpersonationSession table)
 * validated on every request. When it expires the API returns 401 and the
 * caller force-exits impersonation; this countdown is purely informational.
 */
function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('expired')
        return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return remaining
}

export function ImpersonationBanner({ session, onExit }: Props) {
  const remaining = useCountdown(session.expiresAt)

  return (
    <div className="fixed top-0 inset-x-0 z-40 bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Eye size={16} />
        Acting as <span className="underline">{session.companyName}</span>
        <span className="text-amber-100 font-normal">
          — session expires in {remaining}
        </span>
      </div>
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md"
      >
        <LogOut size={14} />
        Exit impersonation
      </button>
    </div>
  )
}
