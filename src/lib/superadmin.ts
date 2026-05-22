// Both conditions must pass — email alone is insufficient (closes SAML/OIDC trust gap where
// an external IdP could assert a @caliburn.us email for a non-Caliburn user).
const CALIBURN_IDP_ALLOWLIST = ['Caliburn-AzureAD', 'Caliburn-Google'];

export interface JwtPayload {
  sub: string;
  email?: string;
  jti?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  identities?: Array<{ providerName: string; userId: string }> | string;
  [key: string]: unknown;
}

function parseIdentities(
  raw: Array<{ providerName: string; userId: string }> | string | undefined,
): Array<{ providerName: string }> {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Array<{ providerName: string }>;
    } catch {
      return [];
    }
  }
  return raw;
}

export function isSuperAdmin(jwtPayload: JwtPayload): boolean {
  const emailOk =
    typeof jwtPayload.email === 'string' &&
    jwtPayload.email.toLowerCase().endsWith('@caliburn.us');

  const identities = parseIdentities(jwtPayload.identities);
  const providerName = identities[0]?.providerName ?? '';
  const idpOk = CALIBURN_IDP_ALLOWLIST.includes(providerName);

  return emailOk && idpOk;
}
