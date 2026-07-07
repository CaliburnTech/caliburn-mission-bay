/**
 * CORS helpers used by withHandler (see handler.js).
 *
 * Allowed origins come from the ALLOWED_ORIGINS env var (comma-separated).
 * TODO: set ALLOWED_ORIGINS in Vercel — until then this falls back to '*',
 * which is too permissive for production.
 */

const allowedOrigins = () =>
  (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

export function applyCors(req, res) {
  const origins = allowedOrigins();
  const requestOrigin = req.headers?.origin;

  let allowOrigin;
  if (origins.length === 0) {
    allowOrigin = '*'; // TODO: tighten once ALLOWED_ORIGINS is configured
  } else if (requestOrigin && origins.includes(requestOrigin)) {
    allowOrigin = requestOrigin;
  } else {
    allowOrigin = origins[0];
  }

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  if (allowOrigin !== '*') res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-Impersonation-Session-Id'
  );
}

/** Back-compat helper: applies CORS and short-circuits OPTIONS preflights. */
export function handleCors(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
