import Anthropic from '@anthropic-ai/sdk';
import { withHandler } from '../_lib/handler.js';
import { assertRateLimit } from '../_lib/rateLimit.js';
import { ok, badRequest, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/ai/mission-advisor — public, rate-limited Anthropic proxy for the
 * Mission Advisor (docs/MISSION_ADVISOR_CLAUDE_PLAN.md §5.1, endpoint Option A).
 *
 * Body: { context: string, messages: [{ role: 'user'|'assistant', content: string }] }
 * Response: { reply: string, usage: { inputTokens, outputTokens } }
 *
 * Design decisions (do not change casually):
 * - auth is DEPLOYMENT-DEPENDENT: the demo deployment (missionbay) stays
 *   unauthenticated so Navy demos never see a sign-in prompt; the production
 *   deployment (VITE_APP_MODE=production) requires a signed-in user so
 *   anonymous visitors cannot spend Anthropic tokens. Public-demo abuse is
 *   bounded by the 10/min/IP rate limit, MAX_TOKENS 1024, and Haiku pricing.
 * - The guardrail system prompt is a SERVER-SIDE CONSTANT. Any `system` field
 *   in the body is ignored — the client can never override the guardrail.
 * - Key comes from env ANTHROPIC_API_KEY only. No company-key lookup and no
 *   prisma import: this function stays dependency-free so it cold-starts fast.
 * - Mission context arrives as `context` and is prepended as the first user
 *   turn (the sibling /api/ai/chat endpoint caps `system` at 4,000 chars,
 *   which is why context does NOT travel in `system` — see plan §3).
 */

const MODEL = process.env.ADVISOR_MODEL || 'claude-haiku-4-5';
const MAX_TOKENS = 1024;
const MAX_MESSAGES = 12;
const MAX_CONTEXT_CHARS = 20_000;
const MAX_MESSAGE_CHARS = 2_000;
const RATE_LIMIT = { limit: 10, windowMs: 60_000, bucket: 'mission-advisor' };

const SYSTEM_PROMPT =
  "You are the Mission Advisor inside Caliburn's Mission Bay. Answer questions using ONLY the mission data provided in the first message. Ground every claim in that data — quote SWaP numbers, role requirements, and capability descriptions from it. If the data does not contain the answer, say so in one sentence; never invent specifications, TRLs, vendors, or program facts. Keep answers short (2–6 sentences), concrete, and in a measured professional voice. Write plain text only — no markdown, no asterisks, no bullet lists (the client renders plain text). Never contradict the provided data.";

function validateBody(body) {
  const { context, messages } = body ?? {};

  if (typeof context !== 'string' || context.length === 0) {
    return 'context must be a non-empty string';
  }
  if (context.length > MAX_CONTEXT_CHARS) {
    return `context must be under ${MAX_CONTEXT_CHARS} characters`;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array';
  }
  if (messages.length > MAX_MESSAGES) {
    return `messages must contain at most ${MAX_MESSAGES} entries`;
  }
  for (const msg of messages) {
    if (msg?.role !== 'user' && msg?.role !== 'assistant') {
      return "each message role must be 'user' or 'assistant'";
    }
    if (typeof msg.content !== 'string' || msg.content.length === 0) {
      return 'each message content must be a non-empty string';
    }
    if (msg.content.length > MAX_MESSAGE_CHARS) {
      return `each message must be under ${MAX_MESSAGE_CHARS} characters`;
    }
  }

  return null;
}

export default withHandler(
  async (req, res) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    assertRateLimit(req, RATE_LIMIT);

    const validationError = validateBody(req.body);
    if (validationError) return badRequest(res, validationError);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Advisor is not configured' });
    }

    const { context, messages } = req.body;
    const client = new Anthropic({ apiKey });

    const assembled = [
      { role: 'user', content: `MISSION DATA:\n${context}` },
      { role: 'assistant', content: 'Understood — I will answer only from this mission data.' },
      ...messages.map(({ role, content }) => ({ role, content })),
    ];

    let response;
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: assembled,
      });
    } catch (err) {
      // Never log err bodies verbatim beyond status/message — and never the key.
      console.error('[ai/mission-advisor] Anthropic request failed:', err?.status, err?.message);
      if (err?.status === 401) {
        return res.status(502).json({ error: 'The configured Anthropic API key was rejected' });
      }
      return res.status(502).json({ error: 'Advisor request failed — please try again' });
    }

    const reply = (response.content ?? [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return ok(res, {
      reply,
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      },
    });
  },
  // VITE_APP_MODE is baked into the frontend at build time AND present as a
  // plain server env var on each Vercel project — 'production' only on the
  // real marketplace deployment, 'demo' on missionbay.
  { auth: process.env.VITE_APP_MODE === 'production' ? 'user' : 'none' }
);
