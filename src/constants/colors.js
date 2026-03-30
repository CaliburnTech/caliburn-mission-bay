/**
 * Centralized color constants for the Caliburn Mission Bay design system.
 *
 * USAGE GUIDE:
 * - For static styling: Use the Tailwind class names (tw property)
 * - For dynamic styling (computed opacity, SVG fills): Use hex values
 * - Always import from this file, never hardcode hex values in components
 */

/**
 * Category colors for loadout builder and capability organization.
 * Each category has a distinct color for visual differentiation.
 *
 * Properties:
 * - hex: Raw color value for dynamic styling (e.g., `${color}40` for opacity)
 * - tw: Tailwind color name for building class strings
 */
export const CATEGORY_COLORS = {
  SENSORS: {
    hex: '#06b6d4',
    tw: 'cyan-500',
    name: 'cyan'
  },
  COMMS: {
    hex: '#8b5cf6',
    tw: 'violet-500',
    name: 'violet'
  },
  WEAPONS: {
    hex: '#ef4444',
    tw: 'red-500',
    name: 'red'
  },
  C2: {
    hex: '#f97316',
    tw: 'orange-500',
    name: 'orange'
  },
  NAV: {
    hex: '#22c55e',
    tw: 'green-500',
    name: 'green'
  },
  AI: {
    hex: '#cbfd00',
    tw: 'lime-brand',
    name: 'lime'
  },
  UTILITY: {
    hex: '#64748b',
    tw: 'slate-500',
    name: 'slate'
  },
  OTHER: {
    hex: '#a855f7',
    tw: 'purple-500',
    name: 'purple'
  }
};

/**
 * Security level colors for configuration scoring.
 * Follows a traffic-light pattern from red (low) to green (high).
 */
export const SECURITY_COLORS = {
  BASELINE: {
    hex: '#ef4444',
    tw: 'red-500',
    label: 'BASELINE'
  },
  ENHANCED: {
    hex: '#f59e0b',
    tw: 'amber-500',
    label: 'ENHANCED'
  },
  ADVANCED: {
    hex: '#fbbf24',
    tw: 'yellow-400',
    label: 'ADVANCED'
  },
  HIGH: {
    hex: '#10b981',
    tw: 'emerald-500',
    label: 'HIGH SECURITY'
  },
  MAXIMUM: {
    hex: '#22c55e',
    tw: 'green-500',
    label: 'MAXIMUM SECURITY'
  }
};

/**
 * Get security level based on score (0-4)
 */
export const getSecurityLevel = (score) => {
  if (score === 0) return SECURITY_COLORS.BASELINE;
  if (score === 1) return SECURITY_COLORS.ENHANCED;
  if (score === 2) return SECURITY_COLORS.ADVANCED;
  if (score === 3) return SECURITY_COLORS.HIGH;
  return SECURITY_COLORS.MAXIMUM;
};

/**
 * Brand colors - primary palette
 */
export const BRAND_COLORS = {
  lime: {
    hex: '#cbfd00',
    tw: 'lime-brand'
  },
  limeHover: {
    hex: '#b8e600',
    tw: 'lime-hover'
  }
};

/**
 * Status colors for mission/deployment states
 */
export const STATUS_COLORS = {
  ready: {
    hex: '#4ade80',
    tw: 'green-400'
  },
  deployed: {
    hex: '#3b82f6',
    tw: 'blue-500'
  },
  maintenance: {
    hex: '#f59e0b',
    tw: 'amber-500'
  },
  error: {
    hex: '#ef4444',
    tw: 'red-500'
  }
};
