import {
  Target, Eye, Crosshair, Radio, Zap, User, CheckCircle,
  Wifi, Brain, Radar, Navigation, Settings2,
  Shield, Ship, Ban, Plane, Fuel, Satellite, Users
} from 'lucide-react';

// Mission domain types
export const MISSION_DOMAINS = {
  MARITIME: 'MARITIME',
  AERIAL: 'AERIAL',
  COMBINED: 'COMBINED'
};

// Define the 6 key MARITIME missions
export const KEY_MARITIME_MISSIONS = [
  { key: 'SEA_DENIAL', name: 'Sea Denial', icon: Ban, color: '#ef4444', description: 'Zone exclusion & elimination', domain: 'MARITIME' },
  { key: 'CONTESTED_LOGISTICS', name: 'Contested Logistics', icon: Ship, color: '#8b5cf6', description: 'Covert resupply operations', domain: 'MARITIME' },
  { key: 'ESCORT', name: 'Convoy Escort', icon: Shield, color: '#eab308', description: 'HVU convoy protection', domain: 'MARITIME' },
  { key: 'REFLEX_SWARM_ATTACK', name: 'Swarm Attack', icon: Crosshair, color: '#ef4444', description: 'Coordinated offensive strike', domain: 'MARITIME' },
  { key: 'ROBOT_DEFENSE_OODA', name: 'SIGINT Collection', icon: Radio, color: '#f97316', description: 'Persistent ELINT/COMINT surveillance', domain: 'MARITIME' },
  { key: 'RECONNAISSANCE', name: 'ISR Patrol', icon: Eye, color: '#06b6d4', description: 'Surveillance & reconnaissance', domain: 'MARITIME' }
];

// Define the 5 key AERIAL missions
export const KEY_AERIAL_MISSIONS = [
  { key: 'AERIAL_ISR', name: 'Aerial ISR', icon: Eye, color: '#06b6d4', description: 'Intelligence, surveillance & reconnaissance', domain: 'AERIAL' },
  { key: 'PERSISTENT_MDA', name: 'Persistent MDA', icon: Satellite, color: '#3b82f6', description: 'Maritime domain awareness from altitude', domain: 'AERIAL' },
  { key: 'AERIAL_REFUELING', name: 'Aerial Refueling', icon: Fuel, color: '#10b981', description: 'Tanker support & range extension', domain: 'AERIAL' },
  { key: 'TACTICAL_SUPPORT', name: 'Tactical Support', icon: Crosshair, color: '#f97316', description: 'Expeditionary & close air support', domain: 'AERIAL' },
  { key: 'COMMS_RELAY', name: 'Comms Relay', icon: Wifi, color: '#8b5cf6', description: 'Network extension & data relay', domain: 'AERIAL' }
];

// Define COMBINED operations (aerial + maritime)
export const KEY_COMBINED_MISSIONS = [
  { key: 'COMBINED_ISR_DENIAL', name: 'ISR + Sea Denial', icon: Users, color: '#ef4444', description: 'Aerial overwatch with surface denial', domain: 'COMBINED' },
  { key: 'COMBINED_ASW', name: 'Combined ASW', icon: Radar, color: '#06b6d4', description: 'Aerial & surface anti-submarine warfare', domain: 'COMBINED' },
  { key: 'COMBINED_ESCORT', name: 'Combined Escort', icon: Shield, color: '#eab308', description: 'Aerial surveillance with surface protection', domain: 'COMBINED' },
  { key: 'COMBINED_STRIKE', name: 'Strike Package', icon: Crosshair, color: '#ef4444', description: 'Coordinated aerial targeting & surface attack', domain: 'COMBINED' }
];

// Legacy export for backwards compatibility
export const KEY_MISSIONS = KEY_MARITIME_MISSIONS;

// All missions combined for filtering
export const ALL_MISSIONS = [
  ...KEY_MARITIME_MISSIONS,
  ...KEY_AERIAL_MISSIONS,
  ...KEY_COMBINED_MISSIONS
];

// Node type configuration - primary nodes are bigger, decision nodes smaller
export const nodeTypes = {
  trigger: { label: 'Trigger', color: '#3b82f6', icon: Zap, size: 'large', width: 140, height: 50 },
  sense: { label: 'Sense', color: '#06b6d4', icon: Eye, size: 'large', width: 140, height: 50 },
  observe: { label: 'Observe', color: '#06b6d4', icon: Eye, size: 'large', width: 140, height: 50 },
  orient: { label: 'Orient', color: '#8b5cf6', icon: Radio, size: 'large', width: 140, height: 50 },
  decide: { label: 'Decide', color: '#fbbf24', icon: Target, size: 'small', width: 100, height: 40 },
  decision: { label: 'Decision', color: '#fbbf24', icon: Target, size: 'small', width: 110, height: 40 },
  action: { label: 'Action', color: '#cbfd00', icon: Crosshair, size: 'large', width: 140, height: 50 },
  human_checkpoint: { label: 'Human', color: '#f97316', icon: User, size: 'medium', width: 120, height: 45 },
  end: { label: 'End', color: '#4ade80', icon: CheckCircle, size: 'large', width: 130, height: 50 }
};

// Five Body Problem - Autonomy Layers
export const autonomyLayers = [
  { id: 'comms', name: 'Comms Management', shortName: 'COMMS', color: '#3b82f6', icon: Wifi, description: 'Mesh network, theory of mind for file versions, network topology' },
  { id: 'mission', name: 'Mission Autonomy', shortName: 'MISSION', color: '#f97316', icon: Brain, description: 'Objectives, C2 picture, goal values & constraints' },
  { id: 'payload', name: 'Payload & Sensor', shortName: 'PAYLOAD', color: '#8b5cf6', icon: Radar, description: 'Employment optimization, sensor tasking, payload management' },
  { id: 'navigation', name: 'Navigation Autonomy', shortName: 'NAV', color: '#06b6d4', icon: Navigation, description: 'COLREGS, weather routing, vessel interaction avoidance' },
  { id: 'vehicle', name: 'Vehicle Handling', shortName: 'VEHICLE', color: '#4ade80', icon: Settings2, description: 'Resources, equipment status, maneuver execution' }
];

// Default hierarchy presets for different mission types
export const hierarchyPresets = {
  DEFAULT: ['navigation', 'vehicle', 'payload', 'mission', 'comms'],
  OFFENSIVE: ['mission', 'payload', 'navigation', 'vehicle', 'comms'],
  EVASIVE: ['navigation', 'vehicle', 'comms', 'mission', 'payload'],
  ISR: ['payload', 'mission', 'comms', 'navigation', 'vehicle'],
  SAR: ['navigation', 'mission', 'comms', 'payload', 'vehicle']
};

// Zone types based on mission
export const zoneTypes = {
  // Maritime missions
  SEA_DENIAL: { label: 'Denial Zone', color: '#ef4444', fillOpacity: 0.3, geometryType: 'zone', description: 'Draw area to deny enemy access', domain: 'MARITIME' },
  ESCORT: { label: 'Convoy Route', color: '#eab308', fillOpacity: 0.2, geometryType: 'route', description: 'Set waypoints A→B→C for escort path', domain: 'MARITIME' },
  CONTESTED_LOGISTICS: { label: 'Supply Route', color: '#8b5cf6', fillOpacity: 0.2, geometryType: 'route', description: 'Define resupply route with waypoints', domain: 'MARITIME' },
  RECONNAISSANCE: { label: 'Patrol Area', color: '#06b6d4', fillOpacity: 0.25, geometryType: 'zone', description: 'Draw patrol/surveillance area', domain: 'MARITIME' },
  REFLEX_SWARM_ATTACK: { label: 'Attack Targets', color: '#ef4444', fillOpacity: 0.35, geometryType: 'target', description: 'Mark target points and staging area', domain: 'MARITIME' },
  ROBOT_DEFENSE: { label: 'Collection Box', color: '#f97316', fillOpacity: 0.2, geometryType: 'perimeter', description: 'Define loiter area for SIGINT collection', domain: 'MARITIME' },
  ROBOT_DEFENSE_OODA: { label: 'Collection Box', color: '#f97316', fillOpacity: 0.2, geometryType: 'perimeter', description: 'Define loiter area for SIGINT collection', domain: 'MARITIME' },

  // Aerial missions
  AERIAL_ISR: { label: 'ISR Orbit', color: '#06b6d4', fillOpacity: 0.2, geometryType: 'orbit', description: 'Define orbit track for surveillance', domain: 'AERIAL' },
  PERSISTENT_MDA: { label: 'MDA Station', color: '#3b82f6', fillOpacity: 0.15, geometryType: 'station', description: 'Set station-keeping point for persistent coverage', domain: 'AERIAL' },
  AERIAL_REFUELING: { label: 'Tanker Track', color: '#10b981', fillOpacity: 0.2, geometryType: 'track', description: 'Define refueling anchor track', domain: 'AERIAL' },
  TACTICAL_SUPPORT: { label: 'Support Zone', color: '#f97316', fillOpacity: 0.25, geometryType: 'zone', description: 'Define tactical support area', domain: 'AERIAL' },
  COMMS_RELAY: { label: 'Relay Station', color: '#8b5cf6', fillOpacity: 0.15, geometryType: 'station', description: 'Set comms relay station point', domain: 'AERIAL' },

  // Combined missions
  COMBINED_ISR_DENIAL: { label: 'Combined AO', color: '#ef4444', fillOpacity: 0.25, geometryType: 'zone', description: 'Area for combined aerial/surface ops', domain: 'COMBINED' },
  COMBINED_ASW: { label: 'ASW Zone', color: '#06b6d4', fillOpacity: 0.2, geometryType: 'zone', description: 'Anti-submarine warfare search area', domain: 'COMBINED' },
  COMBINED_ESCORT: { label: 'Escort Corridor', color: '#eab308', fillOpacity: 0.2, geometryType: 'route', description: 'Convoy route with aerial overwatch', domain: 'COMBINED' },
  COMBINED_STRIKE: { label: 'Strike Package', color: '#ef4444', fillOpacity: 0.3, geometryType: 'target', description: 'Coordinated strike target area', domain: 'COMBINED' }
};
