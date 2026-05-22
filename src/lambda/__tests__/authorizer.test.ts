import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockVerify } = vi.hoisted(() => ({ mockVerify: vi.fn() }));

vi.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: () => ({ verify: mockVerify }),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: {
    sessionDenyList: { findUnique: vi.fn() },
    impersonationSession: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from '../../lib/prisma';
import { handler } from '../authorizer/index';

const baseUser = {
  id: 'user-1',
  companyId: 'company-1',
  role: 'OWNER' as const,
  status: 'ACTIVE' as const,
  email: 'vendor@boeing.com',
  company: { id: 'company-1', status: 'APPROVED' },
};

const basePayload = {
  sub: 'cognito-sub-1',
  email: 'vendor@boeing.com',
  jti: 'jti-abc',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockVerify.mockResolvedValue(basePayload);
  (prisma.sessionDenyList.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (prisma.impersonationSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(baseUser);
});

describe('Lambda Authorizer', () => {
  it('returns isAuthorized: false when Authorization header is missing', async () => {
    const result = await handler({ headers: {} });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: false when JWT verification fails', async () => {
    mockVerify.mockRejectedValue(new Error('invalid token'));
    const result = await handler({ headers: { authorization: 'Bearer bad-token' } });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: false when JTI is on the deny list', async () => {
    (prisma.sessionDenyList.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: '1', jwtJti: 'jti-abc' });
    const result = await handler({ headers: { authorization: 'Bearer valid-token' } });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: false when impersonation session is inactive', async () => {
    (prisma.impersonationSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sess-1',
      isActive: false,
      expiresAt: new Date(Date.now() + 3_600_000),
      targetCompanyId: 'company-2',
    });
    const result = await handler({
      headers: { authorization: 'Bearer valid-token', 'x-impersonation-session': 'sess-1' },
    });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: false when impersonation session is expired', async () => {
    (prisma.impersonationSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sess-1',
      isActive: true,
      expiresAt: new Date(Date.now() - 1000),
      targetCompanyId: 'company-2',
    });
    const result = await handler({
      headers: { authorization: 'Bearer valid-token', 'x-impersonation-session': 'sess-1' },
    });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: false when user is SUSPENDED', async () => {
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ ...baseUser, status: 'SUSPENDED' });
    const result = await handler({ headers: { authorization: 'Bearer valid-token' } });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: false when user does not exist', async () => {
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await handler({ headers: { authorization: 'Bearer valid-token' } });
    expect(result.isAuthorized).toBe(false);
  });

  it('returns isAuthorized: true with correct context for a normal user', async () => {
    const result = await handler({ headers: { authorization: 'Bearer valid-token' } });
    expect(result.isAuthorized).toBe(true);
    expect(result.context?.userId).toBe('user-1');
    expect(result.context?.companyId).toBe('company-1');
    expect(result.context?.role).toBe('OWNER');
    expect(result.context?.isSuperAdmin).toBe(false);
  });

  it('sets isSuperAdmin: true for @caliburn.us email with Caliburn IdP', async () => {
    mockVerify.mockResolvedValue({
      ...basePayload,
      email: 'alex@caliburn.us',
      identities: [{ providerName: 'Caliburn-AzureAD', userId: 'az-1' }],
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseUser,
      email: 'alex@caliburn.us',
      companyId: null,
    });
    const result = await handler({ headers: { authorization: 'Bearer valid-token' } });
    expect(result.isAuthorized).toBe(true);
    expect(result.context?.isSuperAdmin).toBe(true);
  });

  it('sets isSuperAdmin: false for @caliburn.us email from a non-Caliburn IdP', async () => {
    mockVerify.mockResolvedValue({
      ...basePayload,
      email: 'alex@caliburn.us',
      identities: [{ providerName: 'Okta-External', userId: 'ext-1' }],
    });
    const result = await handler({ headers: { authorization: 'Bearer valid-token' } });
    expect(result.isAuthorized).toBe(true);
    expect(result.context?.isSuperAdmin).toBe(false);
  });

  it('populates impersonation context when a valid session is present', async () => {
    (prisma.impersonationSession.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sess-2',
      isActive: true,
      expiresAt: new Date(Date.now() + 3_600_000),
      targetCompanyId: 'company-99',
    });
    const result = await handler({
      headers: { authorization: 'Bearer valid-token', 'x-impersonation-session': 'sess-2' },
    });
    expect(result.isAuthorized).toBe(true);
    expect(result.context?.impersonationSessionId).toBe('sess-2');
    expect(result.context?.targetCompanyId).toBe('company-99');
  });
});
