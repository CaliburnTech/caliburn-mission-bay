import { useEffect, useState } from 'react'
import { KeyRound, ShieldCheck, Trash2 } from 'lucide-react'
import { PageHeader, ErrorBanner } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { anthropicKeyApi } from '../api/company'
import type { AnthropicKeyStatus, UserRole } from '../types'

const KEY_PREFIX = 'sk-ant-'

export function Settings({ role }: { role: UserRole | null }) {
  const canManageKey = role === 'OWNER' || role === 'ADMIN'

  const [status, setStatus] = useState<AnthropicKeyStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newKey, setNewKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    anthropicKeyApi
      .get()
      .then((s) => {
        if (!cancelled) setStatus(s)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load key status')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    const key = newKey.trim()
    if (!key.startsWith(KEY_PREFIX)) {
      setError(`API key must start with "${KEY_PREFIX}"`)
      return
    }

    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const s = await anthropicKeyApi.set(key)
      setStatus(s)
      setNewKey('')
      setNotice('API key saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    setError(null)
    setNotice(null)
    try {
      const s = await anthropicKeyApi.remove()
      setStatus(s)
      setNotice('API key removed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove API key')
    } finally {
      setRemoving(false)
      setConfirmRemove(false)
    }
  }

  return (
    <>
      <PageHeader title="Settings" />

      {/* AI Assistant API Key */}
      <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-6 max-w-2xl">
        <div className="flex items-center gap-2.5 mb-1.5">
          <KeyRound size={16} className="text-[#cbfd00]" />
          <h2 className="text-base font-semibold text-white">AI Assistant API Key</h2>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          Connect your company's Anthropic API key to power the AI assistant on your listings.
        </p>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} />
          </div>
        )}
        {notice && (
          <div className="mb-4 bg-[#cbfd00]/10 border border-[#cbfd00]/30 text-[#cbfd00] px-4 py-3 rounded-lg text-sm">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-gray-500 text-sm py-2">
            <LoadingSpinner size="sm" />
            Loading key status…
          </div>
        ) : (
          <>
            {/* Current status */}
            <div className="flex items-center justify-between bg-[#0f1419] border border-gray-700/60 rounded-lg px-4 py-3 mb-5">
              <div className="text-sm">
                {status?.configured ? (
                  <span className="text-white">
                    Key configured
                    {status.last4 && (
                      <span className="text-gray-500 font-mono ml-2">
                        sk-ant-…{status.last4}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-500">No key configured</span>
                )}
              </div>

              {canManageKey && status?.configured && (
                confirmRemove ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Remove key?</span>
                    <button
                      onClick={handleRemove}
                      disabled={removing}
                      className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50 transition-colors"
                    >
                      {removing ? 'Removing…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(false)}
                      disabled={removing}
                      className="text-gray-500 hover:text-gray-300 disabled:opacity-50 transition-colors"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )
              )}
            </div>

            {/* Set / replace key (OWNER and ADMIN only) */}
            {canManageKey ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    {status?.configured ? 'Replace API key' : 'Set API key'}
                  </label>
                  <input
                    type="password"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    autoComplete="off"
                    placeholder="sk-ant-…"
                    className="w-full px-3.5 py-2.5 bg-[#0f1419] border border-gray-700/60 rounded-lg text-white placeholder-gray-700 text-sm font-mono focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !newKey.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-[#b8e600] transition-colors"
                >
                  {saving ? <LoadingSpinner size="sm" /> : null}
                  {saving ? 'Saving…' : 'Save key'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-gray-500">
                Only company owners and admins can change this key.
              </p>
            )}

            <div className="flex items-start gap-2 mt-5 text-xs text-gray-500 leading-relaxed">
              <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 text-gray-600" />
              Your key is stored encrypted and only used server-side — it is never sent to the
              browser or shared with other companies.
            </div>
          </>
        )}
      </div>
    </>
  )
}
