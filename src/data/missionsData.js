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
  }
];
