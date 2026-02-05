import {
  Target, Eye, Crosshair, Radio, Zap, User, CheckCircle,
  Wifi, Brain, Radar, Navigation, Settings2,
  Shield, Ship, Ban
} from 'lucide-react';

// Define the 6 key missions to show
export const KEY_MISSIONS = [
  { key: 'SEA_DENIAL', name: 'Sea Denial', icon: Ban, color: '#ef4444', description: 'Zone exclusion & elimination' },
  { key: 'CONTESTED_LOGISTICS', name: 'Contested Logistics', icon: Ship, color: '#8b5cf6', description: 'Covert resupply operations' },
  { key: 'ESCORT', name: 'Convoy Escort', icon: Shield, color: '#eab308', description: 'HVU convoy protection' },
  { key: 'REFLEX_SWARM_ATTACK', name: 'Swarm Attack', icon: Crosshair, color: '#ef4444', description: 'Coordinated offensive strike' },
  { key: 'ROBOT_DEFENSE_OODA', name: 'SIGINT Collection', icon: Radio, color: '#f97316', description: 'Persistent ELINT/COMINT surveillance' },
  { key: 'RECONNAISSANCE', name: 'ISR Patrol', icon: Eye, color: '#06b6d4', description: 'Surveillance & reconnaissance' }
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
  SEA_DENIAL: { label: 'Denial Zone', color: '#ef4444', fillOpacity: 0.3, geometryType: 'zone', description: 'Draw area to deny enemy access' },
  ESCORT: { label: 'Convoy Route', color: '#eab308', fillOpacity: 0.2, geometryType: 'route', description: 'Set waypoints A→B→C for escort path' },
  CONTESTED_LOGISTICS: { label: 'Supply Route', color: '#8b5cf6', fillOpacity: 0.2, geometryType: 'route', description: 'Define resupply route with waypoints' },
  RECONNAISSANCE: { label: 'Patrol Area', color: '#06b6d4', fillOpacity: 0.25, geometryType: 'zone', description: 'Draw patrol/surveillance area' },
  REFLEX_SWARM_ATTACK: { label: 'Attack Targets', color: '#ef4444', fillOpacity: 0.35, geometryType: 'target', description: 'Mark target points and staging area' },
  ROBOT_DEFENSE: { label: 'Collection Box', color: '#f97316', fillOpacity: 0.2, geometryType: 'perimeter', description: 'Define loiter area - vessel patrols within this zone on racetrack/figure-8 pattern' },
  ROBOT_DEFENSE_OODA: { label: 'Collection Box', color: '#f97316', fillOpacity: 0.2, geometryType: 'perimeter', description: 'Define loiter area - vessel patrols within this zone on racetrack/figure-8 pattern' }
};
