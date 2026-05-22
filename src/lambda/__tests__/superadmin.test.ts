import { describe, it, expect } from 'vitest';
import { isSuperAdmin } from '../../lib/superadmin';

const caliburnEmail = 'alex@caliburn.us';
const externalEmail = 'vendor@boeing.com';
const caliburnIdp = 'Caliburn-AzureAD';
const googleIdp = 'Caliburn-Google';
const externalIdp = 'Okta-Boeing';

const idp = (name: string) => [{ providerName: name, userId: '1' }];

describe('isSuperAdmin', () => {
  it('returns true when email is @caliburn.us and IdP is on the allowlist', () => {
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail, identities: idp(caliburnIdp) })).toBe(true);
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail, identities: idp(googleIdp) })).toBe(true);
  });

  it('returns false when email is @caliburn.us but IdP is not on the allowlist', () => {
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail, identities: idp(externalIdp) })).toBe(false);
  });

  it('returns false when IdP is on the allowlist but email is not @caliburn.us', () => {
    expect(isSuperAdmin({ sub: '1', email: externalEmail, identities: idp(caliburnIdp) })).toBe(false);
  });

  it('returns false when identities array is empty (direct Cognito signup)', () => {
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail, identities: [] })).toBe(false);
  });

  it('returns false when identities is missing', () => {
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail })).toBe(false);
  });

  it('returns false when email is missing', () => {
    expect(isSuperAdmin({ sub: '1', identities: idp(caliburnIdp) })).toBe(false);
  });

  it('parses identities when supplied as a JSON string (Cognito attribute format)', () => {
    const identitiesStr = JSON.stringify(idp(caliburnIdp)) as unknown as typeof idp extends (...args: infer _) => infer R ? R : never;
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail, identities: identitiesStr })).toBe(true);
  });

  it('returns false for malformed identities JSON string', () => {
    expect(isSuperAdmin({ sub: '1', email: caliburnEmail, identities: 'not-json' as unknown as Array<{ providerName: string; userId: string }> })).toBe(false);
  });

  it('is case-insensitive for the email domain check', () => {
    expect(isSuperAdmin({ sub: '1', email: 'Alex@CALIBURN.US', identities: idp(caliburnIdp) })).toBe(true);
  });
});
