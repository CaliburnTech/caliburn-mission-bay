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
