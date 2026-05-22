import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

// TODO: Implement SBOM generation and retrieval endpoints.
// Routes expected:
//   GET  /sbom/:configId        — retrieve generated SBOM for a saved configuration
//   POST /sbom/:configId/generate — trigger CycloneDX 1.5 generation, store to S3
//   GET  /sbom/:configId/status — poll generation status
export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 501,
    body: JSON.stringify({ error: 'Not implemented — SBOM generation coming in a future stream' }),
    headers: { 'Content-Type': 'application/json' },
  };
};
