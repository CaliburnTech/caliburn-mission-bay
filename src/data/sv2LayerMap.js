/**
 * SV-2 Architecture Layer Mapping
 *
 * Maps capabilities to their architectural layer in an SV-2 diagram.
 * Each vessel configuration produces a self-contained SV-2 "system block"
 * with defined external interface points (comms boundaries).
 *
 * PRODUCT ECOSYSTEM:
 *   TempestOS  = The operating system (AlmaLinux-based, Boot-C, read-only FS)
 *   TMS        = Tempest Messaging Service — pub/sub bus within TempestOS
 *   Avalon     = Development environment / IDE for building on TempestOS
 *   Mission Bay = Capability marketplace that hosts and manages configurations
 *
 * The vessel's on-board stack runs TempestOS + TMS + applications.
 * Avalon and Mission Bay live in the shore/cloud tier as tools that
 * feed configurations and software to vessels.
 *
 * SWARM COMPOSITION NOTE:
 * Individual vessel SV-2s are designed as composable units. Each has:
 *   - Internal layers (Compute → TempestOS/TMS → Applications → Equipment)
 *   - External interface ports (items in the Radios subgroup + Shore/Cloud layers)
 * A swarm-level SV-2 connects multiple vessel blocks at their external ports.
 * The `externalInterface` flag on components marks these connection points.
 *
 * When building swarm diagrams:
 *   1. Each vessel's SV-2 becomes a collapsed "system" node (or expanded inline)
 *   2. External interface ports become the link targets between vessels
 *   3. Shore/Cloud/Avalon/MissionBay layers are shared across the swarm
 *   4. Equipment/Applications/TempestOS/Compute are per-vessel
 */

// ──────────────────────────────────────────
// Architecture Layers (ordered top to bottom)
// ──────────────────────────────────────────
// Top layers are shore-side / shared. Bottom layers are on-vessel.

export const SV2_LAYERS = [
  // ── Shore-side / Shared ──
  {
    id: 'layer-shore',
    label: 'Shore Environments',
    color: '#e8d5e8',
    description: 'External C2 infrastructure — TAK servers, ground stations, ops centers',
    scope: 'shared',
    defaultHeight: 160,
    minHeight: 100
  },
  {
    id: 'layer-cloud',
    label: 'Cloud Services',
    color: '#fde8c8',
    description: 'Cloud relay, remote control, data collection, and platform services',
    scope: 'shared',
    defaultHeight: 80,
    minHeight: 60
  },

  // ── Mission Bay (capability host) ──
  // Equipped capabilities from the loadout live here.
  // Mission Bay is the marketplace that provides these to the vessel.
  {
    id: 'layer-missionbay',
    label: 'Mission Bay',
    color: '#dbeafe',
    description: 'Capability marketplace — equipped payloads and software from the Mission Bay loadout',
    scope: 'per-vessel',
    defaultHeight: 200,
    minHeight: 120,
    // Capabilities from the loadout are placed as children of this layer,
    // grouped into subgroups by slot category (Sensors, Comms, C2, Nav, AI, etc.)
    hostsEquippedCapabilities: true
  },

  // ── On-vessel ──
  {
    id: 'layer-equipment',
    label: 'Equipment',
    color: '#d4e4f7',
    description: 'Physical hardware — radios, sensors, weapons',
    scope: 'per-vessel',
    defaultHeight: 180,
    minHeight: 100
  },
  {
    id: 'layer-applications',
    label: 'Applications',
    color: '#d4edda',
    description: 'On-vessel application software — navigation autonomy, C2 clients, data processing',
    scope: 'per-vessel',
    defaultHeight: 140,
    minHeight: 100
  },
  {
    id: 'layer-tempestos',
    label: 'TempestOS',
    color: '#e8f5e9',
    description: 'Operating system layer — bootc (bootable containers), atomic read-only filesystem, STIG\'d + SELinux enforcing, Podman runtime, K8s/systemd orchestration',
    scope: 'per-vessel',
    defaultHeight: 140,
    minHeight: 100,
    // TempestOS has named sub-components that are architecturally distinct
    subLayers: [
      {
        id: 'sublayer-tms',
        label: 'TMS (Tempest Messaging Service)',
        description: 'Integration layer built on Protobuf + NATS JetStream. Stateful topic-based streams. Payloads subscribe and produce data. Handles protocol conversions (CAN, NMEA 0183, STANAG 4817, MAVLink, CoT).',
        alwaysPresent: true
      },
      {
        id: 'sublayer-os-services',
        label: 'OS Services',
        description: 'Core OS services — MCU bridge, sensor publisher, container management',
        alwaysPresent: true
      }
    ]
  },
  {
    id: 'layer-compute',
    label: 'Compute',
    color: '#d4e4f7',
    description: 'Onboard compute hardware — processors, memory, storage, MCU',
    scope: 'per-vessel',
    defaultHeight: 130,
    minHeight: 100
  }
];

// ──────────────────────────────────────────
// Equipment Sub-groups
// ──────────────────────────────────────────

export const SV2_SUBGROUPS = {
  'sg-radios': {
    layerId: 'layer-equipment',
    label: 'Radios',
    color: '#c8d8eb',
    // Radios are EXTERNAL INTERFACE points — the boundary where
    // inter-vessel and shore communications connect.
    // In swarm diagrams, these are the link targets.
    externalInterface: true
  },
  'sg-sensing': {
    layerId: 'layer-equipment',
    label: 'Sensing',
    color: '#c8d8eb',
    externalInterface: false
  },
  'sg-weapons': {
    layerId: 'layer-equipment',
    label: 'Weapons',
    color: '#c8d8eb',
    externalInterface: false
  },
  'sg-c2': {
    layerId: 'layer-applications',
    label: 'C2 Systems',
    color: '#d4edda',
    externalInterface: true  // C2 links between vessels and shore
  }
};

// ──────────────────────────────────────────
// Category → Layer + Subgroup Mapping
// ──────────────────────────────────────────
// Maps capability categories (from marketplaceData.js) to their
// architectural placement. Uses the capability's `category` field.

const CATEGORY_LAYER_MAP = {
  // Equipment / Radios
  'RF COMMUNICATIONS':    { layerId: 'layer-equipment', subgroupId: 'sg-radios', externalInterface: true },
  'SATCOM':               { layerId: 'layer-equipment', subgroupId: 'sg-radios', externalInterface: true },

  // Equipment / Sensing
  'EO/IR SENSORS':        { layerId: 'layer-equipment', subgroupId: 'sg-sensing' },
  'RADAR/RF':             { layerId: 'layer-equipment', subgroupId: 'sg-sensing' },
  'ACOUSTIC/SONAR':       { layerId: 'layer-equipment', subgroupId: 'sg-sensing' },

  // Equipment / Weapons
  'KINETIC WEAPONS':      { layerId: 'layer-equipment', subgroupId: 'sg-weapons' },
  'DIRECTED ENERGY':      { layerId: 'layer-equipment', subgroupId: 'sg-weapons' },

  // Equipment / Sensing (EW merged into sensors)
  'ELECTRONIC SUPPORT':   { layerId: 'layer-equipment', subgroupId: 'sg-sensing' },
  'ELECTRONIC ATTACK':    { layerId: 'layer-equipment', subgroupId: 'sg-sensing' },
  'ELECTRONIC PROTECTION':{ layerId: 'layer-equipment', subgroupId: 'sg-sensing' },

  // C2 Systems
  'C2 SYSTEMS':           { layerId: 'layer-applications', subgroupId: 'sg-c2', externalInterface: true },

  // Applications
  'NAVIGATION':           { layerId: 'layer-applications' },
  'RESILIENT PNT':        { layerId: 'layer-applications' },
  'COMMAND & CONTROL':    { layerId: 'layer-applications', subgroupId: 'sg-c2', externalInterface: true },
  'UNMANNED SYSTEMS':     { layerId: 'layer-applications' },

  // Utility — could be applications or tempestos depending on nature
  'LOGISTICS':            { layerId: 'layer-applications' },
  'SPECIAL OPERATIONS':   { layerId: 'layer-applications' }
};

// Slot category fallback (when capability.category doesn't match above)
const SLOT_CATEGORY_FALLBACK = {
  'SENSORS':  { layerId: 'layer-equipment', subgroupId: 'sg-sensing' },
  'COMMS':    { layerId: 'layer-equipment', subgroupId: 'sg-radios', externalInterface: true },
  'WEAPONS':  { layerId: 'layer-equipment', subgroupId: 'sg-weapons' },
  'C2':       { layerId: 'layer-applications', subgroupId: 'sg-c2', externalInterface: true },
  'NAV':      { layerId: 'layer-applications' },
  'AI':       { layerId: 'layer-applications' },
  'UTILITY':  { layerId: 'layer-applications' },
  'OTHER':    { layerId: 'layer-applications' }
};

/**
 * Determine the SV-2 architecture layer for a capability.
 *
 * @param {object} capability - Full capability object from marketplaceData
 * @param {string} slotCategory - The slot category it's equipped in (SENSORS, COMMS, etc.)
 * @returns {{ layerId: string, subgroupId?: string, externalInterface?: boolean }}
 */
export const getArchitectureLayer = (capability, slotCategory) => {
  // 1. Check for explicit sv2 override on the capability
  if (capability?.sv2?.architectureLayer) {
    return {
      layerId: capability.sv2.architectureLayer,
      subgroupId: capability.sv2?.subgroup,
      externalInterface: capability.sv2?.externalInterface || false
    };
  }

  // 2. Map by capability category string
  const capCategory = capability?.category?.toUpperCase() || '';
  for (const [pattern, mapping] of Object.entries(CATEGORY_LAYER_MAP)) {
    if (capCategory.includes(pattern) || capCategory === pattern) {
      return { externalInterface: false, ...mapping };
    }
  }

  // 3. Fall back to slot category
  if (slotCategory && SLOT_CATEGORY_FALLBACK[slotCategory]) {
    return { externalInterface: false, ...SLOT_CATEGORY_FALLBACK[slotCategory] };
  }

  // 4. Default: applications layer
  return { layerId: 'layer-applications', externalInterface: false };
};

// ──────────────────────────────────────────
// Baseline Components (always present)
// ──────────────────────────────────────────
// These appear in every vessel's SV-2 regardless of equipped capabilities.
// They form the "spine" of the architecture.

export const BASELINE_COMPONENTS = {
  // ── TempestOS layer ──
  // Split into TMS (pub/sub bus) and OS Services (MCU bridge, sensor pub, etc.)
  tempestos: [
    {
      id: 'tms',
      label: 'TMS\n(Tempest Messaging Service)',
      layerId: 'layer-tempestos',
      sublayerId: 'sublayer-tms',
      description: 'Integration layer built on Protobuf + NATS JetStream. Runs as containerized services. Pub/sub on stateful, topic-based streams. Handles conversions between CAN, NMEA 0183, STANAG 4817, MAVLink, CoT, and proprietary protocols.',
      alwaysPresent: true,
      protocols: ['Protobuf', 'NATS JetStream', 'NMEA 0183', 'CAN', 'STANAG 4817', 'MAVLink', 'CoT'],
      // TMS is the hub — payloads subscribe and produce data on topic-based streams
      isHub: true
    },
    {
      id: 'main-mcu-svc',
      label: 'Main to MCU Service',
      layerId: 'layer-tempestos',
      sublayerId: 'sublayer-os-services',
      description: 'Bridge between main processor domain and MCU for vehicle control commands',
      alwaysPresent: true
    },
    {
      id: 'sensor-pub',
      label: 'Sensor Publisher',
      layerId: 'layer-tempestos',
      sublayerId: 'sublayer-os-services',
      description: 'Aggregates raw sensor data, publishes to TMS channels and local storage',
      requiresCategory: 'SENSORS'
    }
  ],

  // ── Shore layer ──
  // Includes C2 infrastructure + the Caliburn ecosystem tools
  shore: [
    {
      id: 'c2-station',
      label: 'C2 Station',
      layerId: 'layer-shore',
      description: 'External command and control endpoint — TAK server, ops center',
      alwaysPresent: true,
      externalInterface: true
    },
    {
      id: 'avalon',
      label: 'Avalon',
      layerId: 'layer-shore',
      description: 'TempestOS development environment — build, test, and deploy software packages to vessels',
      alwaysPresent: true,
      externalInterface: false
    },
  ],

  // ── Cloud layer ──
  // Present when comms or sensors are equipped
  cloud: [
    {
      id: 'remote-control',
      label: 'Remote Control',
      layerId: 'layer-cloud',
      description: 'Remote vehicle control relay',
      requiresCategory: 'COMMS'
    },
    {
      id: 'data-collection',
      label: 'Data Collection',
      layerId: 'layer-cloud',
      description: 'Environmental/mission data aggregation and forwarding',
      requiresCategory: 'SENSORS'
    }
  ]
};

// ──────────────────────────────────────────
// Default Edge Templates
// ──────────────────────────────────────────
// Rules for auto-generating edges between components.
// These define the "typical" data flows that apply unless overridden.

export const DEFAULT_EDGE_RULES = [
  // ── Equipment → TempestOS ──
  // Sensors → Sensor Publisher (raw data ingestion)
  {
    sourceFilter: { subgroupId: 'sg-sensing' },
    targetId: 'sensor-pub',
    defaultLabel: 'Sensor Data',
    description: 'Raw sensor data flows to the sensor publisher for aggregation'
  },
  // Radios → Cloud (external comms path)
  {
    sourceFilter: { subgroupId: 'sg-radios' },
    targetId: 'remote-control',
    defaultLabel: 'C2 / Data',
    description: 'Radio comms relay to cloud services'
  },

  // ── TMS as the hub ──
  // Everything on-vessel publishes to and subscribes from TMS
  // Applications ↔ TMS (bidirectional pub/sub)
  {
    sourceFilter: { layerId: 'layer-applications' },
    targetId: 'tms',
    defaultLabel: 'Pub/Sub',
    description: 'Applications publish commands and subscribe to data via TMS channels'
  },
  // Sensor Publisher → TMS (sensor data becomes available to all subscribers)
  {
    sourceId: 'sensor-pub',
    targetId: 'tms',
    defaultLabel: 'Sensor Channels',
    description: 'Published sensor data available to any TMS subscriber'
  },
  // TMS → Main-to-MCU Service (vehicle control commands)
  {
    sourceId: 'tms',
    targetId: 'main-mcu-svc',
    defaultLabel: 'Nav Commands',
    description: 'Navigation/control commands from TMS to MCU bridge'
  },

  // ── Cloud ↔ Shore ──
  {
    sourceId: 'remote-control',
    targetId: 'c2-station',
    defaultLabel: 'C2',
    description: 'Cloud relays commands to/from shore C2'
  },
  {
    sourceId: 'data-collection',
    targetId: 'c2-station',
    defaultLabel: 'Env Data',
    description: 'Collected data forwarded to shore for analysis'
  },

  // ── Shore ecosystem ──
  // Avalon deploys software to vessels (via cloud)
  {
    sourceId: 'avalon',
    targetId: 'remote-control',
    defaultLabel: 'SW Packages',
    description: 'Avalon pushes software updates and configurations to vessels via cloud relay'
  },
  // Avalon connects to C2 for mission deployment
  {
    sourceId: 'avalon',
    targetId: 'c2-station',
    defaultLabel: 'Deployment',
    description: 'Avalon deploys configurations from Mission Bay to C2 for vessel assignment'
  }
];

// ──────────────────────────────────────────
// Compute Layer Templates (per hull type)
// ──────────────────────────────────────────
// Maps hull types to their compute hardware representation.
// Falls back to a generic compute node if hull not recognized.

export const COMPUTE_TEMPLATES = {
  'SubSeaSail Horus': {
    subgroups: [
      { id: 'sg-horus-main', label: 'Horus Main Domain', color: '#c8d8eb' },
      { id: 'sg-mcu', label: 'MCU', color: '#c8d8eb' }
    ],
    components: [
      { id: 'arm-a53', label: '4x ARM A53', subgroupId: 'sg-horus-main' },
      { id: 'ram', label: 'RAM', subgroupId: 'sg-horus-main' },
      { id: 'storage', label: 'Storage', subgroupId: 'sg-horus-main' },
      { id: 'mcu-arm-1', label: '1x ARM', subgroupId: 'sg-mcu' },
      { id: 'mcu-arm-2', label: '1x ARM', subgroupId: 'sg-mcu' }
    ],
    edges: [
      { sourceId: 'main-mcu-svc', targetId: 'arm-a53', label: 'Nav Commands' },
      { sourceId: 'sensor-pub', targetId: 'storage', label: 'Env Data' },
      { sourceId: 'ram', targetId: 'storage', label: 'Sensor Logs' },
      { sourceId: 'arm-a53', targetId: 'mcu-arm-1', label: 'Vehicle Control' }
    ]
  },
  '_default': {
    subgroups: [],
    components: [
      { id: 'onboard-compute', label: 'Onboard Compute', subgroupId: null },
      { id: 'storage', label: 'Storage', subgroupId: null }
    ],
    edges: [
      { sourceId: 'main-mcu-svc', targetId: 'onboard-compute', label: 'Commands' },
      { sourceId: 'sensor-pub', targetId: 'storage', label: 'Data' }
    ]
  }
};

// ──────────────────────────────────────────
// Layout Constants
// ──────────────────────────────────────────

export const LAYOUT = {
  diagramWidth: 900,
  layerGap: 10,              // px between layers
  layerPaddingX: 40,         // left padding for components within layers
  layerPaddingY: 20,         // top padding
  subgroupPaddingX: 30,      // left padding within subgroups
  subgroupPaddingY: 35,      // top padding (room for label)
  componentWidth: 150,
  componentHeight: 45,
  componentGapX: 20,
  componentGapY: 15,
  componentsPerRow: 3        // max components per row in auto-layout
};

/**
 * Get the external interface components for a generated SV-2.
 * These are the connection points for swarm-level composition.
 *
 * @param {object} sv2Data - Generated SV-2 data (layers, components, edges)
 * @returns {Array<{ id: string, label: string, layerId: string, type: 'comms'|'c2'|'ew' }>}
 */
export const getExternalInterfaces = (sv2Data) => {
  if (!sv2Data?.components) return [];
  return sv2Data.components
    .filter(c => c.externalInterface)
    .map(c => ({
      id: c.id,
      label: c.label,
      layerId: c.layerId || c.subgroupId,
      type: c.subgroupId === 'sg-radios' ? 'comms' :
            c.subgroupId === 'sg-ew' ? 'ew' : 'c2'
    }));
};
