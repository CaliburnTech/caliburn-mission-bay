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
  // ============ SMALL USV CATEGORY ============
  {
    name: "MetalShark",
    type: "Small USV",
    platformType: "USV",
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
    platformType: "USV",
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
  {
    name: "Otter X",
    type: "Small USV",
    platformType: "USV",
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
    platformType: "USV",
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
  {
    name: "AEGIR-F",
    type: "Small USV (Kinetic)",
    platformType: "USV",
    displacement: "< 0.5 tons",
    description: "SNC stealth USV designed for single-use kinetic missions in the final operational mile. Electric propulsion for quiet operation.",
    icon: "AEGIR-F",
    manufacturer: "Sierra Nevada Corporation",
    specs: {
      speed: 7,         // knots (electric)
      range: 50,        // nm (single-use mission profile)
      rcs: 0.3          // m² (stealth optimized)
    },
    capacity: {
      totalWeight: 50,    // kg payload (warhead/sensor)
      totalPower: 2       // kW (electric drive)
    },
    detailedSpecs: {
      length: "< 7 ft (2.1m)",
      propulsion: "Electric",
      role: "Kinetic strike, final mile delivery",
      stealth: "Optimized for low signature approach"
    },
    features: [
      "Stealth-optimized hull design",
      "Electric propulsion for quiet operation",
      "Single-use kinetic mission capability",
      "Autonomous terminal guidance",
      "Digital Grid™ integration"
    ],
    applications: [
      "Anti-ship kinetic strike",
      "Harbor denial operations",
      "Final mile payload delivery",
      "Swarm attack coordination"
    ],
    externalLinks: {
      manufacturer: "https://www.sncorp.com",
      specSheet: "https://www.sncorp.com/capabilities/aegir-autonomous-usv/"
    }
  },
  // ============ MEDIUM USV CATEGORY ============
  {
    name: "ZeroUSV Oceanus17",
    type: "Medium USV",
    platformType: "USV",
    displacement: "~17.7 tons",
    description: "ZeroUSV 17-meter electric autonomous surface vehicle designed for extended endurance maritime operations. Twin 40kW electric stern drives with 50+ day endurance for persistent surveillance and ASW missions.",
    icon: "ZeroUSV Oceanus17",
    manufacturer: "ZeroUSV",
    specs: {
      speed: 12,        // knots sprint (7kt cruise)
      range: 2000,      // nm (50+ days at cruise)
      rcs: 8            // m² (medium signature)
    },
    capacity: {
      totalWeight: 2000,  // kg payload capacity
      totalPower: 80      // kW available for payloads
    },
    detailedSpecs: {
      length: "17m (55.8 ft)",
      displacement: "17.7 tonnes",
      propulsion: "Twin 40kW electric stern drives",
      cruiseSpeed: "7 knots",
      sprintSpeed: "12 knots",
      endurance: "50+ days",
      seaState: "Sea State 4 operations",
      autonomy: "Level 4 autonomous operations",
      certifications: "DNV-GL certification pending"
    },
    features: [
      "50+ day autonomous endurance",
      "Electric propulsion for quiet operations",
      "Sea State 4 capable",
      "Modular payload bay integration",
      "Teledyne Webb Glider deployment capability",
      "Sonobuoy launcher integration",
      "Thin-line towed array compatible",
      "MBES bathymetric survey ready"
    ],
    applications: [
      "Persistent maritime surveillance",
      "Anti-submarine warfare support",
      "Oceanographic survey",
      "Bathymetric mapping",
      "Underwater glider deployment",
      "ISR operations"
    ],
    externalLinks: {
      manufacturer: "https://zerousv.com"
    }
  },
  {
    name: "AEGIR-W",
    type: "Medium USV",
    platformType: "USV",
    displacement: "~5 tons",
    description: "SNC long-endurance combat USV for maritime defense operations. Supports autonomous or human-controlled missions with Digital Grid™ integration.",
    icon: "AEGIR-W",
    manufacturer: "Sierra Nevada Corporation",
    specs: {
      speed: 25,        // knots (estimated based on class)
      range: 500,       // nm (long endurance)
      rcs: 5            // m² (combat vessel)
    },
    capacity: {
      totalWeight: 1000,  // kg payload
      totalPower: 50      // kW
    },
    detailedSpecs: {
      endurance: "Long-endurance operations",
      control: "Fully autonomous or human-operated",
      integration: "SNC Digital Grid™",
      role: "Maritime defense and combat"
    },
    features: [
      "Long-endurance patrol capability",
      "Modular payload integration",
      "Advanced sensor suite",
      "Electronic countermeasures support",
      "Real-time allied force connectivity"
    ],
    applications: [
      "Maritime defense patrols",
      "Combat operations",
      "ISR missions",
      "Electronic warfare"
    ],
    externalLinks: {
      manufacturer: "https://www.sncorp.com",
      specSheet: "https://www.sncorp.com/capabilities/aegir-autonomous-usv/"
    }
  },
  {
    name: "MASC",
    type: "Medium USV",
    platformType: "USV",
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
  {
    name: "AEGIR-H",
    type: "Large USV",
    platformType: "USV",
    displacement: "~15 tons",
    description: "SNC 49-foot multi-role, multi-use platform with dual payload bays for diverse mission integration. Supports ISR, EW, offensive operations, and autonomous resupply.",
    icon: "AEGIR-H",
    manufacturer: "Sierra Nevada Corporation",
    specs: {
      speed: 30,        // knots (high-speed maneuvering)
      range: 800,       // nm (long-range missions)
      rcs: 8            // m² (medium signature)
    },
    capacity: {
      totalWeight: 3000,  // kg (dual payload bays)
      totalPower: 150     // kW
    },
    detailedSpecs: {
      length: "49 ft (14.9m)",
      payloadBays: "Dual payload bays",
      control: "Fully autonomous or human-operated",
      integration: "SNC Digital Grid™",
      role: "Multi-role reconnaissance and delivery"
    },
    features: [
      "49-foot multi-role platform",
      "Dual payload bays for diverse integration",
      "High-speed maneuverability",
      "Exceptional payload capacity",
      "Unparalleled modularity",
      "Advanced sensors and ECM support",
      "Digital Grid™ real-time connectivity"
    ],
    applications: [
      "ISR missions",
      "Electronic warfare",
      "Offensive operations",
      "Autonomous resupply",
      "Loitering munition deployment",
      "Long-range reconnaissance"
    ],
    externalLinks: {
      manufacturer: "https://www.sncorp.com",
      specSheet: "https://www.sncorp.com/capabilities/aegir-autonomous-usv/"
    }
  },
  // ============ AUSV (Autonomous Underwater/Surface Vehicle) ============
  {
    name: "Triton",
    type: "AUSV (Surface/Subsurface)",
    platformType: "USV/UUV",
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
    platformType: "UUV",
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
  // ============ UAV CATEGORY ============
  {
    name: "MQ-25 Stingray",
    type: "Carrier-Based UAV",
    platformType: "UAV",
    displacement: "~20,000 lbs MTOW",
    description: "Boeing carrier-based unmanned aerial refueling drone. First operational carrier-based UAV for the U.S. Navy, extending Super Hornet combat range.",
    icon: "MQ-25 Stingray",
    manufacturer: "Boeing",
    specs: {
      speed: 335,       // knots max
      range: 500,       // nm operational refueling range (2500 nm ferry)
      rcs: 0.5          // m² - stealth optimized
    },
    capacity: {
      totalWeight: 6800,  // kg fuel offload capacity
      totalPower: 50      // kW available for systems
    },
    // Aerial-specific specs
    aerialSpecs: {
      endurance: 14,      // hours
      missionRadius: 500, // nm (refueling radius)
      ceiling: 40000,     // ft
      datalinkTier: 3,    // Advanced (carrier integration)
      burnRateType: 'Tanker'
    },
    detailedSpecs: {
      length: "51 ft (15.5m)",
      wingspan: "75 ft (22.9m) / 31.2 ft folded",
      engine: "Rolls-Royce AE 3007N turbofan",
      thrust: "10,000 lbf",
      fuelCapacity: "15,000 lbs transferable",
      serviceCeiling: "40,000 ft"
    },
    features: [
      "Carrier deck operations (arrestor hook, folding wings)",
      "V-tail configuration for reduced RCS",
      "Flush inlet stealth design",
      "Extends F/A-18 combat radius from 450 to 700+ nmi",
      "Advanced composite airframe"
    ],
    applications: [
      "Carrier strike group aerial refueling",
      "Extended strike mission support",
      "ISR (secondary capability)"
    ],
    externalLinks: {
      manufacturer: "https://www.boeing.com/defense/mq25"
    }
  },
  {
    name: "MQ-9 Reaper",
    type: "Hunter-Killer UAV",
    platformType: "UAV",
    displacement: "~10,500 lbs MTOW",
    description: "General Atomics medium-altitude long-endurance (MALE) UAV for persistent ISR and precision strike missions.",
    icon: "MQ-9 Reaper",
    manufacturer: "General Atomics",
    specs: {
      speed: 260,       // knots max
      range: 1000,      // nm combat radius
      rcs: 1.0          // m² estimated
    },
    capacity: {
      totalWeight: 1724,  // kg external payload
      totalPower: 75      // kW available
    },
    // Aerial-specific specs
    aerialSpecs: {
      endurance: 27,       // hours (34 with ER variant)
      missionRadius: 1000, // nm combat radius
      ceiling: 50000,      // ft
      datalinkTier: 3,     // Advanced (SATCOM, anti-jam)
      burnRateType: 'MALE'
    },
    detailedSpecs: {
      length: "36 ft (11m)",
      wingspan: "66 ft (20m) / 79 ft extended range",
      engine: "Honeywell TPE331-10GD turboprop",
      power: "950 hp",
      endurance: "27 hours (40+ extended range)",
      serviceCeiling: "50,000 ft",
      hardpoints: "7 (1500 lbs inboard, 600 lbs middle, 200 lbs outboard)"
    },
    features: [
      "Multi-mission ISR and strike",
      "MTS-B EO/IR targeting system",
      "Lynx SAR radar",
      "Automatic takeoff and landing",
      "Satellite datalink"
    ],
    applications: [
      "Persistent surveillance",
      "Close air support",
      "Precision strike",
      "Combat search and rescue support"
    ],
    externalLinks: {
      manufacturer: "https://www.ga-asi.com/remotely-piloted-aircraft/mq-9a"
    }
  },
  {
    name: "MQ-4C Triton",
    type: "HALE Maritime ISR",
    platformType: "UAV",
    displacement: "~32,250 lbs MTOW",
    description: "Northrop Grumman high-altitude long-endurance maritime surveillance UAV. Complements P-8A Poseidon for persistent maritime domain awareness.",
    icon: "MQ-4C Triton",
    manufacturer: "Northrop Grumman",
    specs: {
      speed: 310,       // knots max
      range: 7400,      // nm (8000+ with mission profile)
      rcs: 0.8          // m² estimated
    },
    capacity: {
      totalWeight: 1452,  // kg sensor payload
      totalPower: 100     // kW available
    },
    // Aerial-specific specs
    aerialSpecs: {
      endurance: 30,       // hours
      missionRadius: 2000, // nm station radius
      ceiling: 56000,      // ft
      datalinkTier: 4,     // Resilient (full spectrum, SIGINT)
      burnRateType: 'HALE'
    },
    detailedSpecs: {
      length: "47.6 ft (14.5m)",
      wingspan: "130.9 ft (39.9m)",
      engine: "Rolls-Royce AE 3007H turbofan",
      thrust: "9,660 lbf",
      endurance: "24+ hours",
      serviceCeiling: "56,000 ft"
    },
    features: [
      "360° multi-INT sensor coverage",
      "AN/ZPY-3 MFAS radar",
      "EO/IR sensor suite",
      "SIGINT capability",
      "De-icing for sustained high-altitude ops",
      "AIS receiver"
    ],
    applications: [
      "Maritime surveillance",
      "Signals intelligence",
      "Search and rescue support",
      "Port and coastal monitoring"
    ],
    externalLinks: {
      manufacturer: "https://www.northropgrumman.com/what-we-do/aircraft/triton"
    }
  },
  {
    name: "MQ-8C Fire Scout",
    type: "Shipborne VTOL UAV",
    platformType: "UAV",
    displacement: "~6,000 lbs MTOW",
    description: "Northrop Grumman autonomous helicopter for shipborne ISR operations. Based on Bell 407 airframe, operates from LCS and other surface combatants.",
    icon: "MQ-8C Fire Scout",
    manufacturer: "Northrop Grumman",
    specs: {
      speed: 115,       // knots max
      range: 150,       // nm combat radius
      rcs: 2.0          // m² - helicopter profile
    },
    capacity: {
      totalWeight: 318,   // kg payload
      totalPower: 25      // kW available
    },
    // Aerial-specific specs
    aerialSpecs: {
      endurance: 12,      // hours
      missionRadius: 150, // nm
      ceiling: 20000,     // ft
      datalinkTier: 3,    // Advanced (Link 16, ship integration)
      burnRateType: 'VTOL'
    },
    detailedSpecs: {
      length: "41.4 ft (12.6m)",
      rotorDiameter: "35 ft (10.7m)",
      engine: "Rolls-Royce 250-C47E turboshaft",
      power: "650 shp",
      endurance: "12 hours",
      serviceCeiling: "20,000 ft",
      hardpoints: "2"
    },
    features: [
      "Autonomous shipboard takeoff/landing",
      "AN/ZPY-4(V)1 AESA radar",
      "Brite Star II EO/IR",
      "Link 16 datalink",
      "Laser target designator"
    ],
    applications: [
      "Surface vessel ISR",
      "Target acquisition",
      "Mine detection",
      "ASW support",
      "Communications relay"
    ],
    externalLinks: {
      manufacturer: "https://www.northropgrumman.com/what-we-do/aircraft/fire-scout"
    }
  },
  {
    name: "RQ-21A Blackjack",
    type: "Small Tactical UAS",
    platformType: "UAV",
    displacement: "~135 lbs MTOW",
    description: "Boeing/Insitu small tactical UAS for reconnaissance, surveillance, and target acquisition. Ship and expeditionary-capable with pneumatic launch and SkyHook recovery.",
    icon: "RQ-21A Blackjack",
    manufacturer: "Boeing/Insitu",
    specs: {
      speed: 55,        // knots cruise
      range: 50,        // nm LOS radius
      rcs: 0.1          // m² - small profile
    },
    capacity: {
      totalWeight: 18,    // kg payload (39 lbs)
      totalPower: 5       // kW available
    },
    // Aerial-specific specs
    aerialSpecs: {
      endurance: 12,      // hours (can exceed 16)
      missionRadius: 50,  // nm with LOS datalink
      ceiling: 20000,     // ft
      datalinkTier: 2,    // Standard (LOS + basic SATCOM)
      burnRateType: 'Small UAS'
    },
    detailedSpecs: {
      length: "8.2 ft (2.5m)",
      wingspan: "16 ft (4.9m)",
      engine: "Heavy fuel engine",
      power: "8 hp",
      endurance: "12-16 hours",
      serviceCeiling: "20,000 ft",
      launch: "Pneumatic SuperWedge launcher",
      recovery: "SkyHook retrieval system"
    },
    features: [
      "Ship and shore-based operations",
      "Pneumatic launch - no runway required",
      "SkyHook recovery system",
      "Modular payload bay",
      "Encrypted datalink beyond 50 nm",
      "Heavy fuel capable"
    ],
    applications: [
      "Tactical reconnaissance",
      "Surveillance and target acquisition",
      "Battle damage assessment",
      "Communications relay",
      "Route clearance support"
    ],
    externalLinks: {
      manufacturer: "https://www.insitu.com/products/rq21a"
    }
  },
  // ============ CREWED VESSELS ============
  {
    name: "Arleigh Burke",
    type: "Guided Missile Destroyer (DDG)",
    platformType: "Ship",
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
    platformType: "Submarine",
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
  },
  {
    name: "GARC",
    type: "Research Vessel",
    platformType: "Ship",
    displacement: "Unknown",
    description: "Global Autonomous Research Craft - advanced research platform",
    icon: "GARC",
    specs: {
      speed: 15,
      range: 5000,
      rcs: 50
    },
    capacity: {
      totalWeight: 50000,
      totalPower: 1000
    }
  }
];

export const vesselHullComponents = {
  // Small USV category
  "MetalShark": MetalSharkHull,
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

/**
 * Slot capacity per vessel type for the Loadout Builder.
 * Defines how many slots of each category a vessel can support.
 * Categories: SENSORS, COMMS, WEAPONS, C2, NAV, AI, UTILITY, OTHER
 * Note: EW (Electronic Warfare) merged into SENSORS. C2 Systems is new.
 */
export const VESSEL_SLOT_CAPACITY = {
  // Small USVs — EW merged into SENSORS, C2 slot added
  "MetalShark": { SENSORS: 3, COMMS: 2, WEAPONS: 1, C2: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
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