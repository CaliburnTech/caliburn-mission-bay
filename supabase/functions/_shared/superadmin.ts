// Mirrors the policy in src/lib/superadmin.ts.
// Accepts a Supabase User object (identities[].provider) rather than a raw JWT
// payload (identities[].providerName) — the value is the same string at runtime.
const CALIBURN_IDP_ALLOWLIST = ['Caliburn-AzureAD', 'Caliburn-Google']

export interface SupabaseUser {
  email?: string | null
  identities?: Array<{ provider: string }>
}

export function isSuperAdmin(user: SupabaseUser): boolean {
  const emailOk =
    typeof user.email === 'string' &&
    user.email.toLowerCase().endsWith('@caliburn.us')

  const provider = user.identities?.[0]?.provider ?? ''
  const idpOk = CALIBURN_IDP_ALLOWLIST.includes(provider)

  return emailOk && idpOk
}
