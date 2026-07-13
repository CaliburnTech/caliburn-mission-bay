import {
  Target, Eye, Crosshair, Radio, Zap, User, CheckCircle,
  Wifi, Brain, Radar, Navigation, Settings2,
  Shield, Ship, Ban, Plane, Fuel, Satellite, Users, Waves, Anchor, Lock
} from 'lucide-react';

// Mission domain types
export const MISSION_DOMAINS = {
  MARITIME: 'MARITIME',
  AERIAL: 'AERIAL',
  COMBINED: 'COMBINED'
};

// Define the 9 key MARITIME missions (including CNO priorities)
export const KEY_MARITIME_MISSIONS = [
  // CNO Priority Missions (Mine Warfare)
  { key: 'MCM', name: 'Mine Countermeasures', icon: Target, color: '#f97316', description: 'Detect & neutralize naval mines', domain: 'MARITIME' },
  // Other Maritime Missions
  { key: 'CONTESTED_LOGISTICS', name: 'Contested Logistics', icon: Ship, color: '#8b5cf6', description: 'Covert resupply operations', domain: 'MARITIME' },
  { key: 'ASW', name: 'Anti-Submarine Warfare', icon: Waves, color: '#06b6d4', description: 'Detect & track hostile submarines', domain: 'MARITIME' },
  { key: 'PORT_SECURITY', name: 'Port Security', icon: Anchor, color: '#10b981', description: 'Harbor perimeter screening & HVA protection', domain: 'MARITIME' },
  { key: 'ISR', name: 'ISR — Tethered Drone', icon: Eye, color: '#8b5cf6', description: 'Persistent maritime domain awareness', domain: 'MARITIME' },
  { key: 'COUNTER_C5ISR', name: 'Counter-C5ISR', icon: Radio, color: '#ef4444', description: 'Map adversary sensor coverage & exploit gaps', domain: 'MARITIME' },
  { key: 'NON_KINETIC_EW', name: 'Non-Kinetic Effects', icon: Zap, color: '#a855f7', description: 'EW deception, active jamming & acoustic decoy via NEMESIS', domain: 'MARITIME' },
  { key: 'MDA_ISR', name: 'MDA ISR', icon: Satellite, color: '#06b6d4', description: 'Persistent MDA — dark ship detection, PoL analysis & tipping/cueing of manned assets', domain: 'MARITIME' },
  { key: 'KINETIC_EFFECTS', name: 'Kinetic Effects', icon: Zap, color: '#ef4444', description: 'Long-range surface strike (Mk 70 PDS) & offensive mining (Hammerhead/Orca)', domain: 'MARITIME' },
  { key: 'PROTECTIONS', name: 'Protections', icon: Lock, color: '#f59e0b', description: 'cUxS · Undersea Infrastructure · HVU Protection · Port Security — CAPT Privette confirmed', domain: 'MARITIME' },
  // Sea Jeep missions
  { key: 'SEAJEEP_BASE', name: 'Sea Jeep — Base MDA', icon: Ship, color: '#14b8a6', description: 'Gray zone maritime domain awareness — AIS-dark contact photography & reporting', domain: 'MARITIME' },
  { key: 'SEAJEEP_ISR', name: 'Sea Jeep — ISR', icon: Eye, color: '#0ea5e9', description: 'Extended-mast ISR station — elevated EO/IR for drone-watch and threat cueing', domain: 'MARITIME' },
  { key: 'SEAJEEP_MCM', name: 'Sea Jeep — MCM Survey', icon: Target, color: '#f59e0b', description: 'Forward-look sonar + towed side-scan mine detection and mapping (detect only)', domain: 'MARITIME' },
  { key: 'SEAJEEP_LOGISTICS', name: 'Sea Jeep — Logistics', icon: Anchor, color: '#8b5cf6', description: 'Autonomous island-chain resupply — cargo pod delivery to forward posts', domain: 'MARITIME' },
  // JMN — Joint Maritime Next (Shield & Spear) — new capability-gap missions
  { key: 'SEABED_MONITORING', name: 'Seabed & Undersea Infra', icon: Waves, color: '#0891b2', description: 'CUI survey — baseline bathymetry + anomaly/change detection & DAS cueing (JMN Shield)', domain: 'MARITIME' },
  { key: 'THREAT_CHARACTERIZATION', name: 'Threat Characterization', icon: Radar, color: '#eab308', description: 'Detect + material-ID (CBRNE/contraband) of sleeper craft & hazards (JMN Shield)', domain: 'MARITIME' },
  { key: 'LAUNCHED_EFFECTS', name: 'Launched Effects', icon: Crosshair, color: '#dc2626', description: 'Maritime missile truck — mothership launching USVs/UUVs/ALE (JMN Spear)', domain: 'MARITIME' },
  { key: 'SOF_STRIKE_SUPPORT', name: 'SOF Strike Support', icon: Lock, color: '#7c3aed', description: 'Clandestine disablement + SOF insertion/strike support (JMN Spear)', domain: 'MARITIME' }
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
  { key: 'COMBINED_STRIKE', name: 'Strike Package', icon: Crosshair, color: '#ef4444', description: 'Coordinated aerial targeting & surface attack', domain: 'COMBINED' },
  // Maritime missions that standardly roster a UAV asset (MQ-4C Triton) alongside
  // surface/subsurface roles — surfaced here too, in addition to the Maritime tab.
  // Reuses the same mission objects defined above so name/description/color stay in sync.
  ...KEY_MARITIME_MISSIONS.filter(m => ['MDA_ISR', 'KINETIC_EFFECTS'].includes(m.key))
];

// Legacy export for backwards compatibility
export const KEY_MISSIONS = KEY_MARITIME_MISSIONS;

// All missions combined for filtering — de-duplicated by key. A couple of maritime
// missions (MDA_ISR, KINETIC_EFFECTS) are intentionally listed in both
// KEY_MARITIME_MISSIONS and KEY_COMBINED_MISSIONS (see above), but should only
// appear once here so lookups/dropdowns elsewhere don't render them twice.
export const ALL_MISSIONS = (() => {
  const seenKeys = new Set();
  return [
    ...KEY_MARITIME_MISSIONS,
    ...KEY_AERIAL_MISSIONS,
    ...KEY_COMBINED_MISSIONS
  ].filter(m => {
    if (seenKeys.has(m.key)) return false;
    seenKeys.add(m.key);
    return true;
  });
})();

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
  // Maritime missions - CNO Priorities
  MCM: { label: 'MCM Area', color: '#f97316', fillOpacity: 0.25, geometryType: 'zone', description: 'Draw mine countermeasures search area', domain: 'MARITIME' },
  ASW: { label: 'ASW Box', color: '#06b6d4', fillOpacity: 0.25, geometryType: 'zone', description: 'Draw anti-submarine search area', domain: 'MARITIME' },
  // Other Maritime missions
  CONTESTED_LOGISTICS: { label: 'Supply Route', color: '#8b5cf6', fillOpacity: 0.2, geometryType: 'route', description: 'Define resupply route with waypoints', domain: 'MARITIME' },
  PORT_SECURITY: { label: 'Security Perimeter', color: '#10b981', fillOpacity: 0.2, geometryType: 'perimeter', description: 'Define protected asset and screening perimeter radius', domain: 'MARITIME' },
  ISR: { label: 'ISR Patrol Area', color: '#8b5cf6', fillOpacity: 0.15, geometryType: 'zone', description: 'ISR patrol sector — persistent surveillance', domain: 'MARITIME' },
  COUNTER_C5ISR: { label: 'Counter-C5ISR Patrol', color: '#ef4444', fillOpacity: 0.12, geometryType: 'zone', description: 'Median line patrol — adversary sensor mapping', domain: 'MARITIME' },
  NON_KINETIC_EW: { label: 'NEMESIS Deception Box', color: '#a855f7', fillOpacity: 0.15, geometryType: 'zone', description: 'Multi-spectral false signature projection area', domain: 'MARITIME' },
  MDA_ISR: { label: 'MDA ISR Barrier', color: '#06b6d4', fillOpacity: 0.12, geometryType: 'zone', description: 'Persistent MDA patrol zone — multi-platform ISR barrier', domain: 'MARITIME' },
  KINETIC_EFFECTS: { label: 'Strike / Mining Area', color: '#ef4444', fillOpacity: 0.25, geometryType: 'target', description: 'Strike target points or mine deployment route', domain: 'MARITIME' },
  PROTECTIONS: { label: 'Protections AO', color: '#f59e0b', fillOpacity: 0.12, geometryType: 'perimeter', description: 'cUxS · Infrastructure · HVU · Port Security composite zone', domain: 'MARITIME' },
  // Sea Jeep missions
  SEAJEEP_BASE: { label: 'MDA Patrol Box', color: '#14b8a6', fillOpacity: 0.12, geometryType: 'zone', description: 'Define patrol box for gray zone MDA monitoring', domain: 'MARITIME' },
  SEAJEEP_ISR: { label: 'ISR Station', color: '#0ea5e9', fillOpacity: 0.12, geometryType: 'station', description: 'ISR loiter station — extended mast EO/IR coverage', domain: 'MARITIME' },
  SEAJEEP_MCM: { label: 'MCM Survey Lane', color: '#f59e0b', fillOpacity: 0.2, geometryType: 'route', description: 'Survey corridor for forward-look sonar + towed side-scan mine detection', domain: 'MARITIME' },
  SEAJEEP_LOGISTICS: { label: 'Resupply Route', color: '#8b5cf6', fillOpacity: 0.15, geometryType: 'route', description: 'Autonomous resupply transit route to forward island post', domain: 'MARITIME' },

  // JMN — Joint Maritime Next (Shield & Spear)
  SEABED_MONITORING: { label: 'CUI Survey Corridor', color: '#0891b2', fillOpacity: 0.15, geometryType: 'route', description: 'Survey lane over cable/pipeline corridor — baseline + anomaly detection', domain: 'MARITIME' },
  THREAT_CHARACTERIZATION: { label: 'Characterization Barrier', color: '#eab308', fillOpacity: 0.15, geometryType: 'zone', description: 'Chokepoint picket for detect + material-ID of sleeper craft', domain: 'MARITIME' },
  LAUNCHED_EFFECTS: { label: 'Launch Basket', color: '#dc2626', fillOpacity: 0.25, geometryType: 'target', description: 'Mothership launch basket + daughter-vehicle vectors', domain: 'MARITIME' },
  SOF_STRIKE_SUPPORT: { label: 'Covert Approach Lane', color: '#7c3aed', fillOpacity: 0.15, geometryType: 'route', description: 'Clandestine transit + release point + objective', domain: 'MARITIME' },

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
