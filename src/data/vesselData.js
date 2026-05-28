// Vessel data and mappings - separated from components for fast refresh compatibility
import {
  USVPatrolHull,
  FreedomLCSHull,
  TiconderogaHull,
  ArleighBurkeHull,
  MediumUSVHull,
  SmallUSVHull,
  SubmarineHull,
  M48Hull,
  M68Hull,
  HSMUSVHull,
  H48Hull,
  SailboatHull,
  UUVHull,
  StealthHull,
  CustomPlatformHull,
  MantaRayHull,
  TritonAUSVHull,
  MQ25StingrayHull,
  MQ9ReaperHull,
  MQ4CTritonHull,
  MQ8FireScoutHull,
  RQ21BlackjackHull,
  GARCHull,
  SubSeaSailHull,
  AEGIRFHull,
  AEGIRWHull,
  AEGIRHHull,
  BlackWidowHull,
  SwitchbladeHull,
  ZeroUSVOceanus17Hull
} from '../components/VesselHulls';

// Platform type classification helpers
export const isAerialPlatform = (platformType) => platformType?.includes('UAV');
export const isMaritimePlatform = (platformType) =>
  platformType?.includes('USV') || platformType?.includes('UUV') || platformType === 'Ship' || platformType === 'Submarine';

// Global baselines for autonomous maritime vessels (used for bar graph positioning)
// These represent "typical" values - bar midpoint = baseline
export const globalBaselines = {
  speed: {
    unit: 'kts',
    baseline: 15,       // Typical autonomous boat speed
    min: 0,
    max: 50,            // High-performance vessels
    criticalLow: 1,     // Below this is nearly unusable (lowered for gliders)
  },
  range: {
    unit: 'nm',
    baseline: 200,      // Typical operational range
    min: 0,
    max: 10000,         // Extended range vessels (includes gliders with 3000+ nm)
    criticalLow: 25,    // Below this severely limits missions
  },
  power: {
    unit: 'kW',
    // Shows remaining power (capacity - used)
    // Negative = over capacity = critical
    criticalLow: 0,     // At or below 0 = overloaded
  },
  payload: {
    unit: 'kg',
    // Shows remaining capacity (capacity - used)
    // Negative = over capacity = critical
    criticalLow: 0,     // At or below 0 = overloaded
  },
  signature: {
    unit: 'm²',
    // RCS - lower is stealthier
    // We invert for display so higher bar = stealthier
    baseline: 5,        // Typical small vessel RCS
    stealthyThreshold: 1,   // Below this = very stealthy
    highSignature: 50,      // Above this = easily detected
  }
};

// Aerial platform baselines (used for AerialStatsDisplay)
export const aerialBaselines = {
  endurance: {
    unit: 'hrs',
    baseline: 12,       // Typical tactical UAV endurance
    min: 0,
    max: 36,            // High-endurance platforms (MQ-4C Triton)
    criticalLow: 2,     // Below this severely limits missions
  },
  missionRadius: {
    unit: 'nm',
    baseline: 500,      // Typical operational radius
    min: 0,
    max: 2500,          // Extended range platforms
    criticalLow: 25,    // Below this limits utility
  },
  payload: {
    unit: 'lbs',
    // Shows remaining capacity (capacity - used)
    criticalLow: 0,     // At or below 0 = overloaded
  },
  datalink: {
    // Tiered rating system for C2 quality
    tiers: [
      { level: 1, name: 'Basic', desc: 'LOS only, limited bandwidth', color: '#6b7280' },
      { level: 2, name: 'Standard', desc: 'LOS + basic SATCOM', color: '#3b82f6' },
      { level: 3, name: 'Advanced', desc: 'LOS + BLOS SATCOM, anti-jam', color: '#8b5cf6' },
      { level: 4, name: 'Resilient', desc: 'Full spectrum, mesh, cyber-hardened', color: '#CBFD00' }
    ]
  },
  burnRate: {
    unit: '%',
    // How much payload weight affects endurance
    // effectiveEndurance = baseEndurance * (1 - (usedPayload/maxPayload) * burnRateFactor)
    // Higher factor = more sensitive to payload weight
    baseFactor: 0.3,    // 30% endurance reduction at max payload (default)
    sensitivityByType: {
      'Small UAS': 0.4,   // Small platforms more affected
      'MALE': 0.25,       // Medium platforms moderately affected
      'HALE': 0.15,       // High-endurance platforms less affected
      'VTOL': 0.35,       // Helicopters moderately affected
      'Tanker': 0.1       // Tankers designed for heavy loads
    }
  }
};

// Vessel data array for outfitter view - organized by category
export const vesselHullData = [
  // ============ MAGNET DEFENSE FLEET ============
  {
    name: "M48",
    type: "Multi-Mission USV",
    platformType: "USV",
    displacement: "210 tons",
    description: "Multi-Mission, Long-Range Fleet Operations Variant. AI-enabled autonomous surface vessel for fleet power projection, missile defense, contested logistics, and personnel recovery.",
    icon: "M48",
    manufacturer: "Magnet Defense",
    specs: {
      speed: 27,         // knots burst speed
      range: 17000,      // nautical miles
      rcs: 15            // m² (estimate for 48m surface vessel)
    },
    capacity: {
      totalWeight: 100000,  // kg payload capacity (100 tons)
      totalPower: 500       // kW available power
    },
    detailedSpecs: {
      length: "48 m",
      displacement: "210 tons",
      containers: "4 x 40' ISO",
      cruiseSpeed: "15 kts",
      burstSpeed: "27 kts",
      range: "17,000 NM",
      payload: "100 tons",
      role: "Multi-mission, long-range fleet operations"
    },
    features: [
      "AI-enabled autonomous navigation (DRIVE AI)",
      "Four 40' ISO container payload bays",
      "17,000 NM transoceanic range",
      "Fleet-scale 210-ton displacement",
      "USV / UUV mothership capability",
      "Manned and unmanned teaming ready"
    ],
    applications: [
      "Integrated Air & Missile Defense",
      "Contested Logistics",
      "Long Range ISR&T",
      "Anti-Submarine Warfare",
      "Surface Warfare",
      "USV / UUV Mothership",
      "Search & Rescue",
      "Fleet Resupply"
    ],
    externalLinks: {
      manufacturer: "https://magnetdefense.com"
    }
  },
  {
    name: "M68",
    type: "Strategic Defense USV",
    platformType: "USV",
    displacement: "650 tons",
    description: "Strategic Missile Defense & Contested Logistics variant. Fleet-scale autonomous surface vessel sized for integrated air and missile defense.",
    icon: "M68",
    manufacturer: "Magnet Defense",
    specs: {
      speed: 32,         // knots burst speed
      range: 13900,
      rcs: 25
    },
    capacity: {
      totalWeight: 220000,  // 220 tons
      totalPower: 1000
    },
    detailedSpecs: {
      length: "68 m",
      displacement: "650 tons",
      containers: "8 x 40' ISO",
      cruiseSpeed: "25 kts",
      burstSpeed: "32 kts",
      range: "13,900 NM",
      payload: "220 tons",
      role: "Strategic missile defense & contested logistics"
    },
    features: [
      "AI-enabled autonomous navigation (DRIVE AI)",
      "Eight 40' ISO container payload bays",
      "Strategic missile defense host platform",
      "650-ton displacement for fleet-scale operations",
      "Integrated air & missile defense ready",
      "TRACK AI threat detection and telemetry"
    ],
    applications: [
      "Strategic Missile Defense",
      "Integrated Air & Missile Defense",
      "Contested Logistics",
      "Long Range ISR&T",
      "Manned & Unmanned Teaming",
      "USV / UUV Mothership"
    ],
    externalLinks: {
      manufacturer: "https://magnetdefense.com"
    }
  },
  {
    name: "HSM-USV",
    type: "Multi-Mission USV",
    platformType: "USV",
    displacement: "210 tons",
    description: "Magnet Defense HSM-USV variant. Specifications pending; placeholder data mirrored from M48 baseline.",
    icon: "HSM-USV",
    manufacturer: "Magnet Defense",
    specs: { speed: 27, range: 17000, rcs: 15 },
    capacity: { totalWeight: 100000, totalPower: 500 },
    detailedSpecs: {
      note: "Placeholder using M48 stats. Final specs forthcoming from Magnet Defense."
    },
    externalLinks: { manufacturer: "https://magnetdefense.com" }
  },
  {
    name: "H48",
    type: "Multi-Mission USV",
    platformType: "USV",
    displacement: "210 tons",
    description: "Magnet Defense H48 variant. Specifications pending; placeholder data mirrored from M48 baseline.",
    icon: "H48",
    manufacturer: "Magnet Defense",
    specs: { speed: 27, range: 17000, rcs: 15 },
    capacity: { totalWeight: 100000, totalPower: 500 },
    detailedSpecs: {
      note: "Placeholder using M48 stats. Final specs forthcoming from Magnet Defense."
    },
    externalLinks: { manufacturer: "https://magnetdefense.com" }
  },
  // ============ AUTONOMOUS UNDERWATER/SURFACE VEHICLE ============
  {
    name: "SubSeaSail Horus",
    type: "Autonomous AUSV",
    platformType: "USV",
    displacement: "< 1 ton",
    description: "Autonomous undersea and surface vehicle. 100% energy harvesting, submersible, solar + LiFePO4.",
    icon: "SubSeaSail",
    specs: {
      speed: 2,         // knots (glider)
      range: 3000,      // nm (very efficient)
      rcs: 0.01         // m² (underwater, minimal)
    },
    capacity: {
      totalWeight: 50,
      totalPower: 2
    }
  },
];

export const vesselHullComponents = {
  // Magnet Defense fleet
  "M48": M48Hull,
  "M68": M68Hull,
  "HSM-USV": HSMUSVHull,
  "H48": H48Hull,
  // Small USV category
  "Saildrone": SailboatHull,
  "SubSeaSail": SubSeaSailHull,
  "SubSeaSail Horus": SubSeaSailHull,
  "Otter X": SmallUSVHull,
  "Mariner": SmallUSVHull,
  "AEGIR-F": AEGIRFHull,        // SNC small kinetic USV
  // Medium USV category
  "ZeroUSV Oceanus17": ZeroUSVOceanus17Hull, // ZeroUSV 17m electric USV
  "MASC": MediumUSVHull,
  "AEGIR-W": AEGIRWHull,        // SNC medium combat USV
  "AEGIR-H": AEGIRHHull,        // SNC large 49ft multi-role USV
  // AUSV category
  "Triton": TritonAUSVHull,
  // Large/XLUUV category
  "Manta Ray": MantaRayHull,
  // UAV category
  "MQ-25 Stingray": MQ25StingrayHull,
  "MQ-9 Reaper": MQ9ReaperHull,
  "MQ-4C Triton": MQ4CTritonHull,
  "MQ-8C Fire Scout": MQ8FireScoutHull,
  "RQ-21A Blackjack": RQ21BlackjackHull,
  "Black Widow": BlackWidowHull,
  "Switchblade": SwitchbladeHull,
  // Crewed vessels
  "Arleigh Burke": ArleighBurkeHull,
  "Virginia Class": SubmarineHull,
  // Legacy/fallback mappings
  "Small USV": SmallUSVHull,
  "Medium USV": MediumUSVHull,
  "Ticonderoga": TiconderogaHull,
  "Virginia": SubmarineHull,
  "USV Patrol Boat": SmallUSVHull,
  "Oliver Hazard Perry Class": FreedomLCSHull,
  "GARC": GARCHull,
  "Custom Platform": CustomPlatformHull
};

// Vessel Mount Points Configuration
export const vesselMountPoints = {
  "Arleigh Burke": {
    "Forward VLS": { type: "KINETIC WEAPONS", x: 30, y: 25, category: "Missile Systems" },
    "Aft VLS": { type: "KINETIC WEAPONS", x: 30, y: 65, category: "Missile Systems" },
    "Hidden Level Radar": { type: "RADAR/RF", x: 50, y: 15, category: "Sensors" },
    "CIWS": { type: "DIRECTED ENERGY", x: 70, y: 30, category: "Point Defense" },
    "EW Suite": { type: "ELECTRONIC SUPPORT", x: 50, y: 40, category: "Electronic Warfare" },
    "Sonar Dome": { type: "ACOUSTIC/SONAR", x: 20, y: 85, category: "Underwater Sensors" },
    "Communications": { type: "RF COMMUNICATIONS", x: 50, y: 20, category: "Communications" },
    "Navigation": { type: "NAVIGATION", x: 45, y: 35, category: "Navigation Systems" }
  },
  "Ticonderoga": {
    "Forward VLS": { type: "KINETIC WEAPONS", x: 20, y: 25, category: "Missile Systems" },
    "Aft VLS": { type: "KINETIC WEAPONS", x: 20, y: 65, category: "Missile Systems" },
    "SPY-1 Radar": { type: "RADAR/RF", x: 50, y: 15, category: "Sensors" },
    "5-inch Gun": { type: "KINETIC WEAPONS", x: 30, y: 15, category: "Naval Guns" },
    "Harpoon Launcher": { type: "KINETIC WEAPONS", x: 75, y: 40, category: "Anti-Ship" },
    "CIWS Forward": { type: "DIRECTED ENERGY", x: 80, y: 30, category: "Point Defense" },
    "CIWS Aft": { type: "DIRECTED ENERGY", x: 80, y: 70, category: "Point Defense" },
    "SQS-53 Sonar": { type: "ACOUSTIC/SONAR", x: 40, y: 85, category: "Anti-Submarine" },
    "Electronic Warfare": { type: "ELECTRONIC SUPPORT", x: 60, y: 25, category: "Electronic Warfare" },
    "Communications": { type: "RF COMMUNICATIONS", x: 65, y: 35, category: "Communications" },
    "Torpedo Tubes": { type: "KINETIC WEAPONS", x: 35, y: 75, category: "Anti-Submarine" }
  },
  "M48": {
    "Forward ISO Bay": { type: "UTILITY", x: 25, y: 30, category: "Payload" },
    "Aft ISO Bay": { type: "UTILITY", x: 70, y: 30, category: "Payload" },
    "Primary Sensor Mast": { type: "EO/IR SENSORS", x: 50, y: 20, category: "Sensors" },
    "Surface Radar": { type: "RADAR/RF", x: 50, y: 28, category: "Sensors" },
    "VLS Cells": { type: "KINETIC WEAPONS", x: 35, y: 50, category: "Missile Systems" },
    "Communications": { type: "SATCOM", x: 55, y: 45, category: "Communications" },
    "DRIVE AI": { type: "UNMANNED SYSTEMS", x: 60, y: 60, category: "Autonomous Systems" },
    "TRACK AI": { type: "COMMAND & CONTROL", x: 45, y: 60, category: "Control Systems" }
  },
  "M68": {
    "ISO Bay 1": { type: "UTILITY", x: 20, y: 30, category: "Payload" },
    "ISO Bay 2": { type: "UTILITY", x: 40, y: 30, category: "Payload" },
    "ISO Bay 3": { type: "UTILITY", x: 60, y: 30, category: "Payload" },
    "ISO Bay 4": { type: "UTILITY", x: 80, y: 30, category: "Payload" },
    "IAMD Radar": { type: "RADAR/RF", x: 50, y: 15, category: "Sensors" },
    "Forward VLS": { type: "KINETIC WEAPONS", x: 30, y: 50, category: "Missile Systems" },
    "Aft VLS": { type: "KINETIC WEAPONS", x: 70, y: 50, category: "Missile Systems" },
    "CIWS": { type: "DIRECTED ENERGY", x: 50, y: 60, category: "Point Defense" },
    "Communications": { type: "SATCOM", x: 50, y: 70, category: "Communications" },
    "DRIVE AI": { type: "UNMANNED SYSTEMS", x: 65, y: 80, category: "Autonomous Systems" },
    "TRACK AI": { type: "COMMAND & CONTROL", x: 35, y: 80, category: "Control Systems" }
  },
  "HSM-USV": {
    "Forward ISO Bay": { type: "UTILITY", x: 25, y: 30, category: "Payload" },
    "Aft ISO Bay": { type: "UTILITY", x: 70, y: 30, category: "Payload" },
    "Primary Sensor Mast": { type: "EO/IR SENSORS", x: 50, y: 20, category: "Sensors" },
    "Surface Radar": { type: "RADAR/RF", x: 50, y: 28, category: "Sensors" },
    "VLS Cells": { type: "KINETIC WEAPONS", x: 35, y: 50, category: "Missile Systems" },
    "Communications": { type: "SATCOM", x: 55, y: 45, category: "Communications" },
    "DRIVE AI": { type: "UNMANNED SYSTEMS", x: 60, y: 60, category: "Autonomous Systems" },
    "TRACK AI": { type: "COMMAND & CONTROL", x: 45, y: 60, category: "Control Systems" }
  },
  "H48": {
    "Forward ISO Bay": { type: "UTILITY", x: 25, y: 30, category: "Payload" },
    "Aft ISO Bay": { type: "UTILITY", x: 70, y: 30, category: "Payload" },
    "Primary Sensor Mast": { type: "EO/IR SENSORS", x: 50, y: 20, category: "Sensors" },
    "Surface Radar": { type: "RADAR/RF", x: 50, y: 28, category: "Sensors" },
    "VLS Cells": { type: "KINETIC WEAPONS", x: 35, y: 50, category: "Missile Systems" },
    "Communications": { type: "SATCOM", x: 55, y: 45, category: "Communications" },
    "DRIVE AI": { type: "UNMANNED SYSTEMS", x: 60, y: 60, category: "Autonomous Systems" },
    "TRACK AI": { type: "COMMAND & CONTROL", x: 45, y: 60, category: "Control Systems" }
  },
  "Saildrone": {
    "Sensor Suite": { type: "EO/IR SENSORS", x: 50, y: 20, category: "Sensors" },
    "Communications": { type: "SATCOM", x: 50, y: 35, category: "Communications" },
    "Navigation": { type: "NAVIGATION", x: 45, y: 45, category: "Navigation" },
    "AI Control": { type: "UNMANNED SYSTEMS", x: 55, y: 50, category: "Autonomous Systems" }
  },
  "Virginia": {
    "Drone Bay 1": { type: "DRONE_STACK", x: 25, y: 35, category: "Autonomous Systems" },
    "Drone Bay 2": { type: "DRONE_STACK", x: 25, y: 50, category: "Autonomous Systems" },
    "Drone Bay 3": { type: "DRONE_STACK", x: 25, y: 65, category: "Autonomous Systems" },
    "Launch Tube 1": { type: "DRONE_STACK", x: 15, y: 40, category: "Launch Systems" },
    "Launch Tube 2": { type: "DRONE_STACK", x: 15, y: 55, category: "Launch Systems" },
    "Mission Control": { type: "COMMAND & CONTROL", x: 50, y: 45, category: "Control Systems" },
    "Communications": { type: "RF COMMUNICATIONS", x: 60, y: 50, category: "Communications" },
    "Bow Sonar": { type: "ACOUSTIC/SONAR", x: 20, y: 50, category: "Sonar Systems" },
    "Towed Array": { type: "ACOUSTIC/SONAR", x: 80, y: 50, category: "Sonar Systems" },
    "Torpedo Tubes": { type: "KINETIC WEAPONS", x: 25, y: 45, category: "Weapons" },
    "Periscope Sensors": { type: "EO/IR SENSORS", x: 60, y: 30, category: "Sensors" },
    "Underwater Comms": { type: "UNDERWATER COMMS", x: 50, y: 40, category: "Communications" },
    "Navigation": { type: "NAVIGATION", x: 50, y: 35, category: "Navigation Systems" }
  },
  "Custom Platform": {
    "Forward Sensor": { type: "EO/IR SENSORS", x: 30, y: 30, category: "Sensors" },
    "Primary Camera": { type: "EO/IR SENSORS", x: 50, y: 25, category: "Sensors" },
    "GPS Module": { type: "NAVIGATION", x: 60, y: 30, category: "Navigation" },
    "Communications Array": { type: "RF COMMUNICATIONS", x: 50, y: 35, category: "Communications" },
    "Flight Controller": { type: "COMMAND & CONTROL", x: 50, y: 50, category: "Control Systems" },
    "Power System": { type: "NAVIGATION", x: 40, y: 45, category: "Power" },
    "Motor Mount 1": { type: "UNMANNED SYSTEMS", x: 25, y: 60, category: "Propulsion" },
    "Motor Mount 2": { type: "UNMANNED SYSTEMS", x: 75, y: 60, category: "Propulsion" },
    "Payload Bay": { type: "EO/IR SENSORS", x: 50, y: 65, category: "Payload" },
    "Landing Gear": { type: "UNMANNED SYSTEMS", x: 50, y: 75, category: "Landing Systems" }
  }
};

/**
 * Slot capacity per vessel type for the Loadout Builder.
 * Defines how many slots of each category a vessel can support.
 * Categories: SENSORS, COMMS, WEAPONS, C2, NAV, AI, UTILITY, OTHER
 * Note: EW (Electronic Warfare) merged into SENSORS. C2 Systems is new.
 */
export const VESSEL_SLOT_CAPACITY = {
  // Small USVs — EW merged into SENSORS, C2 slot added
  "M48": { SENSORS: 6, COMMS: 4, WEAPONS: 4, C2: 3, NAV: 2, AI: 4, UTILITY: 6, OTHER: 0 },
  "M68": { SENSORS: 8, COMMS: 5, WEAPONS: 6, C2: 4, NAV: 3, AI: 5, UTILITY: 8, OTHER: 0 },
  "HSM-USV": { SENSORS: 6, COMMS: 4, WEAPONS: 4, C2: 3, NAV: 2, AI: 4, UTILITY: 6, OTHER: 0 },
  "H48": { SENSORS: 6, COMMS: 4, WEAPONS: 4, C2: 3, NAV: 2, AI: 4, UTILITY: 6, OTHER: 0 },
  "Saildrone": { SENSORS: 3, COMMS: 2, WEAPONS: 0, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  "SubSeaSail": { SENSORS: 1, COMMS: 1, WEAPONS: 0, C2: 1, NAV: 1, AI: 1, UTILITY: 0, OTHER: 0 },
  "SubSeaSail Horus": { SENSORS: 1, COMMS: 1, WEAPONS: 0, C2: 1, NAV: 1, AI: 1, UTILITY: 0, OTHER: 0 },
  "Otter X": { SENSORS: 2, COMMS: 1, WEAPONS: 0, C2: 1, NAV: 1, AI: 1, UTILITY: 1, OTHER: 0 },
  "Mariner": { SENSORS: 3, COMMS: 2, WEAPONS: 1, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  // SNC AEGIR Family
  "AEGIR-F": { SENSORS: 1, COMMS: 1, WEAPONS: 1, C2: 1, NAV: 1, AI: 1, UTILITY: 0, OTHER: 0 },
  "AEGIR-W": { SENSORS: 4, COMMS: 2, WEAPONS: 2, C2: 1, NAV: 1, AI: 2, UTILITY: 2, OTHER: 0 },
  "AEGIR-H": { SENSORS: 5, COMMS: 3, WEAPONS: 2, C2: 2, NAV: 2, AI: 3, UTILITY: 3, OTHER: 0 },
  // Medium USVs
  "ZeroUSV Oceanus17": { SENSORS: 4, COMMS: 2, WEAPONS: 1, C2: 1, NAV: 2, AI: 2, UTILITY: 3, OTHER: 0 },
  "MASC": { SENSORS: 5, COMMS: 3, WEAPONS: 2, C2: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 },
  // AUSV
  "Triton": { SENSORS: 3, COMMS: 2, WEAPONS: 0, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  // Large UUV
  "Manta Ray": { SENSORS: 5, COMMS: 2, WEAPONS: 1, C2: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 },
  // UAV platforms
  "MQ-25 Stingray": { SENSORS: 2, COMMS: 2, WEAPONS: 0, C2: 1, NAV: 1, AI: 2, UTILITY: 2, OTHER: 0 },
  "MQ-9 Reaper": { SENSORS: 5, COMMS: 2, WEAPONS: 2, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  "MQ-4C Triton": { SENSORS: 7, COMMS: 3, WEAPONS: 0, C2: 2, NAV: 2, AI: 3, UTILITY: 1, OTHER: 0 },
  "MQ-8C Fire Scout": { SENSORS: 3, COMMS: 2, WEAPONS: 1, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  "RQ-21A Blackjack": { SENSORS: 1, COMMS: 1, WEAPONS: 0, C2: 1, NAV: 1, AI: 1, UTILITY: 0, OTHER: 0 },
  // Crewed vessels
  "Arleigh Burke": { SENSORS: 8, COMMS: 4, WEAPONS: 6, C2: 3, NAV: 2, AI: 4, UTILITY: 3, OTHER: 0 },
  "Virginia Class": { SENSORS: 6, COMMS: 3, WEAPONS: 4, C2: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 },
  // Fallback
  "Custom Platform": { SENSORS: 5, COMMS: 2, WEAPONS: 2, C2: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 }
};

/** Default slot capacity for vessels not in VESSEL_SLOT_CAPACITY */
export const DEFAULT_SLOT_CAPACITY = {
  SENSORS: 3, COMMS: 2, WEAPONS: 1, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0
};

/** All loadout category keys */
export const LOADOUT_CATEGORY_KEYS = ['SENSORS', 'COMMS', 'WEAPONS', 'C2', 'NAV', 'AI', 'UTILITY', 'OTHER'];