import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

// TODO: Implement AI bridge endpoints for Mission Bay AI orchestration layer.
// Routes expected (per architecture-v3):
//   POST /ai-bridge/mission/recommend  — suggest capability stack for a mission type
//   POST /ai-bridge/sbom/analyze       — analyze an SBOM for risk/compliance
//   POST /ai-bridge/chat               — free-form mission planning assistant
// Uses company-scoped Anthropic API key (stored in Company.anthropicKeyArn via AWS Secrets Manager).
export const handler = async (
  _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 501,
    body: JSON.stringify({
      error: 'Not implemented — AI bridge endpoints coming in a future stream',
    }),
    headers: { 'Content-Type': 'application/json' },
  };
};
