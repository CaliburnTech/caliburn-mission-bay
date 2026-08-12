/**
 * Cross-portal URLs (production).
 *
 * The maker portal is a separate Vercel project; its production domain is
 * stable. Override via VITE_MAKER_PORTAL_URL if it ever moves.
 */
export const MAKER_PORTAL_URL =
  import.meta.env.VITE_MAKER_PORTAL_URL || 'https://mission-bay-maker.vercel.app';
