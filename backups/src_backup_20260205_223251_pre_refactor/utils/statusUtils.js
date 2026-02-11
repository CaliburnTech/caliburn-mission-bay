// Shared status color and style utilities

export const MISSION_STATUS_COLORS = {
  draft: '#6b7280',
  ready: '#fbbf24',
  active: '#4ade80',
  paused: '#f97316',
  completed: '#06b6d4',
  archived: '#374151'
};

export const MISSION_STATUS_BG = {
  draft: 'rgba(107, 114, 128, 0.15)',
  ready: 'rgba(251, 191, 36, 0.15)',
  active: 'rgba(74, 222, 128, 0.15)',
  paused: 'rgba(249, 115, 22, 0.15)',
  completed: 'rgba(6, 182, 212, 0.15)',
  archived: 'rgba(55, 65, 81, 0.15)'
};

export const getStatusColor = (status) => {
  return MISSION_STATUS_COLORS[status] || '#6b7280';
};

export const getStatusBg = (status) => {
  return MISSION_STATUS_BG[status] || 'rgba(107, 114, 128, 0.15)';
};

// Vessel/fleet status colors
export const VESSEL_STATUS_COLORS = {
  'mission-ready': '#4ade80',
  deployed: '#fbbf24',
  returned: '#06b6d4',
  maintenance: '#f97316'
};

export const getVesselStatusColor = (status) => {
  return VESSEL_STATUS_COLORS[status] || '#6b7280';
};

// Date formatting utility
export const formatMissionDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
