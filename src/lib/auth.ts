// The Lambda Authorizer injects these into event.requestContext.authorizer.lambda.
// Do NOT re-verify the JWT in handlers — auth is already resolved by the time we run.
export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
  isSuperAdmin: boolean;
  impersonationSessionId?: string;
  targetCompanyId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAuthContext(event: any): AuthContext {
  const ctx = event.requestContext?.authorizer?.lambda ?? {};
  return {
    userId: ctx.userId as string,
    companyId: ctx.companyId as string,
    role: ctx.role as string,
    isSuperAdmin: ctx.isSuperAdmin === 'true',
    impersonationSessionId: ctx.impersonationSessionId as string | undefined,
    targetCompanyId: ctx.targetCompanyId as string | undefined,
  };
}
