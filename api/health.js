/**
 * Health check endpoint
 * GET /api/health
 *
 * Returns the API status. Used to verify the production deployment is
 * running with backend services.
 */

import { withHandler } from './_lib/handler.js';

export default withHandler(
  (req, res) =>
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
    }),
  { auth: 'none' }
);
