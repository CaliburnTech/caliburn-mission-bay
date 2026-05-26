// Fleet and squadron data constants

// Helper to generate unique IDs
let squadronIdCounter = 100;
export const generateSquadronId = () => `sqdn_${++squadronIdCounter}`;

// Domain classification helpers for squadrons
export const getSquadronDomain = (squadron) => {
  if (!squadron) return null;
  const pt = squadron.platformType;
  if (pt === 'UAV') return 'AERIAL';
  if (pt === 'USV' || pt === 'UUV') return 'MARITIME';
  // Fallback: check type string
  const type = squadron.type?.toLowerCase() || '';
  if (type.includes('uav') || type.includes('drone') || type.includes('aerial')) return 'AERIAL';
  return 'MARITIME';
};

export const isAerialSquadron = (squadron) => getSquadronDomain(squadron) === 'AERIAL';
export const isMaritimeSquadron = (squadron) => getSquadronDomain(squadron) === 'MARITIME';

export const swarmSquadrons = [
  {
    id: "sqdn_magnet_001",
    name: "Magnet Defense M48",
    type: "Autonomous MUSV",
    platformType: "USV",
    totalUnits: 3,
    status: {
      missionReady: 2,
      deployed: 1,
      charging: 0,
      maintenance: 0,
      antxReserved: 0
    },
    icon: "MagnetDefense",
    description: "AI-powered large autonomous USV with 17,000nm range. DriveAI navigation, modular mission payloads, 390+ days at sea validated. Built on Metal Shark hulls.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_001",
    name: "MetalShark Patrol Drones",
    type: "High-Speed USV",
    platformType: "USV",
    totalUnits: 280,
    status: {
      missionReady: 247,
      charging: 18,
      deployed: 12,
      maintenance: 3
    },
    icon: "MetalShark",
    description: "High-speed autonomous patrol vessel swarm for coastal defense and reconnaissance",
    // Variation fields
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_002",
    name: "Saildrone Surveyor Fleet",
    type: "Wind-Powered USV",
    platformType: "USV",
    totalUnits: 117,
    status: {
      missionReady: 89,
      inRefit: 5,
      atSea: 23
    },
    icon: "Saildrone Surveyor",
    description: "Autonomous sailing vessel swarm for long-endurance ocean monitoring",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_003",
    name: "MQ-9 Reaper Drone Wing",
    type: "Hunter-Killer UAV",
    platformType: "UAV",
    totalUnits: 168,
    status: {
      missionReady: 156,
      deployed: 8,
      maintenance: 4
    },
    icon: "MQ-9 Reaper",
    description: "General Atomics medium-altitude long-endurance UAV for persistent ISR and precision strike missions",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_004",
    name: "SubSeaSail Horus",
    type: "Autonomous AUSV",
    platformType: "USV",
    totalUnits: 45,
    status: {
      missionReady: 37,
      deployed: 4,
      charging: 2,
      maintenance: 1,
      antxReserved: 1
    },
    icon: "SubSeaSail",
    description: "SubSeaSail HORUS autonomous undersea and surface vehicles. 100% energy harvesting, ultra-low-signature AUSV capable of submersion. ANTX Coastal Trident 2026 participant.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_005",
    name: "Switchblade Loitering Munition Arsenal",
    type: "Tactical UAV",
    platformType: "UAV",
    totalUnits: 892,
    status: {
      missionReady: 856,
      deployed: 24,
      maintenance: 12
    },
    icon: "Switchblade",
    description: "Precision strike loitering munition swarm for tactical engagement",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_006",
    name: "Black Widow Micro-Drone Swarm",
    type: "Micro UAV",
    platformType: "UAV",
    totalUnits: 1247,
    status: {
      missionReady: 1198,
      charging: 32,
      deployed: 15,
      maintenance: 2
    },
    icon: "Black Widow",
    description: "Ultra-small reconnaissance drone swarm for urban and confined operations",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_007",
    name: "GARC",
    type: "Research Vessel",
    platformType: "USV",
    totalUnits: 1,
    status: {
      missionReady: 1,
      deployed: 0,
      charging: 0,
      maintenance: 0
    },
    icon: "GARC",
    description: "Global Autonomous Research Craft",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_008",
    name: "AEGIR-F Kinetic Strike Swarm",
    type: "Kinetic USV",
    platformType: "USV",
    totalUnits: 48,
    status: {
      missionReady: 42,
      deployed: 0,
      charging: 4,
      maintenance: 2
    },
    icon: "AEGIR-F",
    description: "SNC stealth kinetic USVs for final-mile strike missions. Electric propulsion, single-use capability.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_009",
    name: "AEGIR-W Combat Squadron",
    type: "Combat USV",
    platformType: "USV",
    totalUnits: 24,
    status: {
      missionReady: 18,
      deployed: 4,
      charging: 1,
      maintenance: 1
    },
    icon: "AEGIR-W",
    description: "SNC long-endurance combat USVs for maritime defense and patrol operations with Digital Grid integration.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_010",
    name: "AEGIR-H Multi-Role Flotilla",
    type: "Multi-Role USV",
    platformType: "USV",
    totalUnits: 8,
    status: {
      missionReady: 5,
      deployed: 2,
      charging: 0,
      maintenance: 1
    },
    icon: "AEGIR-H",
    description: "SNC 49-foot multi-role platforms with dual payload bays. Supports ISR, EW, strike, and autonomous resupply.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_016",
    name: "Magnet Defense M48 Strike Fleet",
    type: "Large Uncrewed Surface Vessel (LUSV)",
    platformType: "USV",
    totalUnits: 6,
    status: {
      missionReady: 4,
      deployed: 1,
      charging: 0,
      maintenance: 1
    },
    icon: "M48",
    description: "Magnet Defense 48m autonomous catamaran LUSVs. 17,000 nm range, 100-ton payload capacity. First delivery Q2 2027.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_017",
    name: "Saildrone Voyager Coastal Squadron",
    type: "Coastal ISR USV",
    platformType: "USV",
    totalUnits: 18,
    status: {
      missionReady: 14,
      deployed: 3,
      charging: 0,
      maintenance: 1
    },
    icon: "Saildrone Voyager",
    description: "Saildrone 10m electric USVs for coastal ISR and nearshore seafloor mapping. Starlink-connected, 100-day endurance.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_019",
    name: "Saildrone Spectre Combat Flotilla",
    type: "Large Combat USV",
    platformType: "USV",
    totalUnits: 5,
    status: {
      missionReady: 3,
      deployed: 2,
      charging: 0,
      maintenance: 0
    },
    icon: "Saildrone Spectre",
    description: "Saildrone 52m autonomous combat USVs. Mk 70 VLS capable. Variants: Silent Endurance (ASW) and Stealth Strike.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_020",
    name: "Oceaneering Freedom AUV Pack",
    type: "Large Displacement UUV (LDUUV)",
    platformType: "UUV",
    totalUnits: 3,
    status: {
      missionReady: 2,
      deployed: 1,
      charging: 0,
      maintenance: 0
    },
    icon: "Freedom AUV",
    description: "Oceaneering LDUUV selected by US Navy / DIU. 6,000m depth, 6-month subsea endurance, 6 degrees of freedom.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_021",
    name: "Ocean Aero Triton AUSV Squadron",
    type: "AUSV (Surface/Subsurface)",
    platformType: "USV",
    totalUnits: 12,
    status: {
      missionReady: 9,
      deployed: 2,
      charging: 0,
      maintenance: 1
    },
    icon: "Triton",
    description: "Ocean Aero autonomous undersea and surface vehicles. Wind and solar powered, submersible for threat evasion. Radar cross section disappears at 1/4 mile.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_015",
    name: "ZeroUSV Oceanus17 ASW Flotilla",
    type: "ASW/Survey USV",
    platformType: "USV",
    totalUnits: 4,
    status: {
      missionReady: 2,
      deployed: 2,
      charging: 0,
      maintenance: 0
    },
    icon: "ZeroUSV Oceanus17",
    description: "ZeroUSV 17m electric USVs configured for REPMUS 2026. 50+ day endurance with integrated ASW and survey capabilities including Slocum Glider deployment.",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  // ============ UAV SQUADRONS ============
  {
    id: "sqdn_011",
    name: "MQ-25 Stingray Tanker Wing",
    type: "Carrier-Based Tanker UAV",
    platformType: "UAV",
    totalUnits: 12,
    status: {
      missionReady: 9,
      deployed: 2,
      maintenance: 1
    },
    icon: "MQ-25 Stingray",
    description: "Boeing carrier-based aerial refueling UAVs extending Super Hornet combat range by 300+ nm",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_012",
    name: "MQ-4C Triton HALE Squadron",
    type: "HALE Maritime ISR",
    platformType: "UAV",
    totalUnits: 8,
    status: {
      missionReady: 5,
      deployed: 3,
      maintenance: 0
    },
    icon: "MQ-4C Triton",
    description: "Northrop Grumman high-altitude long-endurance UAVs for persistent maritime domain awareness",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_013",
    name: "MQ-8C Fire Scout Detachment",
    type: "Shipborne VTOL UAV",
    platformType: "UAV",
    totalUnits: 24,
    status: {
      missionReady: 18,
      deployed: 4,
      maintenance: 2
    },
    icon: "MQ-8C Fire Scout",
    description: "Northrop Grumman autonomous helicopters for shipborne ISR and targeting from LCS and frigates",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  },
  {
    id: "sqdn_014",
    name: "RQ-21A Blackjack Flight",
    type: "Small Tactical UAS",
    platformType: "UAV",
    totalUnits: 36,
    status: {
      missionReady: 28,
      deployed: 6,
      maintenance: 2
    },
    icon: "RQ-21A Blackjack",
    description: "Boeing/Insitu small tactical UAS for ship-based reconnaissance and surveillance missions",
    isVariation: false,
    parentId: null,
    parentName: null,
    overrides: {}
  }
];

// Fleet Unit Configurations - Mock data for capability outfits
// Keyed by squadron ID for variation support
export const squadronUnitConfigurations = {
  "sqdn_001": { // MetalShark Patrol Drones
    outfits: [
      {
        name: "Coastal Defense Package",
        count: 87,
        capabilities: ["Hidden Level Radar", "Close-in Defense System", "RF Communications"],
        status: { missionReady: 82, deployed: 3, charging: 2, maintenance: 0 }
      },
      {
        name: "Reconnaissance Package",
        count: 65,
        capabilities: ["EO/IR Sensors", "ESM/SIGINT", "Secure Communications"],
        status: { missionReady: 60, deployed: 5, charging: 0, maintenance: 0 }
      },
      {
        name: "Fast Response Package",
        count: 78,
        capabilities: ["Navigation Radar", "Emergency Beacon", "High-Speed Comms"],
        status: { missionReady: 70, deployed: 2, charging: 6, maintenance: 0 }
      },
      {
        name: "Custom Individual Units",
        count: 50,
        capabilities: ["Various Custom Loadouts"],
        status: { missionReady: 35, deployed: 2, charging: 10, maintenance: 3 }
      }
    ]
  },
  "sqdn_002": { // Saildrone Autonomous Fleet
    outfits: [
      {
        name: "Ocean Monitoring Package",
        count: 45,
        capabilities: ["Environmental Sensors", "Weather Station", "Data Link"],
        status: { missionReady: 42, deployed: 0, charging: 0, maintenance: 3 }
      },
      {
        name: "Long Endurance Package",
        count: 35,
        capabilities: ["Extended Battery", "Solar Panels", "Satellite Comms"],
        status: { missionReady: 30, deployed: 0, charging: 0, maintenance: 5 }
      },
      {
        name: "Research Configuration",
        count: 37,
        capabilities: ["Scientific Sensors", "Sample Collection", "Data Storage"],
        status: { missionReady: 17, deployed: 0, charging: 0, maintenance: 20 }
      }
    ]
  },
  "sqdn_003": { // MQ-9 Reaper Drone Wing
    outfits: [
      {
        name: "ISR Package",
        count: 58,
        capabilities: ["Multi-Spectral Targeting System", "SIGINT Pod", "Data Link"],
        status: { missionReady: 56, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "Strike Package",
        count: 45,
        capabilities: ["Hellfire Missiles", "Targeting Pod", "Precision Munitions"],
        status: { missionReady: 40, deployed: 3, charging: 0, maintenance: 2 }
      },
      {
        name: "Extended Range Package",
        count: 65,
        capabilities: ["External Fuel Tanks", "Long-Range Sensors", "Satellite Comms"],
        status: { missionReady: 60, deployed: 3, charging: 0, maintenance: 2 }
      }
    ]
  },
  "sqdn_004": { // SubSeaSail Horus
    outfits: [
      {
        name: "ANTX METOC Monitoring Package",
        count: 1,
        capabilities: ["METOC Environmental Suite", "Doodle Radio Link", "Starlink Terminal", "MOOS-IvP Navigation", "Cloud TAK Integration"],
        status: { missionReady: 0, deployed: 0, staging: 1, maintenance: 0 }
      },
      {
        name: "Subsurface Reconnaissance Package",
        count: 24,
        capabilities: ["Acoustic Sensor Array", "Depth Sounder", "Underwater Acoustic Modem", "Burst Transmitter"],
        status: { missionReady: 20, deployed: 4, charging: 0, maintenance: 0 }
      },
      {
        name: "Persistent ISR Package",
        count: 20,
        capabilities: ["Environmental Sensors", "GPS Tracking", "Solar Power Management", "SATCOM Data Link"],
        status: { missionReady: 17, deployed: 0, charging: 2, maintenance: 1 }
      }
    ]
  },
  "sqdn_008": { // AEGIR-F Kinetic Strike Swarm
    outfits: [
      {
        name: "Anti-Ship Strike Package",
        count: 32,
        capabilities: ["SNC Hippocamp", "SNC TRAX", "Terminal Guidance", "Shaped Charge Warhead", "Encrypted Datalink"],
        status: { missionReady: 30, deployed: 0, charging: 2, maintenance: 0 }
      },
      {
        name: "Harbor Denial Package",
        count: 16,
        capabilities: ["SNC Hippocamp", "SNC TRAX", "Proximity Sensors", "High-Explosive Payload", "Swarm Coordination"],
        status: { missionReady: 12, deployed: 0, charging: 2, maintenance: 2 }
      }
    ]
  },
  "sqdn_009": { // AEGIR-W Combat Squadron
    outfits: [
      {
        name: "ISR Patrol Package",
        count: 12,
        capabilities: ["SNC Hippocamp", "SNC TRAX", "Scion ESM", "EO/IR Sensors", "Satellite Comms"],
        status: { missionReady: 10, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "Combat Defense Package",
        count: 12,
        capabilities: ["SNC Hippocamp", "SNC TRAX", "Surface Radar", "Electronic Countermeasures", "Loitering Munition Launcher"],
        status: { missionReady: 8, deployed: 2, charging: 1, maintenance: 1 }
      }
    ]
  },
  "sqdn_010": { // AEGIR-H Multi-Role Flotilla
    outfits: [
      {
        name: "ISR/EW Multi-Mission Package",
        count: 4,
        capabilities: ["SNC Hippocamp", "SNC TRAX", "Scion ESM", "EO/IR Turret", "Loitering Munition Bay", "Satellite Comms"],
        status: { missionReady: 2, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "Autonomous Resupply Package",
        count: 4,
        capabilities: ["SNC Hippocamp", "SNC TRAX", "Cargo Bay", "Navigation Radar", "Encrypted Datalink", "Autonomous Docking"],
        status: { missionReady: 3, deployed: 0, charging: 0, maintenance: 1 }
      }
    ]
  },
  "sqdn_015": { // ZeroUSV Oceanus17 ASW Flotilla
    outfits: [
      {
        name: "REPMUS ASW Package",
        count: 2,
        capabilities: ["Teledyne Webb Slocum Glider", "Thin-Line Towed Array", "Sonobuoy Launcher System", "SATCOM Data Link"],
        status: { missionReady: 1, deployed: 1, charging: 0, maintenance: 0 }
      },
      {
        name: "Survey/Bathymetric Package",
        count: 2,
        capabilities: ["Multibeam Echo Sounder (MBES)", "Teledyne Webb Slocum Glider", "Navigation Suite", "SATCOM Data Link"],
        status: { missionReady: 1, deployed: 1, charging: 0, maintenance: 0 }
      }
    ]
  },
  "sqdn_011": { // MQ-25 Stingray Tanker Wing
    outfits: [
      {
        name: "Standard Tanker Configuration",
        count: 10,
        capabilities: ["Aerial Refueling Drogue System", "SATCOM Data Link", "Carrier Ops Package"],
        status: { missionReady: 8, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "ISR-Capable Tanker",
        count: 2,
        capabilities: ["Aerial Refueling Drogue System", "EO/IR Sensor Pod", "SATCOM Data Link"],
        status: { missionReady: 1, deployed: 0, charging: 0, maintenance: 1 }
      }
    ]
  },
  "sqdn_012": { // MQ-4C Triton HALE Squadron
    outfits: [
      {
        name: "Multi-INT Maritime Surveillance",
        count: 5,
        capabilities: ["AN/ZPY-3 MFAS Radar", "EO/IR Sensor", "SIGINT Pod", "AIS Receiver"],
        status: { missionReady: 3, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "Extended Range ISR",
        count: 3,
        capabilities: ["Maritime Search Radar", "EO/IR Sensor", "Extended Fuel Tanks", "SATCOM"],
        status: { missionReady: 2, deployed: 1, charging: 0, maintenance: 0 }
      }
    ]
  },
  "sqdn_013": { // MQ-8C Fire Scout Detachment
    outfits: [
      {
        name: "Surface Search Package",
        count: 12,
        capabilities: ["AN/ZPY-4 AESA Radar", "Brite Star II EO/IR", "Link 16 Data Link"],
        status: { missionReady: 10, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "Strike Ready Package",
        count: 8,
        capabilities: ["EO/IR Targeting", "Laser Designator", "Hellfire Capability", "Link 16"],
        status: { missionReady: 5, deployed: 2, charging: 0, maintenance: 1 }
      },
      {
        name: "Mine Countermeasures",
        count: 4,
        capabilities: ["Mine Detection Sonar", "MCM Sensors", "Data Link"],
        status: { missionReady: 3, deployed: 0, charging: 0, maintenance: 1 }
      }
    ]
  },
  "sqdn_014": { // RQ-21A Blackjack Flight
    outfits: [
      {
        name: "Ship-Based ISR Package",
        count: 20,
        capabilities: ["EO/IR Camera", "Laser Range Finder", "CDL Data Link"],
        status: { missionReady: 16, deployed: 4, charging: 0, maintenance: 0 }
      },
      {
        name: "Tactical Recon Package",
        count: 16,
        capabilities: ["EO/IR Camera", "Comms Relay", "GPS Targeting"],
        status: { missionReady: 12, deployed: 2, charging: 0, maintenance: 2 }
      }
    ]
  }
};

// Legacy index-based accessor for backwards compatibility
export const getSquadronConfigByIndex = (index) => {
  const squadron = swarmSquadrons[index];
  if (!squadron) return null;
  return squadronUnitConfigurations[squadron.id] || null;
};

// Active Deployments - Shows which vessels are deployed to which missions with what loadouts
export const activeDeployments = [
  // MetalShark deployments on Hormuz Sea Denial
  {
    id: "deploy_001",
    missionId: "mission-denial-001",
    missionName: "Hormuz-Denial-Ops",
    squadronId: "sqdn_001",
    hullType: "MetalShark",
    vesselCount: 4,
    loadoutName: "Coastal Defense Package",
    loadout: {
      SENSORS: ["Hidden Level Radar"],
      COMMS: ["Silvus MANET Radio"],
      WEAPONS: ["Close-in Defense System"],
      C2: [],
      NAV: ["Precision INS/GPS"],
      AI: ["TempestOS Core", "NSYTE Autonomy"]
    },
    deployedAt: "2024-12-10T14:00:00Z",
    status: "active",
    healthStatus: { operational: 4, degraded: 0, offline: 0 }
  },
  {
    id: "deploy_002",
    missionId: "mission-denial-001",
    missionName: "Hormuz-Denial-Ops",
    squadronId: "sqdn_001",
    hullType: "MetalShark",
    vesselCount: 2,
    loadoutName: "Fast Response Package",
    loadout: {
      SENSORS: ["Navigation Radar"],
      COMMS: ["Emergency Beacon", "High-Speed Comms"],
      WEAPONS: [],
      C2: [],
      NAV: ["Precision INS/GPS"],
      AI: ["TempestOS Core"]
    },
    deployedAt: "2024-12-12T08:00:00Z",
    status: "active",
    healthStatus: { operational: 2, degraded: 0, offline: 0 }
  },
  // Saildrone deployments on Taiwan Strait ISR
  {
    id: "deploy_003",
    missionId: "mission-recon-001",
    missionName: "Taiwan-Strait-ISR-Alpha",
    squadronId: "sqdn_002",
    hullType: "Saildrone",
    vesselCount: 3,
    loadoutName: "Long Endurance ISR",
    loadout: {
      SENSORS: ["EO/IR Camera Suite", "AIS Receiver", "ESM/SIGINT Receiver"],
      COMMS: ["Iridium SATCOM", "Mesh Radio"],
      WEAPONS: [],
      C2: [],
      NAV: ["Multi-Constellation GNSS"],
      AI: ["TempestOS Core", "NSYTE Autonomy"]
    },
    deployedAt: "2024-12-12T06:00:00Z",
    status: "active",
    healthStatus: { operational: 2, degraded: 1, offline: 0 }
  },
  // MQ-9 Reaper deployments on Red Sea Escort
  {
    id: "deploy_004",
    missionId: "mission-escort-001",
    missionName: "RedSea-Convoy-Guardian",
    squadronId: "sqdn_003",
    hullType: "Saildrone", // Using Saildrone icon as placeholder
    vesselCount: 3,
    loadoutName: "ISR Package",
    loadout: {
      SENSORS: ["Multi-Spectral Targeting System", "Synthetic Aperture Radar", "SIGINT Pod"],
      COMMS: ["Beyond Line-of-Sight Data Link", "Tactical Data Link"],
      WEAPONS: [],
      C2: [],
      NAV: ["Precision Navigation"],
      AI: ["TempestOS Core"]
    },
    deployedAt: "2024-12-08T06:00:00Z",
    status: "active",
    healthStatus: { operational: 3, degraded: 0, offline: 0 }
  },
  {
    id: "deploy_005",
    missionId: "mission-escort-001",
    missionName: "RedSea-Convoy-Guardian",
    squadronId: "sqdn_003",
    hullType: "Saildrone",
    vesselCount: 2,
    loadoutName: "Strike Package",
    loadout: {
      SENSORS: ["Targeting Pod"],
      COMMS: ["Secure Data Link"],
      WEAPONS: ["Hellfire Missiles", "Precision Munitions"],
      C2: [],
      NAV: ["Precision Navigation"],
      AI: ["TempestOS Core", "NSYTE Autonomy"]
    },
    deployedAt: "2024-12-09T14:00:00Z",
    status: "active",
    healthStatus: { operational: 1, degraded: 1, offline: 0 }
  },
  // SubSeaSail UUV deployments
  {
    id: "deploy_006",
    missionId: "mission-logistics-001",
    missionName: "Spratly-Resupply-Covert",
    squadronId: "sqdn_004",
    hullType: "SubSeaSail",
    vesselCount: 4,
    loadoutName: "Covert Logistics Config",
    loadout: {
      SENSORS: ["Acoustic Array", "Depth Sounder"],
      COMMS: ["Underwater Acoustic Modem", "Burst Transmitter"],
      WEAPONS: [],
      C2: [],
      NAV: ["Inertial Navigation", "Terrain Following"],
      AI: ["TempestOS Core"]
    },
    deployedAt: "2024-12-16T22:00:00Z",
    status: "staging", // Pre-positioned but mission not launched yet
    healthStatus: { operational: 4, degraded: 0, offline: 0 }
  },
  // SubSeaSail HORUS - ANTX Coastal Trident 2026 METOC
  {
    id: "deploy_antx_001",
    missionId: "mission-antx-001",
    missionName: "ANTX-CoastalTrident-METOC",
    squadronId: "sqdn_004",
    hullType: "SubSeaSail",
    vesselCount: 1,
    loadoutName: "ANTX METOC Monitoring Package",
    loadout: {
      SENSORS: ["Water Temp Sensor", "Wind Speed Sensor", "Salinity Sensor", "Wave Height IMU", "GPS", "Stereo Audio Array", "Acoustic Sensor"],
      COMMS: ["Doodle Radio Link", "Starlink Terminal", "SATCOM"],
      WEAPONS: [],
      C2: [],
      NAV: ["MOOS-IvP Autonomous Navigation", "BHV_Loiter Behavior"],
      AI: ["TempestOS Core", "Cloud TAK", "Vehicle TAK", "TMS", "HAL"]
    },
    deployedAt: null,
    status: "staging",
    healthStatus: { operational: 1, degraded: 0, offline: 0 }
  },
  // MetalShark reconnaissance deployment
  {
    id: "deploy_007",
    missionId: "mission-recon-001",
    missionName: "Taiwan-Strait-ISR-Alpha",
    squadronId: "sqdn_001",
    hullType: "MetalShark",
    vesselCount: 5,
    loadoutName: "Reconnaissance Package",
    loadout: {
      SENSORS: ["EO/IR Sensors", "Radar Warning Receiver", "ESM/SIGINT"],
      COMMS: ["Secure Communications", "Data Link"],
      WEAPONS: [],
      C2: [],
      NAV: ["Precision INS/GPS"],
      AI: ["TempestOS Core", "NSYTE Autonomy"]
    },
    deployedAt: "2024-12-13T04:00:00Z",
    status: "active",
    healthStatus: { operational: 4, degraded: 1, offline: 0 }
  },
  // Magnet Defense M48 — TF59 Gulf-7 ISR (LANTERN tethered drone)
  {
    id: "deploy_isr_tf59_001",
    missionId: "mission-isr-tf59-001",
    missionName: "TF59-Gulf7-ISR-LANTERN",
    squadronId: "sqdn_magnet_001",
    hullType: "MagnetDefense",
    vesselCount: 1,
    loadoutName: "Persistent ISR / Fire Control Cueing Package",
    loadout: {
      SENSORS: ["DPI LANTERN Tethered UAS", "Trillium HD40 EO/IR", "Maritime Radar", "HiddenLevel Passive RF"],
      COMMS:   ["OrbComm ST 6100", "Silvus StreamCaster 4200 (LANTERN)"],
      WEAPONS: [],
      C2:      ["Project Scion (Northrop Grumman)", "RazorChassis FC Integration"],
      NAV:     ["DriveAI Autonomous Navigation"],
      AI:      ["TempestOS Core", "HAL"],
    },
    deployedAt: "2026-05-01T08:00:00Z",
    status: "active",
    healthStatus: { operational: 1, degraded: 0, offline: 0 }
  },
  // Magnet M48 — Philippine Sea ASW (CAPTAS + MFTA + Hanwha)
  {
    id: "deploy_asw_philippinesea_001",
    missionId: "mission-asw-7thfleet-001",
    missionName: "PhilSea-ASW-BRAVO7-CAPTAS",
    squadronId: "sqdn_016",
    hullType: "MagnetDefense",
    vesselCount: 3,
    loadoutName: "Multistatic ASW Package — CAPTAS + MFTA + Hanwha",
    loadout: {
      SENSORS:  ["CAPTAS-4 Variable Depth Sonar (Thales)", "MFTA Towed Array (Thales)"],
      COMMS:    ["HiveLink SDR (Link 16, WaveformX, WaveformY)", "OrbComm SATCOM"],
      WEAPONS:  ["Hanwha Naval Missile System"],
      C2:       ["USW-DSS AN/UYQ-100 (Leidos)"],
      NAV:      ["DriveAI Autonomous Navigation"],
      AI:       ["TempestOS Core"],
    },
    deployedAt: "2026-05-10T08:00:00Z",
    status: "active",
    healthStatus: { operational: 3, degraded: 0, offline: 0 }
  },
  // SubSeaSail HORUS — Philippine Sea ASW (PAMELA persistent sonobuoy mesh)
  {
    id: "deploy_asw_philippinesea_002",
    missionId: "mission-asw-7thfleet-001",
    missionName: "PhilSea-ASW-BRAVO7-CAPTAS",
    squadronId: "sqdn_004",
    hullType: "SubSeaSail",
    vesselCount: 6,
    loadoutName: "Persistent Sonobuoy Mesh — PAMELA + HiveLink",
    loadout: {
      SENSORS:  ["PAMELA™ Passive Acoustic Array (SubSeaSail)"],
      COMMS:    ["HiveLink SDR", "OrbComm ST 6100"],
      WEAPONS:  [],
      C2:       ["USW-DSS Software Agent (Leidos)"],
      NAV:      ["MOOS-IvP Autonomous Navigation"],
      AI:       ["HAL"],
    },
    deployedAt: "2026-05-10T08:00:00Z",
    status: "active",
    healthStatus: { operational: 6, degraded: 0, offline: 0 }
  },
  // MCM — Hormuz mine neutralization
  {
    id: "deploy_mcm_hormuz_001",
    missionId: "mission-mcm-5thfleet-001",
    missionName: "Hormuz-MCM-Alpha-Lane",
    squadronId: "sqdn_004",
    hullType: "SubSeaSail",
    vesselCount: 3,
    loadoutName: "MCM Mine Neutralization Package",
    loadout: {
      SENSORS: ["Acoustic Marker Receiver (Thales)"],
      COMMS:   ["OrbComm ST 6100"],
      WEAPONS: ["M30 Supercavitating Round (Thales)"],
      C2:      ["TempestOS Core"],
      NAV:     ["MOOS-IvP Autonomous Navigation"],
      AI:      ["HAL"],
    },
    deployedAt: "2026-05-20T08:00:00Z",
    status: "active",
    healthStatus: { operational: 3, degraded: 0, offline: 0 }
  },
  {
    id: "deploy_isr_taiwan_001",
    missionId: "mission-isr-7thfleet-taiwan-001",
    missionName: "TaiwanStrait-CCSISR-LIMA4",
    squadronId: "sqdn_magnet_001",
    hullType: "MagnetDefense",
    vesselCount: 1,
    loadoutName: "Counter-C5ISR Package — Taiwan Strait Median Line",
    loadout: {
      SENSORS:  ["DPI LANTERN Tethered UAS", "Trillium HD40 EO/IR", "Emitter Geo-Location Sensor", "HiddenLevel Passive RF"],
      COMMS:    ["OrbComm ST 6100", "HiveLink SDR (INDOPACOM tactical net)"],
      WEAPONS:  [],
      C2:       ["Project Scion (Northrop Grumman)", "RazorChassis C5ISR Link"],
      NAV:      ["DriveAI Autonomous Navigation"],
      AI:       ["TempestOS Core", "HAL"],
    },
    deployedAt: "2026-05-15T22:00:00Z",
    status: "active",
    healthStatus: { operational: 1, degraded: 0, offline: 0 }
  }
];

// Get deployments by mission ID
export const getDeploymentsByMission = (missionId) => {
  return activeDeployments.filter(d => d.missionId === missionId);
};

// Get deployments by hull type
export const getDeploymentsByHull = (hullType) => {
  return activeDeployments.filter(d => d.hullType === hullType);
};

// Get total deployed count by hull type
export const getDeployedCountByHull = (hullType) => {
  return activeDeployments
    .filter(d => d.hullType === hullType && d.status === 'active')
    .reduce((sum, d) => sum + d.vesselCount, 0);
};
