// Pre-populated missions data
export const initialMissions = [
  // RECONNAISSANCE - Taiwan Strait ISR patrol
  {
    id: "mission-recon-001",
    name: "Taiwan-Strait-ISR-Alpha",
    template: "RECONNAISSANCE",
    status: "active",
    assignedSquadrons: ["sqdn_002"],
    zoneConfig: {
      name: "Taiwan Strait Patrol Box",
      coordinates: [
        { lat: 24.2, lng: 118.5 },
        { lat: 24.8, lng: 120.0 },
        { lat: 23.5, lng: 120.2 },
        { lat: 23.0, lng: 118.8 }
      ],
      swarmSize: 3,
      swarmFormation: 'distributed',
      swarmSpacing: 'standard'
    },
    duration: "30d",
    stateHierarchies: { default: ["Comms", "Mission", "Payload", "Navigation", "Vehicle"] },
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2024-12-17T08:00:00Z",
    launchedAt: "2024-12-12T06:00:00Z",
    history: [{ action: "created", timestamp: "2024-12-10T08:00:00Z" }, { action: "launched", timestamp: "2024-12-12T06:00:00Z" }]
  },
  // SEA_DENIAL - Strait of Hormuz
  {
    id: "mission-denial-001",
    name: "Hormuz-Denial-Ops",
    template: "SEA_DENIAL",
    status: "active",
    assignedSquadrons: ["sqdn_001"],
    zoneConfig: {
      name: "Strait of Hormuz TSS",
      coordinates: [
        { lat: 26.6, lng: 56.2 },
        { lat: 26.4, lng: 56.8 },
        { lat: 26.0, lng: 56.5 },
        { lat: 26.2, lng: 55.9 }
      ],
      swarmSize: 4,
      swarmFormation: 'picket',
      swarmSpacing: 'tight'
    },
    duration: "14d",
    stateHierarchies: { default: ["Mission", "Payload", "Comms", "Navigation", "Vehicle"], threat_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"] },
    createdAt: "2024-12-08T14:00:00Z",
    updatedAt: "2024-12-15T14:00:00Z",
    launchedAt: "2024-12-10T14:00:00Z",
    history: [{ action: "created", timestamp: "2024-12-08T14:00:00Z" }, { action: "launched", timestamp: "2024-12-10T14:00:00Z" }]
  },
  // ESCORT - Red Sea convoy escort
  {
    id: "mission-escort-001",
    name: "RedSea-Convoy-Guardian",
    template: "ESCORT",
    status: "active",
    assignedSquadrons: ["sqdn_003"],
    zoneConfig: {
      name: "Red Sea Transit Corridor",
      waypoints: [
        { lat: 12.6, lng: 43.3, label: "A" },
        { lat: 14.8, lng: 42.0, label: "B" },
        { lat: 18.5, lng: 39.5, label: "C" },
        { lat: 22.0, lng: 38.0, label: "D" },
        { lat: 27.8, lng: 33.9, label: "E" }
      ],
      escortedVessels: ["MV Maersk Hangzhou", "MSC Mediterranean", "USNS Big Horn (T-AO-198)"]
    },
    duration: "21d",
    stateHierarchies: { default: ["Mission", "Comms", "Navigation", "Payload", "Vehicle"] },
    createdAt: "2024-12-05T10:00:00Z",
    updatedAt: "2024-12-16T10:00:00Z",
    launchedAt: "2024-12-08T06:00:00Z",
    history: [{ action: "created", timestamp: "2024-12-05T10:00:00Z" }, { action: "launched", timestamp: "2024-12-08T06:00:00Z" }]
  },
  // CONTESTED_LOGISTICS - Spratly Islands resupply
  {
    id: "mission-logistics-001",
    name: "Spratly-Resupply-Covert",
    template: "CONTESTED_LOGISTICS",
    status: "draft",
    assignedSquadrons: ["sqdn_004"],
    zoneConfig: {
      name: "SCS Forward Resupply Route",
      waypoints: [
        { lat: 9.8, lng: 118.7, label: "A" },
        { lat: 10.4, lng: 115.8, label: "B" },
        { lat: 10.9, lng: 114.5, label: "C" },
        { lat: 11.1, lng: 113.8, label: "D" }
      ]
    },
    duration: "7d",
    stateHierarchies: { default: ["Navigation", "Comms", "Vehicle", "Mission", "Payload"], evading: ["Vehicle", "Navigation", "Comms", "Mission", "Payload"] },
    createdAt: "2024-12-16T09:00:00Z",
    updatedAt: "2024-12-17T11:00:00Z",
    launchedAt: null,
    history: [{ action: "created", timestamp: "2024-12-16T09:00:00Z" }]
  },
  // REFLEX_SWARM_ATTACK - Black Sea
  {
    id: "mission-swarm-001",
    name: "BlackSea-Strike-Package",
    template: "REFLEX_SWARM_ATTACK",
    status: "draft",
    assignedSquadrons: ["sqdn_003"],
    zoneConfig: {
      name: "Sevastopol Approach Strike",
      targets: [
        { lat: 44.58, lng: 33.45, label: "T1", type: "primary" },
        { lat: 44.62, lng: 33.52, label: "T2", type: "secondary" },
        { lat: 44.55, lng: 33.38, label: "T3", type: "secondary" }
      ],
      staging: { lat: 44.35, lng: 32.90, label: "STAGING" },
      swarmSize: 8,
      swarmFormation: 'layered',
      swarmSpacing: 'tight'
    },
    duration: "3d",
    stateHierarchies: { default: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"], engaged: ["Payload", "Vehicle", "Mission", "Navigation", "Comms"] },
    createdAt: "2024-12-17T07:00:00Z",
    updatedAt: "2024-12-17T07:00:00Z",
    launchedAt: null,
    history: [{ action: "created", timestamp: "2024-12-17T07:00:00Z" }]
  },
  // ANTX Coastal Trident 2026 - SubSeaSail HORUS METOC Patrol
  {
    id: "mission-antx-001",
    name: "ANTX-CoastalTrident-METOC",
    template: "RECONNAISSANCE",
    status: "draft",
    assignedSquadrons: ["sqdn_004"],
    zoneConfig: {
      name: "San Nicolas Island METOC Patrol",
      coordinates: [
        { lat: 33.35, lng: -119.62 },
        { lat: 33.35, lng: -119.38 },
        { lat: 33.15, lng: -119.38 },
        { lat: 33.15, lng: -119.62 }
      ],
      swarmSize: 1,
      swarmFormation: 'distributed',
      swarmSpacing: 'standard'
    },
    duration: "14d",
    missionProfile: {
      type: "METOC_MONITORING",
      exercise: "ANTX Coastal Trident 2026",
      vehicle: "SubSeaSail HORUS AUSV",
      collectionTypes: ["WATER_TEMP", "WIND_SPEED", "SALINITY", "WAVE_HEIGHT", "GPS", "SEA_STATE_IMU"],
      commsArchitecture: {
        primary: "Doodle Radio Link",
        secondary: "Starlink",
        groundStation: "San Nicolas Island (high point)",
        homeBase: "Port Hueneme / Oxnard"
      },
      softwareStack: ["Cloud TAK", "Vehicle TAK", "TMS", "HAL", "MOOS-IvP", "Remote Control", "Notification Service"],
      objectives: {
        primary: "Provide METOC and sea condition data to Naval Base Ventura County for logistics transfer assessment",
        secondary: "Validate technologies to monitor air and water traffic for harbor/port security"
      },
      phases: [
        { step: 1.0, title: "Submit Waypoint to PATROL Location", description: "Launch HORUS from Port Hueneme, establish comms, send loiter waypoint off San Nicolas Island via TAK Web App", priority: "High", software: ["Cloud TAK", "Vehicle TAK", "TMS", "HAL", "MOOS-IvP"] },
        { step: 2.0, title: "Begin PATROL", description: "Monitor HORUS patrol route on TAK Web GUI, compare GPS location to intended navigation track", priority: "High", software: ["Cloud TAK", "Vehicle TAK", "TMS"] },
        { step: 3.0, title: "Transmit Environmental Data to Ground Station", description: "Verify sensor data collection, confirm Doodle radio link delivery to base station, relay via Starlink to home base", priority: "High", software: ["TMS", "Cloud TAK", "Vehicle TAK"] },
        { step: 4.0, title: "Trigger Geofence Notifications", description: "Detect when HORUS leaves loiter geofence, send TAK notification, confirm GPS triggering alert, take corrective action", priority: "Medium", software: ["Cloud TAK", "Vehicle TAK", "TMS", "HAL", "MOOS-IvP"] },
        { step: 5.0, title: "Station Keep and Maintain Comms", description: "Send keep station command via TAK Web App, monitor comms signal quality", priority: "Low", software: ["Cloud TAK", "Vehicle TAK", "TMS", "HAL", "MOOS-IvP"] },
        { step: 6.0, title: "Submit Waypoint to Recovery Location", description: "Set new waypoint to return to Oxnard or San Diego, monitor transit GPS, compare to nav track", priority: "High", software: ["Cloud TAK", "Vehicle TAK", "TMS", "HAL", "MOOS-IvP"] }
      ],
      teams: ["Oxnard", "SSS HQ", "SNI"],
      transitRoute: {
        launch: { lat: 34.15, lng: -119.20, label: "Port Hueneme" },
        patrol: { lat: 33.25, lng: -119.50, label: "San Nicolas Island" },
        recovery: { lat: 34.15, lng: -119.20, label: "Port Hueneme / Oxnard" }
      },
      vehicleCapabilities: {
        speed: "0.5-2.5 kts wingsail, ≥5 kts with thruster",
        endurance: "Weeks (100% energy harvesting, solar + LiFePO4)",
        sensors: ["Water Temp", "Wind Speed", "Salinity", "Wave Height/Sea State (IMU)", "GPS", "Stereo Audio (sound localization)", "Acoustic (underwater vessel detection)"],
        submersible: true,
        trl: 9
      }
    },
    stateHierarchies: {
      default: ["Navigation", "Vehicle", "Comms", "Payload", "Mission"],
      patrol: ["Payload", "Navigation", "Comms", "Vehicle", "Mission"],
      geofence_breach: ["Navigation", "Comms", "Mission", "Vehicle", "Payload"],
      comms_degraded: ["Comms", "Navigation", "Vehicle", "Mission", "Payload"]
    },
    createdAt: "2026-03-25T07:00:00Z",
    updatedAt: "2026-03-25T07:00:00Z",
    launchedAt: null,
    history: [{ action: "created", timestamp: "2026-03-25T07:00:00Z" }]
  },
  // PORT_SECURITY - Pearl Harbor Outer Perimeter
  {
    id: "mission-portsec-001",
    name: "Pearl-Harbor-Outer-Screen",
    template: "PORT_SECURITY",
    status: "active",
    assignedSquadrons: ["sqdn_001"],
    zoneConfig: {
      name: "Pearl Harbor Approach Screen",
      center: { lat: 21.32, lng: -157.98 },
      radius: 8,
      assetName: "Naval Station Pearl Harbor",
      loiterPattern: "racetrack",
      swarmSize: 3,
      swarmFormation: "picket",
      swarmSpacing: "standard"
    },
    duration: "30d",
    missionProfile: {
      type: "PORT_SECURITY",
      lane: "OUTER_SCREENING",
      collectionTypes: ["AIS", "RADAR", "EO_IR", "RF_SPECTRUM"],
      commsArchitecture: {
        primary: "OverKey Mesh VPN",
        secondary: "MILSATCOM",
        groundStation: "NAVSTA Pearl Harbor MOC",
        homeBase: "Pearl Harbor"
      },
      objectives: {
        primary: "Continuous AIS-correlated surface track log for all vessels in outer approach sector",
        secondary: "Early detection and classification of anomalous contacts; cue shore response within 3 min of confirmation"
      },
      variants: ["Routine Patrol"],
      squadronComposition: {
        screeningBoats: 2,
        subsurfaceElement: 1,
        shoreResponse: "USCG Sector Honolulu (cue target, not squadron asset)"
      },
      reportingInterval: "2min",
      escalationTriggers: [
        "No-AIS radar return inside 5 NM exclusion zone",
        "AIS transponder mismatch on EO/IR correlation",
        "Fast inbound (>15 kts) vector toward restricted water"
      ]
    },
    stateHierarchies: {
      default: ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      contact_flagged: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      comms_degraded: ["Navigation", "Comms", "Mission", "Vehicle", "Payload"],
      surge: ["Mission", "Payload", "Navigation", "Comms", "Vehicle"]
    },
    createdAt: "2026-04-01T06:00:00Z",
    updatedAt: "2026-05-10T08:00:00Z",
    launchedAt: "2026-04-03T06:00:00Z",
    history: [
      { action: "created", timestamp: "2026-04-01T06:00:00Z" },
      { action: "launched", timestamp: "2026-04-03T06:00:00Z" },
      { action: "updated", timestamp: "2026-05-10T08:00:00Z", details: "Expanded RF spectrum monitoring coverage after drone incursion report" }
    ]
  },
  // PORT_SECURITY - NAS North Island CVN HVA Protection
  {
    id: "mission-portsec-002",
    name: "NAS-NorthIsland-CVN-HVA",
    template: "PORT_SECURITY",
    status: "draft",
    assignedSquadrons: ["sqdn_002"],
    zoneConfig: {
      name: "NAS North Island Pier Security",
      center: { lat: 32.70, lng: -117.21 },
      radius: 3,
      assetName: "CVN Pier — High Value Asset",
      loiterPattern: "racetrack",
      swarmSize: 4,
      swarmFormation: "overlapping",
      swarmSpacing: "tight"
    },
    duration: "14d",
    missionProfile: {
      type: "PORT_SECURITY",
      lane: "INNER_RING",
      variant: "HVA_IN_PORT",
      collectionTypes: ["AIS", "RADAR", "EO_IR", "RF_SPECTRUM", "HYDROPHONE"],
      commsArchitecture: {
        primary: "OverKey Mesh VPN",
        secondary: "Drawbridge DDIL Link",
        groundStation: "NAS North Island Security Center",
        homeBase: "NAS North Island"
      },
      objectives: {
        primary: "Enforce 500-yard exclusion zone around CVN pier; zero unauthorized vessel transit",
        secondary: "Subsurface swimmer detection; cue Naval Security Force within 90 sec of confirmed contact"
      },
      variants: ["HVA in Port"],
      squadronComposition: {
        screeningBoats: 3,
        subsurfaceElement: 1,
        shoreResponse: "Naval Security Forces San Diego (cue target, not squadron asset)"
      },
      reportingInterval: "1min",
      escalationTriggers: [
        "Any vessel inside 500-yard exclusion zone without IFF",
        "Hydrophone contact inside pier perimeter — cue EOD immediately",
        "Counter-UAS RF signature over pier area",
        "Vessel refusing VHF hail within 1 NM"
      ],
      deterrentOptions: ["VHF Bridge-to-Bridge Hail", "Acoustic Hailer", "LED Warning Array"]
    },
    stateHierarchies: {
      default: ["Navigation", "Payload", "Mission", "Comms", "Vehicle"],
      contact_flagged: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      zone_breach: ["Mission", "Navigation", "Comms", "Payload", "Vehicle"],
      comms_degraded: ["Navigation", "Mission", "Vehicle", "Comms", "Payload"],
      subsurface_contact: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"]
    },
    createdAt: "2026-05-12T09:00:00Z",
    updatedAt: "2026-05-12T09:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-05-12T09:00:00Z" }
    ]
  },
  // SIGINT_COLLECTION - South China Sea
  {
    id: "mission-sigint-001",
    name: "SCS-SIGINT-Sentinel",
    template: "ROBOT_DEFENSE_OODA",
    status: "completed",
    assignedSquadrons: ["sqdn_002"],
    zoneConfig: {
      name: "Hainan SIGINT Collection Box",
      center: { lat: 18.2, lng: 110.5 },
      radius: 40,
      assetName: "SIGINT Station Alpha",
      loiterPattern: "racetrack",
      swarmSize: 4,
      swarmFormation: 'overlapping',
      swarmSpacing: 'standard'
    },
    duration: "45d",
    missionProfile: {
      type: "PERSISTENT_ISR",
      collectionTypes: ["ELINT", "COMINT", "AIS", "RADAR"],
      targetEmitters: ["Surface Search Radar", "Fire Control Radar", "VHF/UHF Comms", "Datalink"],
      loiterPattern: "Racetrack",
      reportingInterval: "15min"
    },
    stateHierarchies: {
      default: ["Payload", "Comms", "Mission", "Navigation", "Vehicle"],
      emitter_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      evasion: ["Navigation", "Vehicle", "Comms", "Mission", "Payload"]
    },
    createdAt: "2024-10-15T08:00:00Z",
    updatedAt: "2024-12-01T16:00:00Z",
    launchedAt: "2024-10-18T06:00:00Z",
    completedAt: "2024-12-01T16:00:00Z",
    history: [
      { action: "created", timestamp: "2024-10-15T08:00:00Z" },
      { action: "launched", timestamp: "2024-10-18T06:00:00Z" },
      { action: "completed", timestamp: "2024-12-01T16:00:00Z", details: "1,247 emitter intercepts catalogued" }
    ]
  },
  // ASW — Philippine Sea 7th Fleet
  {
    id: "mission-asw-7thfleet-001",
    name: "PhilSea-ASW-BRAVO7-CAPTAS",
    template: "ASW",
    status: "active",
    assignedSquadrons: ["sqdn_016", "sqdn_004"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Philippine Sea — Sector BRAVO-7 — PLAN Submarine Transit Route",
      coordinates: [
        { lat: 23.70, lng: 134.30 },
        { lat: 25.10, lng: 134.30 },
        { lat: 25.10, lng: 136.10 },
        { lat: 23.70, lng: 136.10 },
      ],
      swarmSize: 9,
      swarmFormation: "bistatic-mesh",
    },
    duration: "continuous",
    missionProfile: {
      type: "ASW",
      lane: "SUBMARINE_BARRIER",
      collectionTypes: ["ACTIVE_SONAR", "PASSIVE_SONAR", "ACOUSTIC_COMMS", "LINK16"],
      commsArchitecture: {
        primary: "HiveLink SDR / Link 16",
        secondary: "OrbComm SATCOM (HORUS status)",
        groundStation: "CTF-72 / Yokosuka, Japan",
        homeBase: "USS Gerald R. Ford (CVN-78) CSG"
      },
      objectives: {
        primary: "Detect, localize, and prosecute PLAN Type-093 submarines transiting Philippine Sea Sector BRAVO-7 using Magnet M48 CAPTAS/MFTA multistatic sonar geometry and SubSeaSail HORUS persistent passive acoustic mesh — zero crew exposure in the submarine threat envelope",
        secondary: "Demonstrate sensor-to-shooter compression via USW-DSS network: multistatic triangulation → Virginia class ACOMMS cue → Mk 48 ADCAP and Hanwha surface missile dual prosecution within 12 minutes of first contact"
      },
      squadronComposition: {
        captasVessel: "Magnet Defense M48 (CAPTAS) — 1× — lead/bait",
        mftaVessels: "Magnet Defense M48 (MFTA + Hanwha) — 2× — passive receivers + prosecution",
        sonobuoyMesh: "SubSeaSail HORUS (PAMELA acoustic array + HiveLink) — 6× — persistent listening field",
        subsurface: "USS Virginia (SSN-774) — on station — prosecution asset"
      },
      threat: "PLAN Type-093 Shang-class nuclear attack submarines; potential PLAN UUVs; torpedo threat to lead CAPTAS M48 (crewless by design)",
      whyThisConfig: "CAPTAS-4 on USV extends the multistatic sonar field without crew risk in the torpedo engagement zone. HORUS persistent sonobuoy field solves the battery endurance problem — submarines can't outlast wind-and-solar acoustic sensors. USW-DSS unifies the common ASW picture across all platforms. Hanwha missile adds surface prosecution arm to an otherwise sensor-only autonomous fleet.",
      escalationTriggers: [
        "CAPTAS echo return — SNR > threshold → USW-DSS triangulation tasked",
        "3-bearing intersection confidence > 85% → contact established, Link 16 broadcast",
        "Contact classified PLAN SSN → Virginia class cued via ACOMMS",
        "Virginia firing solution confirmed → Hanwha missile armed as backup prosecution"
      ],
    },
    stateHierarchies: {
      default:          ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      contact_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      prosecution:      ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
      comms_degraded:   ["Navigation", "Payload", "Mission", "Vehicle", "Comms"],
    },
    createdAt: "2026-05-10T06:00:00Z",
    updatedAt: "2026-05-25T08:00:00Z",
    launchedAt: "2026-05-10T08:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-05-10T06:00:00Z", details: "7th Fleet CTF-72 Philippine Sea ASW barrier" },
      { action: "launched", timestamp: "2026-05-10T08:00:00Z" },
      { action: "updated", timestamp: "2026-05-20T00:00:00Z", details: "Hanwha missile integration confirmed — M48-BRAVO, M48-CHARLIE armed" },
    ]
  },
  // MCM — Strait of Hormuz 5th Fleet
  {
    id: "mission-mcm-5thfleet-001",
    name: "Hormuz-MCM-Alpha-Lane",
    template: "MCM",
    status: "active",
    assignedSquadrons: ["sqdn_004"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Strait of Hormuz — Shipping Lane Alpha-7",
      coordinates: [
        { lat: 26.62, lng: 56.00 },
        { lat: 26.62, lng: 56.60 },
        { lat: 26.40, lng: 56.60 },
        { lat: 26.40, lng: 56.00 },
      ],
      swarmSize: 3,
      swarmFormation: "sequential",
    },
    duration: "72h",
    missionProfile: {
      type: "MCM",
      lane: "STRAIT_CLEARANCE",
      collectionTypes: ["SAS_SONAR", "ACOUSTIC_HOMING", "SATCOM_C2"],
      commsArchitecture: {
        primary: "OrbComm SATCOM",
        secondary: "EvoLogics Acoustic Modem",
        groundStation: "NSA Bahrain MOC",
        homeBase: "USS Lewis B. Puller (ESB-3)"
      },
      objectives: {
        primary: "Detect and neutralize Iranian-laid mines in Strait of Hormuz shipping lane Alpha-7 using Freedom AUV and SubSeaSail HORUS autonomous neutralization vessels",
        secondary: "Restore safe transit for tanker traffic without exposing human EOD divers or airborne assets to MANPADS threat"
      },
      squadronComposition: {
        auvHunter: "Freedom AUV (Oceaneering) — 1x",
        neutralizationBoats: 3,
        command: "NSA Bahrain MOC + USS Puller",
      },
      threat: "Moored contact mines, bottom influence mines; MANPADS threat to conventional MCM helicopters; hostile fast-attack craft",
      whySubSeaSail: "Wind/solar AUSVs deployed from 100+ nm standoff — zero fuel logistics, no crew risk, radar cross-section 0.01m², can submerge to evade detection; replaces helicopter-towed minesled and EOD diver operations entirely",
      escalationTriggers: [
        "AUV contact confidence > 80% → acoustic marker auto-deployed",
        "HORUS acoustic lock failure → re-task to alternate marker",
        "Mine detonation outside expected pattern → halt ops, re-sweep sector"
      ],
    },
    stateHierarchies: {
      default:          ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      contact_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      engaging:         ["Mission", "Payload", "Navigation", "Comms", "Vehicle"],
      comms_degraded:   ["Navigation", "Mission", "Vehicle", "Comms", "Payload"],
    },
    createdAt: "2026-05-20T06:00:00Z",
    updatedAt: "2026-05-25T08:00:00Z",
    launchedAt: "2026-05-20T08:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-05-20T06:00:00Z", details: "5th Fleet MCM request — Hormuz lane Alpha-7" },
      { action: "launched", timestamp: "2026-05-20T08:00:00Z" },
    ]
  },
  // ISR — Task Force 59, Gulf-7, Abu Musa Approaches
  {
    id: "mission-isr-tf59-001",
    name: "TF59-Gulf7-ISR-LANTERN",
    template: "ISR",
    status: "active",
    assignedSquadrons: ["sqdn_016"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Abu Musa Approaches — Arabian Gulf Sector Gulf-7",
      coordinates: [
        { lat: 25.50, lng: 54.70 },
        { lat: 26.10, lng: 54.70 },
        { lat: 26.10, lng: 55.40 },
        { lat: 25.50, lng: 55.40 },
      ],
      swarmSize: 1,
      swarmFormation: "loiter",
    },
    duration: "continuous",
    missionProfile: {
      type: "ISR",
      lane: "PERSISTENT_PATROL",
      collectionTypes: ["EO_IR", "PASSIVE_RF", "SURFACE_RADAR", "AIR_RADAR"],
      commsArchitecture: {
        primary: "RazorChassis FC Network Link",
        secondary: "OrbComm SATCOM",
        groundStation: "NAVCENT / NSA Bahrain MOC",
        homeBase: "Task Force 59, NSA Bahrain"
      },
      objectives: {
        primary: "Provide 24/7 persistent ISR over Abu Musa Island approaches using Magnet Defense M48 with DPI LANTERN tethered drone — detect, classify, and cue engagement of hostile UAS and fast attack craft without crew exposure",
        secondary: "Demonstrate sensor-to-shooter compression: HiddenLevel RF detection → LANTERN EO/IR confirmation → Scion AI classification → RazorChassis fire control cueing within 90 seconds of contact"
      },
      squadronComposition: {
        hostVessel: "Magnet Defense M48 — 1x",
        tetheredDrone: "DPI LANTERN — 1x (M48 deck-mounted)",
        command: "NAVCENT / TF59"
      },
      threat: "Iranian Shahed-class loitering munitions launched from Abu Musa Island; IRGCN fast attack craft; commercial vessel spoofing; drone swarms targeting VLCC shipping lane",
      whyThisConfig: "M48 + LANTERN stack provides helicopter-equivalent elevated sensor coverage with zero crew exposure and unlimited endurance. HiddenLevel passive sensing is undetectable — adversaries cannot tell they're being watched. RazorChassis compresses sensor-to-shooter from minutes to seconds by pushing fire-control-grade tracks directly to CIC.",
      escalationTriggers: [
        "HiddenLevel RF anomaly → auto-cue LANTERN EO/IR slew",
        "Scion classification confidence > 85% → RazorChassis fire control track generated",
        "Projected intercept with shipping lane < 10min → weapons free request to NAVCENT",
        "Drone swarm > 3 contacts → alert TF59 and request additional assets"
      ],
    },
    stateHierarchies: {
      default:          ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      contact_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      threat_confirmed: ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
      comms_degraded:   ["Navigation", "Mission", "Vehicle", "Comms", "Payload"],
    },
    createdAt: "2026-05-01T06:00:00Z",
    updatedAt: "2026-05-25T08:00:00Z",
    launchedAt: "2026-05-01T08:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-05-01T06:00:00Z", details: "TF59 Task Force 59 standing ISR patrol — Abu Musa sector" },
      { action: "launched", timestamp: "2026-05-01T08:00:00Z" },
      { action: "updated", timestamp: "2026-05-15T08:00:00Z", details: "RazorChassis FC integration activated" },
    ]
  },
  {
    id: "mission-isr-7thfleet-taiwan-001",
    name: "TaiwanStrait-CCSISR-LIMA4",
    template: "ISR",
    status: "active",
    assignedSquadrons: ["sqdn_016"],
    domain: "MARITIME",

    zoneConfig: {
      name: "Taiwan Strait — Median Line Sector LIMA-4 — Counter-C5ISR Patrol",
      coordinates: [
        { lat: 23.60, lng: 119.90 },
        { lat: 24.80, lng: 119.90 },
        { lat: 24.80, lng: 121.10 },
        { lat: 23.60, lng: 121.10 },
      ],
      swarmSize: 1,
      swarmFormation: "transit-patrol",
    },

    duration: "continuous",

    missionProfile: {
      type: "ISR",
      lane: "COUNTER_C5ISR",
      collectionTypes: ["EO_IR", "PASSIVE_RF", "EMITTER_GEO_LOCATION", "COVERAGE_GAP_ANALYSIS"],
      commsArchitecture: {
        primary: "RazorChassis Encrypted SATCOM → CTF-77",
        secondary: "HiveLink SDR (INDOPACOM tactical net)",
        groundStation: "7th Fleet CTF-77 / Yokosuka, Japan",
        homeBase: "USS Gerald R. Ford (CVN-78) CSG"
      },
      objectives: {
        primary: "Map PLA C5ISR sensor architecture in the Taiwan Strait — identify radar coverage gaps, duty cycle windows, and blind spots — push actionable routing data to 7th Fleet so submarines and surface assets can transit undetected",
        secondary: "Simultaneously track PLA maritime patrol UAVs (BZK-005 class) approaching the median line — provide real-time threat picture to CTF-77 — maintain M48 stealth (RCS 0.01m²) throughout"
      },
      squadronComposition: {
        hostVessel: "Magnet Defense M48 — 1x — median line patrol",
        tetheredDrone: "DPI LANTERN — 1x — elevated EO/IR + emitter geo-location",
        command: "CTF-77 / INDOPACOM"
      },
      threat: "PLA BZK-005 maritime patrol UAVs; PLAN coastal defense radar; PLA J-15 detection if M48 misidentified; PLAN Coast Guard harassment",
      counterC5ISRValue: "By mapping PLA sensor coverage gaps and timing windows, M48-DELTA enabled USS Connecticut to transit inside PLA-claimed waters undetected — a mission that would have required either accepting detection or not doing at all with a crewed platform.",
      escalationTriggers: [
        "PLA radar emitter geo-located → add to coverage model → recompute gaps",
        "Coverage gap > 10nm and window > 20min → RazorChassis routing data transmitted to CTF-77",
        "PLA UAV within 15nm of M48 → assess detection probability → continue if RCS stealth maintained",
        "PLA Coast Guard vessel within 5nm → submerge LANTERN to deck, reduce emissions, continue passive collection"
      ],
    },

    stateHierarchies: {
      default:          ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      emitter_mapping:  ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      pla_uav_contact:  ["Payload", "Navigation", "Mission", "Comms", "Vehicle"],
      comms_degraded:   ["Navigation", "Mission", "Vehicle", "Comms", "Payload"],
    },

    createdAt: "2026-05-15T06:00:00Z",
    updatedAt: "2026-05-25T08:00:00Z",
    launchedAt: "2026-05-15T22:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-05-15T06:00:00Z", details: "7th Fleet CTF-77 Counter-C5ISR tasking — Taiwan Strait median line" },
      { action: "launched", timestamp: "2026-05-15T22:00:00Z", details: "Night transit — lower PLA visual detection probability" },
      { action: "updated", timestamp: "2026-05-20T04:12:00Z", details: "3 PLA emitters mapped — USS Connecticut routing gap transmitted" },
    ]
  }
];
