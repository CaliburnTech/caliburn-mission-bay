// Vessel data and mappings - separated from components for fast refresh compatibility
import {
  USVPatrolHull,
  FreedomLCSHull,
  TiconderogaHull,
  ArleighBurkeHull,
  MediumUSVHull,
  SmallUSVHull,
  SubmarineHull,
  MetalSharkHull,
  SailboatHull,
  UUVHull,
  StealthHull,
  CustomPlatformHull,
  MantaRayHull,
  TritonAUSVHull
} from '../components/VesselHulls';

// Global baselines for autonomous maritime vessels (used for bar graph positioning)
// These represent "typical" values - bar midpoint = baseline
export const globalBaselines = {
  speed: {
    unit: 'kts',
    baseline: 15,       // Typical autonomous boat speed
    min: 0,
    max: 50,            // High-performance vessels
    criticalLow: 3,     // Below this is nearly unusable
  },
  range: {
    unit: 'nm',
    baseline: 200,      // Typical operational range
    min: 0,
    max: 1000,          // Extended range vessels
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

// Vessel data array for outfitter view - organized by category
export const vesselHullData = [
  // ============ SMALL USV CATEGORY ============
  {
    name: "MetalShark",
    type: "Small USV",
    displacement: "< 5 tons",
    description: "High-speed autonomous patrol boat for coastal and riverine operations",
    icon: "MetalShark",
    // Real performance specs
    specs: {
      speed: 45,        // knots max
      range: 150,       // nautical miles
      rcs: 3            // m² radar cross section
    },
    capacity: {
      totalWeight: 500,   // kg payload capacity
      totalPower: 15      // kW available power
    }
  },
  {
    name: "Saildrone",
    type: "Small USV",
    displacement: "< 2 tons",
    description: "Wind and solar powered autonomous surface vehicle for long-duration ISR missions",
    icon: "Saildrone",
    specs: {
      speed: 5,         // knots (wind powered)
      range: 5000,      // nm (essentially unlimited with wind/solar)
      rcs: 2            // m² (sailboat profile)
    },
    capacity: {
      totalWeight: 200,
      totalPower: 8
    }
  },
  {
    name: "SubSeaSail",
    type: "Small UUV",
    displacement: "< 1 ton",
    description: "Autonomous underwater glider for persistent subsurface surveillance",
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
  {
    name: "Otter X",
    type: "Small USV",
    displacement: "< 1 ton",
    description: "Maritime Robotics compact catamaran USV for hydrographic survey and reconnaissance",
    icon: "Otter X",
    specs: {
      speed: 6,         // knots
      range: 80,        // nm
      rcs: 0.5          // m² (very small)
    },
    capacity: {
      totalWeight: 100,
      totalPower: 5
    }
  },
  {
    name: "Mariner",
    type: "Small USV",
    displacement: "< 3 tons",
    description: "Maritime Robotics multi-mission USV for patrol, survey, and autonomous operations",
    icon: "Mariner",
    specs: {
      speed: 12,        // knots
      range: 120,       // nm
      rcs: 1.5          // m²
    },
    capacity: {
      totalWeight: 300,
      totalPower: 12
    }
  },
  // ============ MEDIUM USV CATEGORY ============
  {
    name: "MASC",
    type: "Medium USV",
    displacement: "~50 tons",
    description: "Medium Autonomous Surface Craft for extended range autonomous missions",
    icon: "MASC",
    specs: {
      speed: 25,        // knots
      range: 500,       // nm
      rcs: 15           // m² (medium vessel)
    },
    capacity: {
      totalWeight: 5000,
      totalPower: 100
    }
  },
  // ============ AUSV (Autonomous Underwater/Surface Vehicle) ============
  {
    name: "Triton",
    type: "AUSV (Surface/Subsurface)",
    displacement: "~1.5 tons",
    description: "Ocean Aero autonomous underwater and surface vehicle. Wind and solar powered for unlimited range. Can dive to evade detection.",
    icon: "Triton",
    manufacturer: "Ocean Aero",
    specs: {
      speed: 5,         // knots surface (wind powered)
      range: 10000,     // nm (unlimited with wind/solar)
      rcs: 0.1          // m² (can submerge, stealth design)
    },
    capacity: {
      totalWeight: 400,
      totalPower: 10
    },
    detailedSpecs: {
      length: "22 ft (6.7m)",
      weight: "3,000 lbs (1,360 kg)",
      surfaceSpeed: "Up to 5 knots",
      diveSpeed: "2 knots",
      endurance: "30+ days autonomous sailing",
      submergence: "5+ days submerged",
      radarSignature: "Disappears at 1/4 mile",
      visualSignature: "100m detection range",
      power: "Wind sail + Solar arrays",
      comms: "Iridium, WiFi, 900MHz, Mesh",
      launchRecovery: "1-2 people, single-point davit or shore ramp"
    },
    features: [
      "100% wind and solar powered - no fuel required",
      "Autonomous deep dive evasion capability",
      "Stealth profile - minimal radar/visual signature",
      "Above and below surface data collection",
      "Payload agnostic - supports custom sensors",
      "100% USA manufactured"
    ],
    applications: [
      "Defense - persistent ISR, anti-submarine warfare",
      "Research - oceanographic, water chemistry, animal tracking",
      "Energy - offshore monitoring, predictive algorithms",
      "Weather observation and seabed mapping"
    ],
    externalLinks: {
      manufacturer: "https://www.oceanaero.com",
      specSheet: "https://www.oceanaero.com/the-triton"
    }
  },
  // ============ LARGE/XLUUV CATEGORY ============
  {
    name: "Manta Ray",
    type: "Extra-Large UUV (XLUUV)",
    displacement: "Classified",
    description: "Northrop Grumman autonomous glider UUV for long-duration, long-range undersea missions with energy harvesting",
    icon: "Manta Ray",
    specs: {
      speed: 4,         // knots (glider)
      range: 6000,      // nm (energy harvesting)
      rcs: 0.05         // m² (underwater, stealth design)
    },
    capacity: {
      totalWeight: 10000,
      totalPower: 200
    }
  },
  // ============ CREWED VESSELS ============
  {
    name: "Arleigh Burke",
    type: "Guided Missile Destroyer (DDG)",
    displacement: "9,200 tons",
    description: "Advanced destroyer with Aegis combat system and SPY-1 radar",
    icon: "Arleigh Burke",
    specs: {
      speed: 31,        // knots
      range: 4400,      // nm at 20 knots
      rcs: 1000         // m² (large warship, reduced signature design)
    },
    capacity: {
      totalWeight: 500000,
      totalPower: 5000
    }
  },
  {
    name: "Virginia Class",
    type: "Nuclear Attack Submarine",
    displacement: "7,800 tons",
    description: "Fast attack submarine for deep water operations",
    icon: "Virginia Class",
    specs: {
      speed: 25,        // knots submerged
      range: 100000,    // nm (nuclear = essentially unlimited)
      rcs: 0.001        // m² (underwater, stealth optimized)
    },
    capacity: {
      totalWeight: 100000,
      totalPower: 3000
    }
  }
];

export const vesselHullComponents = {
  // Small USV category
  "MetalShark": MetalSharkHull,
  "Saildrone": SailboatHull,
  "SubSeaSail": UUVHull,
  "Otter X": SmallUSVHull,
  "Mariner": SmallUSVHull,
  // Medium USV category
  "MASC": MediumUSVHull,
  // AUSV category
  "Triton": TritonAUSVHull,
  // Large/XLUUV category
  "Manta Ray": MantaRayHull,
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
  "GARC": StealthHull,
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
  "MetalShark": {
    "Bow Mount": { type: "KINETIC WEAPONS", x: 20, y: 30, category: "Weapons" },
    "Sensor Array": { type: "EO/IR SENSORS", x: 50, y: 25, category: "Sensors" },
    "Communications": { type: "RF COMMUNICATIONS", x: 50, y: 40, category: "Communications" },
    "Navigation AI": { type: "UNMANNED SYSTEMS", x: 60, y: 35, category: "Autonomous Systems" },
    "EW Pod": { type: "ELECTRONIC SUPPORT", x: 70, y: 45, category: "Electronic Warfare" }
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