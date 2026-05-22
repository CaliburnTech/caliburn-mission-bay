import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getPresignedUploadUrl } from '../../lib/s3';
import { getAuthContext } from '../../lib/auth';
import { ok, badRequest, notFound, methodNotAllowed, serverError } from '../../lib/response';

const ALLOWED_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// POST /upload/presign
// Body: { key: string, contentType: string }
// Returns a presigned S3 PUT URL. The browser uploads directly; the file never transits Lambda.
const presign = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const { key, contentType } = body;

  if (!(key as string)?.trim()) return badRequest('key is required');
  if (!ALLOWED_CONTENT_TYPES.includes(contentType as string)) {
    return badRequest(`contentType must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
  }

  // Namespace by companyId to prevent path traversal
  const safeKey = `uploads/${auth.companyId}/${(key as string).replace(/^\/+/, '')}`;

  const { uploadUrl, publicUrl } = await getPresignedUploadUrl(safeKey, contentType as string);
  return ok({ uploadUrl, publicUrl });
};

// POST /upload/logo
// Body: { contentType: 'image/png' | 'image/jpeg' | 'image/webp' }
const logoPresign = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const { contentType } = body;
  if (!ALLOWED_CONTENT_TYPES.includes(contentType as string)) {
    return badRequest(`contentType must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
  }

  const ext = (contentType as string).split('/')[1];
  const key = `logos/${auth.companyId}.${ext}`;

  const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType as string);
  return ok({ uploadUrl, publicUrl });
};

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};

    if (method !== 'POST') return methodNotAllowed();

    if (path === '/upload/presign') return await presign(auth, body);
    if (path === '/upload/logo') return await logoPresign(auth, body);

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
