/* global process */
/**
 * Health check endpoint
 * GET /api/health
 *
 * Returns the API status and mode. Used to verify the production
 * deployment is running with backend services.
 */

export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    mode: process.env.VITE_APP_MODE || 'demo',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
}
