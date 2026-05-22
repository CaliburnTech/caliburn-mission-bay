import { supabase } from '../lib/supabase'
import { api } from './client'
import type { Company } from '../types'

/** Bucket must exist in your Supabase project with public read enabled. */
const LOGO_BUCKET = 'logos'

export const companyApi = {
  get: () => api.get<Company>('/api/company'),

  update: (data: {
    name: string
    description?: string
    website?: string
    email?: string
    phone?: string
    logoUrl?: string
  }) => api.put<Company>('/api/company', data),
}

/**
 * Upload a company logo to Supabase Storage and return the public URL.
 * The file is stored at `logos/<userId>.<ext>` with upsert so re-uploads
 * overwrite the previous logo without leaving orphaned objects.
 *
 * After uploading, call companyApi.update({ name, logoUrl }) to persist
 * the new URL on the company record.
 */
export async function uploadLogo(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const allowed = ['png', 'jpg', 'jpeg', 'webp']
  if (!allowed.includes(ext)) {
    throw new Error('Logo must be PNG, JPEG, or WebP')
  }

  const path = `${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
