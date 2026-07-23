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
  // CONTESTED_LOGISTICS - INDOPACOM EABO Resupply (PAE RAS - CDR Anderson)
  {
    id: "mission-logistics-001",
    name: "EABO-SCS-Resupply-T82-BRAVO",
    template: "CONTESTED_LOGISTICS",
    status: "draft",
    assignedSquadrons: ["sqdn_004"],
    domain: "MARITIME",
    zoneConfig: {
      name: "INDOPACOM EABO Resupply — SCS Forward Position",
      waypoints: [
        { lat: 10.0, lng: 118.5, label: "ESB-STAGING" },
        { lat: 10.4, lng: 115.8, label: "ALPHA" },
        { lat: 10.9, lng: 114.5, label: "BRAVO-WEZ-ENTRY" },
        { lat: 11.0, lng: 113.5, label: "CHARLIE-GPS-DENIED" },
        { lat: 11.1, lng: 113.0, label: "ECHO-DELIVERY" }
      ]
    },
    duration: "7d",
    missionProfile: {
      type: "CONTESTED_LOGISTICS",
      lane: "EABO_RESUPPLY",
      classification: "CDR Arthur Anderson — PAE RAS — INDOPACOM Contested Logistics Mission Manager",
      gpsDeniedConfirmed: true,
      vessels: [
        { type: "M48", role: "Main Supply Run", cargoModules: ["DRY_CARGO_TEU", "FUEL_BLADDER_TEU"] },
        { type: "SubSeaSail_HORUS", role: "Scout/Precursor", cargoModules: [] }
      ],
      threatEnvironment: "DF-26 ASBM WEZ — PLAN surface patrols — GPS jamming ~45nm coverage at delivery zone",
      commsArchitecture: {
        primary: "Iridium SATCOM (LPI scheduled bursts — 47min intervals)",
        secondary: "TrellisWare TW-950 mesh (ESB range only)",
        groundStation: "INDOPACOM / PAE RAS MOC",
        homeBase: "ESB Staging Position — Palawan Approaches"
      },
      cargoManifest: [
        { module: "20-ft TEU Dry Cargo", weight: "8,200 kg", contents: "Ammunition, spare parts, medical supplies, rations" },
        { module: "20-ft TEU Fuel Bladder", weight: "15,000 kg (15,000L JP-8)", contents: "JP-8 aviation fuel for EABO air assets" }
      ],
      objectives: {
        primary: "Deliver 8.5 MT mixed cargo to Marine Stand-in Force EABO position inside DF-26 WEZ without crew exposure or strategic signature when lost",
        secondary: "Validate USV-only logistics pipeline replacing manned T-AO sorties inside adversary ASBM threat envelope — PAE RAS INDOPACOM Contested Logistics mission set"
      },
      routePlanning: {
        primaryRoute: "ESB → Alpha → Bravo (WEZ entry) → Charlie (GPS-denied) → Echo (delivery)",
        alternateRoute: "Echo → RTB-WP1 → RTB-WP2 → ESB (different heading)",
        emergencyRTB: "Echo → direct reciprocal, best speed",
        gpsDeniedSegments: ["Charlie → Echo (45nm, adversary jamming coverage)"],
        gpsDeniedFallback: "Magnet DriveAI INS on M48 (<0.1 nm/hr drift), SubSeaSail HORUS onboard INS on HORUS"
      },
      costPerTonUSV: 1718,
      wezDelivery: true
    },
    stateHierarchies: {
      default:       ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
      emcon_transit: ["Navigation", "Comms", "Vehicle", "Mission", "Payload"],
      gps_denied:    ["Navigation", "Vehicle", "Mission", "Comms", "Payload"],
      threat_probe:  ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
      delivery:      ["Mission", "Payload", "Navigation", "Vehicle", "Comms"],
      rtb:           ["Navigation", "Vehicle", "Comms", "Mission", "Payload"]
    },
    createdAt: "2026-06-16T09:00:00Z",
    updatedAt: "2026-06-16T09:00:00Z",
    launchedAt: null,
    history: [{ action: "created", timestamp: "2026-06-16T09:00:00Z", details: "CDR Anderson PAE RAS INDOPACOM Contested Logistics — EABO SCS forward position resupply" }]
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
      collectionTypes: ["PASSIVE_SONAR", "ACTIVE_SONAR", "ACOUSTIC_COMMS", "LINK16"],
      commsArchitecture: {
        primary: "HiveLink SDR / Link 16",
        secondary: "OrbComm SATCOM (HORUS status)",
        groundStation: "CTF-72 / Yokosuka, Japan",
        homeBase: "USS Gerald R. Ford (CVN-78) CSG"
      },
      objectives: {
        primary: "Detect, localize, and prosecute PLAN Type-093 submarines transiting Philippine Sea Sector BRAVO-7 using three Magnet M48 passive towed-array receivers in multistatic geometry, backed by the SubSeaSail HORUS persistent passive acoustic mesh — the fleet stays silent so the submarine never learns it has been found",
        secondary: "Prosecute on a single active cue: once the passive cross-fix holds a fire-control track, the lead M48 emits one confirmation ping and an MQ-8C Fire Scout delivers a Mk 54 lightweight torpedo onto the datum — zero crew exposure and no emitting bait platform"
      },
      squadronComposition: {
        leadVessel: "Magnet Defense M48 (lead passive array + single-ping confirm) — 1×",
        mftaVessels: "Magnet Defense M48 (passive MFTA towed array) — 2× — silent bistatic receivers",
        sonobuoyMesh: "SubSeaSail HORUS (PAMELA acoustic array + HiveLink) — 6× — persistent listening field",
        airborneProsecutor: "MQ-8C Fire Scout (Mk 54 lightweight torpedo) — 1× — airborne prosecution asset"
      },
      threat: "PLAN Type-093 Shang-class nuclear attack submarines; potential PLAN UUVs. Passive-first operations keep all three M48s below the submarine's counter-detection threshold, so the fleet is not localized or targeted during the search phase.",
      whyThisConfig: "Real-world ASW is won passively — active sonar reveals the hunter before the hunted. Three M48s run silent towed arrays in a multistatic geometry, letting USW-DSS cross-fix a submarine on tonals alone with no emissions. HORUS extends that passive field with an endurance no submarine battery can outlast. Only after the track is fire-control grade does the lead M48 emit a single confirmation ping, and the kill is handed to an MQ-8C Fire Scout dropping a Mk 54 — decoupling the shooter from the sensors so no platform has to act as emitting bait.",
      escalationTriggers: [
        "Passive tonal on M48 towed array — SNR > threshold → USW-DSS multistatic cross-fix tasked",
        "3-array intersection confidence > 85% → contact localized, Link 16 broadcast (still silent)",
        "Fire-control-grade passive track → lead M48 emits one active confirmation ping",
        "PLAN SSN confirmed + CTF-72 weapons free → MQ-8C Fire Scout drops Mk 54 on datum"
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
      { action: "updated", timestamp: "2026-07-23T00:00:00Z", details: "ASW doctrine revised to passive-first: 3× M48 silent towed arrays, single lead-M48 confirmation ping, MQ-8C Fire Scout Mk 54 prosecution. USS Virginia and emitting-bait concept removed." },
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
  // MDA ISR — 7th Fleet South China Sea Persistent Barrier
  {
    id: "mission-mda-isr-7thfleet-001",
    name: "SCS-MDA-ISR-BARRIER-ALPHA",
    template: "MDA_ISR",
    status: "active",
    assignedSquadrons: ["sqdn_016", "sqdn_002"],
    domain: "MARITIME",
    zoneConfig: {
      name: "South China Sea — 7th Fleet ISR Barrier — Sector ALPHA",
      coordinates: [
        { lat: 22.0, lng: 115.0 },
        { lat: 22.0, lng: 123.0 },
        { lat: 16.0, lng: 123.0 },
        { lat: 16.0, lng: 115.0 },
      ],
      swarmSize: 6,
      swarmFormation: "distributed-barrier",
    },
    duration: "continuous",
    missionProfile: {
      type: "MDA_ISR",
      lane: "PERSISTENT_MDA",
      missionManager: "LCDR Will Day",
      collectionTypes: ["AIS", "SURFACE_RADAR", "EO_IR", "SIGINT_ESM", "PASSIVE_ACOUSTIC"],
      commsArchitecture: {
        primary: "Link 16 (P-8A, MQ-4C Triton)",
        secondary: "ATAK CoT (tactical operators)",
        groundStation: "7th Fleet MOC — Yokosuka, Japan",
        fusion: "Project Overmatch (JADC2 AI fusion layer)"
      },
      objectives: {
        primary: "Persistent pattern-of-life surveillance and dark ship detection across 7th Fleet AOR — tip and cue manned P-8A and MQ-4C Triton with pre-fused contact solutions",
        secondary: "ASW barrier patrol covering PLAN submarine transit routes — TB29 passive array on Saildrone Spectre SE"
      },
      platformComposition: {
        sigintPlatform: "Saildrone Voyager ECHO-1 — ESM + AIS",
        aswBarrier: "Saildrone Spectre SE TANGO-2 — TB29 towed array",
        littoralISR: "ZeroUSV Oceanus17 DELTA-4 — SharpEye radar + EO/IR",
        aswTrail: "Saildrone Spectre SE SIERRA-9 — radar + towed array",
        areaASW: "MQ-9B SeaGuardian — AESA + sonobuoys",
        bamsWideArea: "MQ-4C Triton — AN/ZPY-3 MFAS (55,000 ft)"
      },
      escalationTriggers: [
        "Radar contact with no AIS match within 8 NM → DARK CONTACT flagged",
        "Behavioral anomaly confidence > 80% → ATAK CoT push + Link 16 broadcast",
        "Dark contact loitering > 4 hrs at known rendezvous → militia indicator",
        "Positive ID by Triton → prosecution authority request to 7th Fleet MOC"
      ]
    },
    stateHierarchies: {
      default:          ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      dark_contact:     ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      alert_generated:  ["Mission", "Comms", "Payload", "Navigation", "Vehicle"],
      comms_degraded:   ["Navigation", "Mission", "Vehicle", "Comms", "Payload"],
    },
    createdAt: "2026-06-01T06:00:00Z",
    updatedAt: "2026-06-16T08:00:00Z",
    launchedAt: "2026-06-01T08:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-01T06:00:00Z", details: "7th Fleet CTF-72 — PAE RAS persistent MDA ISR tasking — LCDR Will Day, Mission Manager" },
      { action: "launched", timestamp: "2026-06-01T08:00:00Z" },
      { action: "updated", timestamp: "2026-06-10T04:12:00Z", details: "MQ-9B SeaGuardian MAC sonobuoy integration confirmed" },
      { action: "updated", timestamp: "2026-06-16T08:00:00Z", details: "HOTEL-7 dark contact classified PLAN Maritime Militia — transmitted to 7th Fleet MOC" },
    ]
  },
  // MDA ISR — Luzon Strait ASW Barrier
  {
    id: "mission-mda-isr-luzon-001",
    name: "LuzonStrait-ASW-BARRIER-TANGO",
    template: "MDA_ISR",
    status: "draft",
    assignedSquadrons: ["sqdn_016"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Luzon Strait — ASW Acoustic Barrier — Sector TANGO",
      coordinates: [
        { lat: 21.5, lng: 120.5 },
        { lat: 21.5, lng: 122.5 },
        { lat: 19.5, lng: 122.5 },
        { lat: 19.5, lng: 120.5 },
      ],
      swarmSize: 2,
      swarmFormation: "barrier-line",
    },
    duration: "90d",
    missionProfile: {
      type: "MDA_ISR",
      lane: "ASW_BARRIER",
      missionManager: "LCDR Will Day",
      collectionTypes: ["PASSIVE_ACOUSTIC", "AIS"],
      objectives: {
        primary: "Passive acoustic barrier across Luzon Strait — detect PLAN submarines on TB29 towed array",
        secondary: "Wind-driven Spectre SE endurance eliminates rotation logistics — near-zero acoustic self-noise"
      },
      costProfile: {
        costPerDay: 9000,
        coverageNM2: 2400,
        costPerNM2PerDay: 3.75,
        vsP8AComparison: "92% cheaper per day, continuous vs 12-hr sorties"
      }
    },
    stateHierarchies: {
      default:          ["Payload", "Navigation", "Comms", "Mission", "Vehicle"],
      contact_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      comms_degraded:   ["Navigation", "Payload", "Mission", "Vehicle", "Comms"],
    },
    createdAt: "2026-06-16T07:00:00Z",
    updatedAt: "2026-06-16T07:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-16T07:00:00Z", details: "PAE RAS Luzon Strait ASW barrier — Saildrone Spectre SE TB29 configuration" },
    ]
  },
  // NON_KINETIC_EW — NEMESIS Taiwan Strait False Fleet
  {
    id: "mission-ew-nemesis-001",
    name: "NEMESIS-Alpha-TaiwanStrait-FalseFleet",
    template: "NON_KINETIC_EW",
    status: "draft",
    assignedSquadrons: ["sqdn_003"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Taiwan Strait — NEMESIS Deception Box — False Fleet Projection",
      coordinates: [
        { lat: 23.50, lng: 119.00 },
        { lat: 25.00, lng: 119.00 },
        { lat: 25.00, lng: 120.20 },
        { lat: 23.50, lng: 120.20 },
      ],
      swarmSize: 5,
      swarmFormation: "distributed",
    },
    duration: "48h",
    missionProfile: {
      type: "NON_KINETIC_EW",
      lane: "EW_DECEPTION",
      collectionTypes: ["PASSIVE_ESM", "SIGINT", "AIS_MONITOR"],
      commsArchitecture: {
        primary: "TempestOS Drawbridge (EMCON-compliant encrypted link)",
        secondary: "Acoustic modem (Orca XLUUV subsurface C2)",
        groundStation: "7th Fleet CTF-77 / NEMESIS Coordinator Node",
        homeBase: "USS Gerald R. Ford (CVN-78) CSG"
      },
      objectives: {
        primary: "Project coherent multi-spectral false fleet signature in Taiwan Strait to deceive PLAN sensors (radar, sonar, IR, ESM) — draw PLAN asset attention away from actual CVN-78 transit window",
        secondary: "Collect PLAN sensor reaction data via passive ESM — identify which adversary emitters respond to the false picture and quantify reaction latency — feed waveform library for future operations"
      },
      nemesisPackage: {
        node1: { vessel: "Saildrone Spectre (ALPHA)", role: "radar_mimic", payload: "False Fleet Projection Package", emissionRole: "AIS false-track + corner reflectors + waveform transponder" },
        node2: { vessel: "Saildrone Spectre (BRAVO)", role: "ais_spoofer", payload: "False Fleet Projection Package", emissionRole: "Secondary AIS false track — different false vessel identity" },
        node3: { vessel: "Saildrone Spectre (CHARLIE)", role: "active_jammer", payload: "SOEA Container (100 kW)", emissionRole: "Active C/X/Ku-band jamming against inbound ASM seekers" },
        node4: { vessel: "Freedom AUV", role: "acoustic_decoy", payload: "EMATT Mod 4 (8× rounds)", emissionRole: "Type-093-class acoustic signature — deceives PLAN passive sonar" },
        node5: { vessel: "Saildrone Voyager", role: "passive_collection", payload: "Passive ESM/SIGINT Module", emissionRole: "Silent — monitors all adversary emissions, feeds profile updates" }
      },
      activationSequence: [
        { step: 1, node: "Freedom AUV", action: "Deploy EMATT Mod 4 acoustic decoys at depth", rationale: "Subsurface first — no RF signature — establishes acoustic false picture before surface elements active" },
        { step: 2, node: "Saildrone Voyager", action: "ESM passive collection active", rationale: "Passive only — establishes baseline adversary emissions before any active signature" },
        { step: 3, node: "Saildrone Spectre ALPHA + BRAVO", action: "AIS false tracks + corner reflectors deployed", rationale: "Radar and AIS picture consistent — adversary correlates AIS identity to radar return" },
        { step: 4, node: "Saildrone Spectre CHARLIE", action: "SOEA 100 kW active jamming", rationale: "Active jammer is highest emission — last on, first off" },
        { step: 5, node: "Saildrone Spectre ALPHA", action: "LEED vehicles launched if terminal threat detected", rationale: "Expendable — deployed only if inbound ASM seeker detected by ESM node" }
      ],
      escalationTriggers: [
        "PLAN radar emitter transition from search to track mode → NEMESIS adjusts RCS signature upward",
        "ESM detects PLAN ASM seeker emission → LEED vehicles launched immediately",
        "PLAN sonar transmissions increase → EMATT Mod 4 acoustic profile adjustment",
        "CVN-78 transit window complete → commander terminate order → all emissions cease"
      ]
    },
    stateHierarchies: {
      default:         ["Navigation", "Comms", "Mission", "Payload", "Vehicle"],
      emcon_transit:   ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
      active_phase:    ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      profile_adjust:  ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
      termination:     ["Comms", "Navigation", "Mission", "Vehicle", "Payload"]
    },
    createdAt: "2026-06-10T08:00:00Z",
    updatedAt: "2026-06-10T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-10T08:00:00Z", details: "CTF-77 NEMESIS tasking — Taiwan Strait CVN-78 transit deception support" }
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
  },
  // PROTECTIONS — cUxS Picket — PAE RAS BET
  {
    id: "mission-prot-cuxs-001",
    name: "PAERAS-BET-cUxS-Picket",
    template: "PROTECTIONS",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    missionProfile: {
      type: "PROTECTIONS",
      subMission: "CUXS",
      packageName: "cUxS Picket Package",
      platforms: [
        { name: "MASC Baseline (198 kW)", role: "cUxS Picket — Primary", count: 2 },
        { name: "MetalShark / Mariner", role: "Net-Capture cUAS — Secondary", count: 1 }
      ],
      context: "PAE RAS BET — cUAS dozens in a 20' container at shot cost of a SHAHEAD. Epirus Leonidas H2O is the match. Magura V5/V7 Ukraine validated cUxS expansion to counter-drone, counter-USV, counter-UUV."
    },
    zoneConfig: {
      name: "PAE RAS BET — cUxS Picket Line",
      center: { lat: 24.5, lng: 122.0 },
      radius: 20,
      assetName: "cUxS Picket Package"
    },
    stateHierarchies: {
      default:         ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      threat_detected: ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
      engaged:         ["Mission", "Payload", "Navigation", "Comms", "Vehicle"],
      swarm_inbound:   ["Payload", "Mission", "Comms", "Navigation", "Vehicle"]
    },
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-16T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-16T08:00:00Z", details: "PAE RAS BET — cUxS Picket, CAPT Privette Protections mission set" }
    ]
  },
  // PROTECTIONS — Undersea Infrastructure — Baltic Pipeline Survey
  {
    id: "mission-prot-infra-001",
    name: "Baltic-Infrastructure-Survey",
    template: "PROTECTIONS",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    missionProfile: {
      type: "PROTECTIONS",
      subMission: "INFRASTRUCTURE",
      packageName: "Infrastructure Survey Package",
      platforms: [
        { name: "Saildrone Surveyor + REMUS Interface", role: "Survey Vessel — Primary Survey", count: 1 }
      ],
      context: "Nord Stream (2022) and Balticconnector (2023) attacks proved undersea infrastructure has no active defense. REMUS periodic survey + AP Sensing DAS real-time monitoring closes the gap.",
      dasIntegration: "AP Sensing fiber — real-time third-party interference alerts"
    },
    zoneConfig: {
      name: "Baltic Pipeline Corridor — Survey Route",
      center: { lat: 56.5, lng: 17.0 },
      radius: 50,
      assetName: "Infrastructure Survey Package"
    },
    stateHierarchies: {
      default:        ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      anomaly_detect: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      das_alert:      ["Mission", "Comms", "Payload", "Navigation", "Vehicle"],
      investigation:  ["Payload", "Mission", "Comms", "Navigation", "Vehicle"]
    },
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-16T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-16T08:00:00Z", details: "Baltic pipeline corridor — Infrastructure Survey Package, Protections mission set" }
    ]
  },
  // KINETIC_EFFECTS — Long-Range Surface Strike — PAE RAS MASC Baseline
  {
    id: "mission-kinetic-strike-paeras-001",
    name: "PAERAS-STRIKE-LongRange-Alpha",
    template: "KINETIC_EFFECTS",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    zoneConfig: {
      name: "Western Pacific Strike Box",
      targets: [
        { lat: 24.50, lng: 122.80, label: "T1", type: "primary" },
        { lat: 24.60, lng: 122.90, label: "T2", type: "secondary" }
      ],
      staging: { lat: 23.80, lng: 121.50, label: "STAGING" }
    },
    duration: "72h",
    missionProfile: {
      type: "KINETIC_EFFECTS",
      subMode: "STRIKE",
      strikePackage: {
        hullType: "masc-baseline",
        hullName: "MASC Baseline",
        quantity: 2,
        vlsCells: 16,
        mineCount: 0,
        payloadLoadout: ["Tomahawk Block V MST", "SM-6 (RIM-174)"],
        powerRequirementKW: 300,
        weightTons: 72,
        containerFormat: "4× 40-ft FEU (2 per vessel)"
      },
      targets: [
        { id: "T1", designation: "Primary target", classificationConfidence: null, coordinates: { lat: 24.50, lng: 122.80 } },
        { id: "T2", designation: "Secondary target", classificationConfidence: null, coordinates: { lat: 24.60, lng: 122.90 } }
      ],
      authorizationChain: [
        { role: "Intelligence Officer", action: "Target designation & classification confidence", level: "SECRET//REL TO USA, FVY" },
        { role: "Legal Advisor (LEGAD)", action: "LOAC review — target validity & proportionality", level: "SECRET" },
        { role: "Commander (O-6+)", action: "Strike package approval", level: "TOP SECRET" },
        { role: "Combatant Commander", action: "Weapons-free authorization", level: "TOP SECRET//SCI" }
      ],
      commsArchitecture: {
        primary: "Drawbridge Encrypted SATCOM",
        secondary: "OverKey Mesh VPN"
      },
      emcon: true,
      hitlCompliant: true,
      dodd300009: true,
      weaponExpenditure: [],
      bdaReport: null,
      costEstimate: {
        platformCost: 16000000,
        payloadCost: 29920000,
        totalMissionCost: 45920000,
        costPerTarget: 22960000,
        exchangeRatio: 126
      }
    },
    stateHierarchies: {
      default: ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
      authorized: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      bda: ["Payload", "Comms", "Mission", "Navigation", "Vehicle"]
    },
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-16T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-16T08:00:00Z", details: "PAE RAS Long-Range Strike — MASC Baseline 2× hull, 16 VLS cells, Tomahawk Block V MST + SM-6 loadout" }
    ]
  },
  // KINETIC_EFFECTS — Offensive Mining — Boeing Orca XLUUV
  {
    id: "mission-kinetic-mining-orca-001",
    name: "PAERAS-MINING-Clandestine-Alpha",
    template: "KINETIC_EFFECTS",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    zoneConfig: {
      name: "Adversary Transit Route Mining Zone",
      targets: [
        { lat: 26.30, lng: 120.40, label: "FIELD-A", type: "primary" }
      ],
      staging: { lat: 24.10, lng: 121.00, label: "ORCA LAUNCH POINT" }
    },
    duration: "168h",
    missionProfile: {
      type: "KINETIC_EFFECTS",
      subMode: "MINING",
      strikePackage: {
        hullType: "boeing-orca",
        hullName: "Boeing Orca XLUUV",
        quantity: 1,
        vlsCells: 0,
        mineCount: 24,
        payloadLoadout: ["Hammerhead Encapsulated Torpedo-Mine (Mk 54 warhead)"],
        powerRequirementKW: 0,
        weightTons: 0,
        containerFormat: null
      },
      targets: [
        { id: "FIELD-A", designation: "Adversary submarine transit chokepoint", classificationConfidence: null, coordinates: { lat: 26.30, lng: 120.40 } }
      ],
      authorizationChain: [
        { role: "Intelligence Officer", action: "Route analysis & classification confidence", level: "SECRET//REL TO USA, FVY" },
        { role: "Legal Advisor (LEGAD)", action: "Hague VIII compliance review & LOAC approval", level: "SECRET" },
        { role: "Commander (O-6+)", action: "Mine deployment order", level: "TOP SECRET" },
        { role: "Combatant Commander", action: "Mine field activation authorization", level: "TOP SECRET//SCI" }
      ],
      commsArchitecture: {
        primary: "Acoustic Modem (subsurface)",
        secondary: "Drawbridge SATCOM (surfaced)"
      },
      emcon: true,
      hitlCompliant: true,
      dodd300009: true,
      hagueviii: true,
      weaponExpenditure: [],
      bdaReport: null,
      costEstimate: {
        platformCost: 8500000,
        payloadCost: 19200000,
        totalMissionCost: 27700000,
        costPerTarget: 27700000,
        exchangeRatio: 1
      }
    },
    stateHierarchies: {
      default: ["Navigation", "Vehicle", "Mission", "Comms", "Payload"],
      authorized: ["Mission", "Payload", "Navigation", "Comms", "Vehicle"],
      surfaced: ["Comms", "Mission", "Navigation", "Payload", "Vehicle"]
    },
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-16T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-16T08:00:00Z", details: "PAE RAS Offensive Mining — Boeing Orca XLUUV, 24× Hammerhead mines, Hague VIII compliant" }
    ]
  },

  // SEA JEEP — Base MDA — South China Sea
  {
    id: "mission-seajeep-base-scs-001",
    name: "Spratly-MDA-Alpha",
    template: "SEAJEEP_BASE",
    status: "active",
    assignedSquadrons: ["sqdn_seajeep_001"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Spratly Islands MDA Patrol Box",
      coordinates: [
        { lat: 10.2, lng: 114.2 }, { lat: 10.2, lng: 115.8 },
        { lat: 9.4, lng: 115.8 },  { lat: 9.4, lng: 114.2 },
      ],
      swarmSize: 1,
      swarmFormation: "solo",
    },
    duration: "30d",
    missionProfile: {
      type: "SEAJEEP_BASE",
      lane: "MDA_PATROL",
      collectionTypes: ["EO_IR_PHOTOGRAPHY", "AIS_MONITORING", "SATCOM_RELAY"],
      commsArchitecture: { primary: "Iridium SATCOM", groundStation: "7th Fleet MOC, Yokosuka" },
      objectives: {
        primary: "Photograph and log AIS-dark Chinese maritime militia vessels around Mischief Reef and Whitsun Reef in the Spratly Islands",
        secondary: "Build pattern-of-life on militia presence for 7th Fleet MDA cell — no engagement authority"
      },
      platform: "GP-USV (Sea Jeep) — Base config",
      platformSpecsPlaceholder: "Ocean Aero Triton: 4.4m, 5kts, 30+ day, solar/wind",
      threat: "Gray zone harassment — no kinetic threat anticipated",
    },
    stateHierarchies: {
      default: ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      contact_detected: ["Payload", "Comms", "Mission", "Navigation", "Vehicle"],
    },
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-22T08:00:00Z",
    launchedAt: "2026-06-01T10:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-01T08:00:00Z", details: "7th Fleet MDA request — Spratly patrol" },
      { action: "launched", timestamp: "2026-06-01T10:00:00Z" },
    ]
  },

  // SEA JEEP — ISR — Red Sea / Bab-el-Mandeb
  {
    id: "mission-seajeep-isr-redsea-001",
    name: "BabElMandeb-DroneWatch-Alpha",
    template: "SEAJEEP_ISR",
    status: "active",
    assignedSquadrons: ["sqdn_seajeep_002"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Bab-el-Mandeb ISR Station",
      coordinates: [
        { lat: 12.7, lng: 43.8 }, { lat: 12.7, lng: 44.2 },
        { lat: 12.3, lng: 44.2 }, { lat: 12.3, lng: 43.8 },
      ],
      swarmSize: 1,
      swarmFormation: "solo",
    },
    duration: "14d",
    missionProfile: {
      type: "SEAJEEP_ISR",
      lane: "ISR_STATION",
      collectionTypes: ["EO_IR_ELEVATED", "UAS_TRACKING", "SATCOM_RELAY"],
      commsArchitecture: { primary: "Iridium SATCOM", secondary: "900MHz radio mesh", groundStation: "NSA Bahrain MOC" },
      objectives: {
        primary: "Detect Houthi drone launches from Yemeni coastline — relay bearing and elevation to Arleigh Burke DDG on station for SM-2 intercept",
        secondary: "Persistent crewless tripwire node — expendable, low-RCS, no crew at risk"
      },
      platform: "GP-USV (Sea Jeep) — ISR config (extended mast + counterweight keel)",
      platformSpecsPlaceholder: "Ocean Aero Triton: 4.4m, 5kts, 30+ day, solar/wind",
      threat: "Houthi UAS, anti-ship missiles — MARAD advisory 2026-006 active",
    },
    stateHierarchies: {
      default: ["Payload", "Comms", "Mission", "Navigation", "Vehicle"],
      threat_detected: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
    },
    createdAt: "2026-06-10T08:00:00Z",
    updatedAt: "2026-06-22T08:00:00Z",
    launchedAt: "2026-06-10T10:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-10T08:00:00Z", details: "NAVCENT / 5th Fleet request — Houthi drone watch" },
      { action: "launched", timestamp: "2026-06-10T10:00:00Z" },
    ]
  },

  // SEA JEEP — MCM Survey — Black Sea
  {
    id: "mission-seajeep-mcm-blacksea-001",
    name: "OdessaCorridor-MineSurvey-Alpha",
    template: "SEAJEEP_MCM",
    status: "active",
    assignedSquadrons: ["sqdn_seajeep_003"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Black Sea — Grain Corridor Alpha Survey Lane",
      coordinates: [
        { lat: 46.45, lng: 30.90 }, { lat: 46.45, lng: 32.10 },
        { lat: 46.35, lng: 32.10 }, { lat: 46.35, lng: 30.90 },
      ],
      swarmSize: 1,
      swarmFormation: "solo",
    },
    duration: "72h",
    missionProfile: {
      type: "SEAJEEP_MCM",
      lane: "MINE_SURVEY",
      detectOnly: true,
      collectionTypes: ["FLS_SONAR", "TOWED_SIDESCAN", "INS_NAV"],
      commsArchitecture: { primary: "Iridium SATCOM", groundStation: "Ukrainian Navy MOC, Odessa" },
      objectives: {
        primary: "Survey proposed grain corridor for legacy Russian mines (2022-era) using Forward-Looking SONAR and towed side-scan — detect and mark only",
        secondary: "Hand off mine contact coordinates to HORUS MCM package for neutralization — no onboard neutralization capability"
      },
      platform: "GP-USV (Sea Jeep) — MCM config (FLS, towed side-scan, smart winch, A-frame, extended fuel, INS)",
      platformSpecsPlaceholder: "Ocean Aero Triton: 4.4m, 5kts, 30+ day, solar/wind",
      threat: "Legacy Russian bottom and moored mines (2022); GPS jamming/spoofing — INS navigation required",
    },
    stateHierarchies: {
      default: ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      contact_detected: ["Payload", "Mission", "Navigation", "Comms", "Vehicle"],
    },
    createdAt: "2026-06-15T08:00:00Z",
    updatedAt: "2026-06-22T08:00:00Z",
    launchedAt: "2026-06-15T10:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-15T08:00:00Z", details: "EUCOM request — Black Sea grain corridor mine survey" },
      { action: "launched", timestamp: "2026-06-15T10:00:00Z" },
    ]
  },

  // SEA JEEP — Logistics — Philippine Island Chain
  {
    id: "mission-seajeep-logistics-phil-001",
    name: "Batanes-Resupply-WHISKEY3",
    template: "SEAJEEP_LOGISTICS",
    status: "active",
    assignedSquadrons: ["sqdn_seajeep_004"],
    domain: "MARITIME",
    zoneConfig: {
      name: "Subic Bay → Batanes Island Resupply Route",
      waypoints: [
        { lat: 14.81, lng: 120.27, label: "Subic Bay" },
        { lat: 15.60, lng: 120.80, label: "WP-BRAVO" },
        { lat: 16.80, lng: 121.40, label: "WP-CHARLIE" },
        { lat: 17.80, lng: 121.90, label: "WP-DELTA" },
        { lat: 20.45, lng: 121.97, label: "Batanes" },
      ],
      swarmSize: 1,
      swarmFormation: "solo",
    },
    duration: "48h",
    missionProfile: {
      type: "SEAJEEP_LOGISTICS",
      lane: "ISLAND_RESUPPLY",
      collectionsTypes: ["POSITION_REPORTING", "CARGO_DELIVERY"],
      commsArchitecture: { primary: "Iridium SATCOM (position reporting only)", groundStation: "USMC Forward Command, Luzon" },
      objectives: {
        primary: "Deliver sealed cargo pod (18.5kg — batteries, comms gear, rations, medical) to USMC forward observation post on Batanes Island — 148nm autonomous transit",
        secondary: "Return to Subic Bay for reload — total cycle time <30 hours, zero crew, zero fuel cost (solar/wind)"
      },
      platform: "GP-USV (Sea Jeep) — Logistics config (low mast, no RADAR/PTZ, cargo pod)",
      platformSpecsPlaceholder: "Ocean Aero Triton: 4.4m, 5kts, 30+ day, solar/wind",
      realWorldBasis: "USMC ALPV (Leidos) — first island chain transit Sep 2025; 12th LLB IOC; Subic Bay warehouse leased early 2026",
      threat: "Low — relies on small RCS; no sensors for self-defense",
    },
    stateHierarchies: {
      default: ["Navigation", "Comms", "Mission", "Vehicle", "Payload"],
    },
    createdAt: "2026-06-18T08:00:00Z",
    updatedAt: "2026-06-22T08:00:00Z",
    launchedAt: "2026-06-18T10:00:00Z",
    completedAt: null,
    history: [
      { action: "created", timestamp: "2026-06-18T08:00:00Z", details: "USMC 12th LLB request — Batanes island resupply" },
      { action: "launched", timestamp: "2026-06-18T10:00:00Z" },
    ]
  },

  // ─── JMN — Joint Maritime Next (Shield & Spear) ───────────────────────────────
  {
    id: "mission-seabed-baltic-001",
    name: "Baltic-CUI-Survey",
    template: "SEABED_MONITORING",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    jmnAlignment: "SHIELD",
    missionProfile: {
      type: "SEABED_MONITORING",
      packageName: "CUI Survey Package",
      platforms: [
        { name: "Ocean Aero Triton", role: "Survey Mothership + Close-Look — multibeam/SAS baseline + anomaly diff, dives on cued segments itself", count: 1 }
      ],
      context: "Nord Stream (2022) and Balticconnector (2023) proved critical undersea infrastructure has no active defense. Under NATO Baltic Sentry (Jan 2025; TFX-Baltic tested ~70 drones Mar–Oct 2025), a persistent Ocean Aero Triton diffs each survey pass against a baseline route model; AP Sensing DAS fiber cues the vehicle, which dives on the segment itself for the close-look — no separate dive asset required. Detect-and-characterize only.",
      dasIntegration: "AP Sensing fiber — real-time third-party interference alerts",
      realWorldBasis: "NATO Baltic Sentry / NMCSCUI @ MARCOM; Nord Stream & Balticconnector attacks",
      jmnCapability: "Cap #3 — Seabed Asset Monitoring / LOE 2"
    },
    zoneConfig: {
      name: "Gotland Basin CUI Corridor — Survey Lane",
      center: { lat: 57.0, lng: 19.0 },
      radius: 40,
      assetName: "CUI Survey Package"
    },
    stateHierarchies: {
      default:        ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      anomaly_detect: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      das_alert:      ["Mission", "Comms", "Payload", "Navigation", "Vehicle"],
      investigation:  ["Payload", "Mission", "Comms", "Navigation", "Vehicle"]
    },
    createdAt: "2026-07-10T08:00:00Z",
    updatedAt: "2026-07-10T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-07-10T08:00:00Z", details: "JMN Shield — Seabed & Undersea Infrastructure Survey (Baltic Sentry)" }
    ]
  },
  {
    id: "mission-threatchar-epac-001",
    name: "EPAC-Sleeper-Watch",
    template: "THREAT_CHARACTERIZATION",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    jmnAlignment: "SHIELD",
    missionProfile: {
      type: "THREAT_CHARACTERIZATION",
      packageName: "Threat Characterization Package",
      platforms: [
        { name: "Ocean Aero Triton", role: "Characterization Picket — passive tripwire + material-ID", count: 1 }
      ],
      context: "Traffickers have gone unmanned — Colombian Navy captured the first Starlink-equipped unmanned narco-sub (Jul 2025) and USCG Cutter Forward interdicted a semi-submersible with ~17,600 lb of cocaine in the Eastern Pacific (24 Feb 2026). The same low-freeboard 'sleeper' profile could pre-stage explosive/chemical payloads. A Triton picket detects the contact, closes covertly, and brings gamma/neutron + trace chemical sniffer payloads to bear to characterize explosive/chemical/narcotic/inert material.",
      realWorldBasis: "Unmanned narco-sub seizures 2025–2026; JIATF-South / SOUTHCOM",
      jmnCapability: "Cap #4 — Threat Detection Characterization / LOE 2"
    },
    zoneConfig: {
      name: "Eastern Pacific Transit Corridor — Characterization Barrier",
      center: { lat: 8.0, lng: -90.0 },
      radius: 30,
      assetName: "Threat Characterization Package"
    },
    stateHierarchies: {
      default:         ["Navigation", "Payload", "Comms", "Mission", "Vehicle"],
      passive_contact: ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      material_scan:   ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      characterized:   ["Mission", "Comms", "Payload", "Navigation", "Vehicle"]
    },
    createdAt: "2026-07-10T08:00:00Z",
    updatedAt: "2026-07-10T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-07-10T08:00:00Z", details: "JMN Shield — Threat Detection & Characterization (CBRNE/contraband)" }
    ]
  },
  {
    id: "mission-launchedfx-taiwan-001",
    name: "TaiwanStrait-MissileTruck-Alpha",
    template: "LAUNCHED_EFFECTS",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    jmnAlignment: "SPEAR",
    missionProfile: {
      type: "LAUNCHED_EFFECTS",
      packageName: "Launched-Effects Package",
      platforms: [
        { name: "M48", role: "Launched-Effects Mothership (EMCON)", count: 1 },
        { name: "AEGIR-W", role: "Attack Daughter USV", count: 3 },
        { name: "VATN S6", role: "Undersea Kinetic Daughter (UUV)", count: 1 }
      ],
      context: "A low-cost USV 'maritime missile truck' transits EMCON to a launch basket and dispenses a mixed daughter salvo — small attack USVs, a UUV, and air-launched effects/loitering munitions — to saturate an adversary picket from an unexpected axis and compress detect-to-engage. Grounded in the Magura V7 precedent (2 May 2025: first aircraft killed by a USV). Strict human-in-the-loop release and engage gates.",
      realWorldBasis: "Ukraine Magura V7 Sidewinder kills (May 2025); Mk 70 PDS",
      jmnCapability: "Cap #7 — Tactical Insertion and Strike / LOE 3"
    },
    zoneConfig: {
      name: "Taiwan Strait Western Approach — Launch Basket",
      center: { lat: 24.5, lng: 119.5 },
      radius: 25,
      assetName: "Launched-Effects Package"
    },
    stateHierarchies: {
      default:      ["Navigation", "Vehicle", "Payload", "Mission", "Comms"],
      ingress:      ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
      release_gate: ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
      swarm_inbound:["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
      engaged:      ["Mission", "Payload", "Navigation", "Comms", "Vehicle"]
    },
    createdAt: "2026-07-10T08:00:00Z",
    updatedAt: "2026-07-10T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-07-10T08:00:00Z", details: "JMN Spear — Tactical Insertion & Strike (launched-effects mothership)" }
    ]
  },
  {
    id: "mission-sof-hormuz-001",
    name: "Hormuz-Clandestine-Disablement",
    template: "SOF_STRIKE_SUPPORT",
    status: "draft",
    assignedSquadrons: [],
    domain: "MARITIME",
    jmnAlignment: "SPEAR",
    missionProfile: {
      type: "SOF_STRIKE_SUPPORT",
      packageName: "SOF Strike Support Package",
      platforms: [
        { name: "Ocean Aero Triton", role: "Covert SOF Host (EMCON, sub-surface evade)", count: 1 },
        { name: "VATN S6", role: "Clandestine Disablement UUV", count: 1 }
      ],
      context: "An unmanned low-profile surface host transits covertly to a release point, releases a VATN S6 UUV that navigates GPS-denied on its INStinct INS to the target hull and executes a disablement effect (limpet attach / lightweight torpedo) below the propeller/rudder — a mobility kill, not area destruction — then makes the SOF delivery run itself, carrying the SOF element to a littoral objective and back. HiddenLevel RF screen + EW decoy (dropped on the inbound transit lane) masks the approach. Strict operator authorization gate; unclassified stand-in for a classified CONOPS.",
      realWorldBasis: "Emerging maritime-SOF UUV doctrine; Navy SEAL CCM-launched loitering munition (2025); Hormuz asymmetry",
      jmnCapability: "Cap #10 — Clandestine disablement & SOF/CCMD strike support / LOE 3"
    },
    zoneConfig: {
      name: "Strait of Hormuz Littoral — Covert Approach Lane",
      center: { lat: 26.6, lng: 56.5 },
      radius: 20,
      assetName: "SOF Strike Support Package"
    },
    stateHierarchies: {
      default:        ["Navigation", "Vehicle", "Payload", "Mission", "Comms"],
      covert_transit: ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
      uuv_transit:    ["Navigation", "Payload", "Mission", "Comms", "Vehicle"],
      hitl_authorize: ["Mission", "Payload", "Comms", "Navigation", "Vehicle"]
    },
    createdAt: "2026-07-10T08:00:00Z",
    updatedAt: "2026-07-10T08:00:00Z",
    launchedAt: null,
    history: [
      { action: "created", timestamp: "2026-07-10T08:00:00Z", details: "JMN Spear — Clandestine Disablement & SOF Strike Support" }
    ]
  },
];
