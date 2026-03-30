/**
 * API Data Adapter (Production Mode)
 *
 * Fetches data from the Vercel serverless API backend.
 * Includes auth headers from Clerk. Caches responses in memory.
 *
 * PLACEHOLDER: This adapter will be fully implemented in Phase 3
 * when the backend API is built. For now, it falls back to the
 * static adapter with a console warning.
 */

import { createStaticAdapter } from './staticAdapter';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Create the API adapter instance.
 * Phase 3 will replace the static fallbacks with real API calls.
 */
export const createApiAdapter = (authToken = null) => {
  // For now, delegate to static adapter with warnings
  // This will be replaced with real fetch() calls in Phase 3
  const staticFallback = createStaticAdapter();

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
  });

  const fetchJSON = async (path) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  };

  return {
    ...staticFallback, // Fall back to static for everything not yet implemented

    // Override with real API calls as they're built:
    // getVessels: () => fetchJSON('/vessels'),
    // getCapabilities: () => fetchJSON('/capabilities'),
    // createVessel: (data) => fetchJSON('/vessels', { method: 'POST', body: JSON.stringify(data) }),

    mode: 'production',
    isReady: true,

    // Phase 3: These will be real implementations
    // For now they fall through to staticFallback
  };
};
