import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { prisma } from '../../lib/prisma';
import { isSuperAdmin, type JwtPayload } from '../../lib/superadmin';

// Verifier is created once at cold start and reuses its internal JWKS cache across invocations.
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID ?? '',
});

interface AuthorizerEvent {
  headers?: Record<string, string | undefined>;
}

interface AuthorizerResponse {
  isAuthorized: boolean;
  context?: Record<string, string | boolean>;
}

export const handler = async (event: AuthorizerEvent): Promise<AuthorizerResponse> => {
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) return { isAuthorized: false };

  // 1. Verify JWT signature against Cognito JWKS (RS256).
  let payload: JwtPayload;
  try {
    const verified = await verifier.verify(token);
    payload = verified as unknown as JwtPayload;
  } catch {
    return { isAuthorized: false };
  }

  // 2. Check SessionDenyList — used for hard bans and security-driven revocations.
  const jti = payload.jti;
  if (jti) {
    const denied = await prisma.sessionDenyList.findUnique({ where: { jwtJti: jti } });
    if (denied) return { isAuthorized: false };
  }

  // 3. Validate an impersonation session if the header is present.
  const impersonationId = event.headers?.['x-impersonation-session'];
  let impersonationTargetCompanyId = '';

  if (impersonationId) {
    const session = await prisma.impersonationSession.findUnique({
      where: { id: impersonationId },
    });
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return { isAuthorized: false };
    }
    impersonationTargetCompanyId = session.targetCompanyId;
  }

  // 4. Look up the user record.
  const user = await prisma.user.findUnique({
    where: { authId: payload.sub },
    include: { company: true },
  });

  if (!user || user.status === 'SUSPENDED') return { isAuthorized: false };

  // 5. Super-admin detection: email domain AND IdP — both required.
  const superAdmin = isSuperAdmin(payload);

  return {
    isAuthorized: true,
    context: {
      userId: user.id,
      companyId: user.companyId ?? '',
      role: user.role,
      isSuperAdmin: superAdmin,
      impersonationSessionId: impersonationId ?? '',
      targetCompanyId: impersonationTargetCompanyId,
    },
  };
};
