/**
 * apiBase.js — builds buyer-app API URLs correctly regardless of how
 * VITE_API_URL is configured.
 *
 * The buyer app's VITE_API_URL is '/api' in production (the apiAdapter's paths
 * deliberately omit the /api prefix, e.g. '/configurations'). In local/demo it
 * may be empty, and other setups may use a full origin. This helper normalizes
 * so the final URL always contains exactly ONE '/api' segment.
 *
 *   base '/api'                        + '/submissions' -> '/api/submissions'
 *   base ''                            + '/submissions' -> '/api/submissions'
 *   base 'https://missionbay.vercel.app' + '/submissions' -> '.../api/submissions'
 */
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/** Build a full API URL for a route path like '/submissions' or '/admin/submissions'. */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE.endsWith('/api') ? `${API_BASE}${p}` : `${API_BASE}/api${p}`;
}
