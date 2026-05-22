import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ok } from '../../lib/response';

export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  return ok({
    status: 'ok',
    mode: process.env.VITE_APP_MODE ?? 'production',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
  });
};
