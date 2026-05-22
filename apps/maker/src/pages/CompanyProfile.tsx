import { useState, useEffect, useRef } from 'react'
import { Pencil, Check, X, Camera } from 'lucide-react'
import { companyApi, uploadLogo } from '../api/company'
import { PageHeader, ErrorBanner } from '../components/Layout'
import { PageSpinner, LoadingSpinner } from '../components/LoadingSpinner'
import type { Company } from '../types'

const STATUS_LABELS: Record<Company['status'], string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  BANNED: 'Banned',
}

const STATUS_CLASSES: Record<Company['status'], string> = {
  PENDING_APPROVAL: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  APPROVED: 'bg-lime-900/40 text-[#cbfd00] border-[#cbfd00]/30',
  BANNED: 'bg-red-900/40 text-red-300 border-red-700/40',
}

export function CompanyProfile() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  // Edit form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Logo upload
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  useEffect(() => {
    companyApi
      .get()
      .then((c) => {
        setCompany(c)
        seedForm(c)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const seedForm = (c: Company) => {
    setName(c.name)
    setDescription(c.description ?? '')
    setWebsite(c.website ?? '')
    setEmail(c.email ?? '')
    setPhone(c.phone ?? '')
  }

  const handleEdit = () => {
    if (company) seedForm(company)
    setSaveError(null)
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await companyApi.update({
        name: name.trim(),
        description: description || undefined,
        website: website || undefined,
        email: email || undefined,
        phone: phone || undefined,
      })
      setCompany(updated)
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      setLogoError('Logo must be PNG, JPEG, or WebP')
      return
    }
    setLogoUploading(true)
    setLogoError(null)
    try {
      const publicUrl = await uploadLogo(file)
      const updated = await companyApi.update({
        name: company!.name,
        description: company?.description ?? undefined,
        website: company?.website ?? undefined,
        email: company?.email ?? undefined,
        phone: company?.phone ?? undefined,
        logoUrl: publicUrl,
      })
      setCompany(updated)
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Logo upload failed')
    } finally {
      setLogoUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (loading) return <PageSpinner />

  return (
    <>
      <PageHeader
        title="Company Profile"
        action={
          !editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2530] border border-gray-700/40 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Pencil size={14} />
              Edit
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {company && (
        <div className="max-w-2xl">
          {/* Account status banner */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-6 ${STATUS_CLASSES[company.status]}`}
          >
            {STATUS_LABELS[company.status]}
          </div>

          {!editing ? (
            /* ── VIEW MODE ── */
            <div className="space-y-6">
              {/* Top row: name + logo */}
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white">{company.name}</h2>
                  {company.description && (
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                      {company.description}
                    </p>
                  )}
                </div>

                {/* Logo */}
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl bg-[#1a2530] border border-gray-700/40 overflow-hidden flex items-center justify-center">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-700">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={logoUploading}
                    className="absolute bottom-1 right-1 w-7 h-7 bg-[#2a3844] border border-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-[#cbfd00]/50"
                    title="Change logo"
                  >
                    {logoUploading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Camera size={13} className="text-gray-300" />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>

              {logoError && <ErrorBanner message={logoError} />}

              {/* Contact */}
              <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Contact</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Website', value: company.website },
                    { label: 'Email', value: company.email },
                    { label: 'Phone', value: company.phone },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="text-xs text-gray-600 w-16 pt-0.5">{label}</span>
                      <span className="text-sm text-gray-300 flex-1">
                        {value || <span className="text-gray-600 italic">Not set</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── EDIT MODE ── */
            <form onSubmit={handleSave} className="space-y-5">
              {saveError && <ErrorBanner message={saveError} />}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Company name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What does your company build?"
                  className="w-full px-3.5 py-2.5 bg-[#1a2530] border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors resize-none"
                />
              </div>

              <div className="bg-[#1a2530] border border-gray-700/40 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300">Contact</h3>
                {[
                  { label: 'Website', value: website, setter: setWebsite, placeholder: 'https://example.com', type: 'url' },
                  { label: 'Email', value: email, setter: setEmail, placeholder: 'company@example.com', type: 'email' },
                  { label: 'Phone', value: phone, setter: setPhone, placeholder: '(555) 123-4567', type: 'tel' },
                ].map(({ label, value, setter, placeholder, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3.5 py-2 bg-[#2a3844] border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#cbfd00]/50 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#cbfd00] text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-[#b8e600] transition-colors"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <Check size={14} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
