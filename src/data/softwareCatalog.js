// Software component catalog for SBOM generation and SV-2 diagrams
// Each entry enriches loadout component names with version, license, supplier,
// dependencies, and interface/data-flow metadata for SV-2 generation.

import { individualCapabilities, engineeringStacks } from './marketplaceData';

export const softwareCatalog = {
  // ============ CORE PLATFORM ============
  "TempestOS Core": {
    componentName: "TempestOS Core Platform",
    version: "3.2.1",
    supplier: "Caliburn",
    license: "Proprietary / DFARS 252.227-7014",
    purl: "pkg:generic/caliburn/tempestos@3.2.1",
    category: "Operating System",
    description: "Bootable container (bootc) based maritime OS with atomic, read-only filesystem. RHEL build model, heavily debloated, STIG'd and SELinux enforcing by default. Podman container runtime, KVM virtualization (installed if needed). Containerized apps run via K8s or systemd.",
    protocols: ["NMEA 0183", "CAN", "STANAG 4817", "MAVLink", "Protobuf"],
    dependencies: ["Podman 4.8", "NATS JetStream", "KVM Hypervisor"],
    interfaces: {},
    dataFlows: {}
  },

  "NSYTE Autonomy": {
    componentName: "NSYTE AI Maintenance System",
    version: "2.4.0",
    supplier: "Fathom5",
    license: "Proprietary / Navy CBM+ Program of Record",
    purl: "pkg:generic/fathom5/nsyte@2.4.0",
    category: "AI / Predictive Maintenance",
    description: "Condition-based maintenance plus (CBM+) AI system. Deployed on USS Fitzgerald (DDG-62).",
    protocols: [],
    dependencies: ["TempestOS Core"],
    interfaces: {},
    dataFlows: {}
  },

  // ============ TAK ECOSYSTEM ============
  "Cloud TAK": {
    componentName: "TAK Server (Cloud Instance)",
    version: "4.10.0",
    supplier: "TAK Product Center / DoD",
    license: "Government Purpose Rights",
    purl: "pkg:generic/tak/cloud-tak-server@4.10.0",
    category: "C2 Software",
    description: "Cloud-hosted TAK server providing common operational picture and mission management.",
    protocols: ["CoT (Cursor on Target)", "TAK Protocol"],
    dependencies: ["PostgreSQL 15", "Java 17 (OpenJDK)"],
    interfaces: {
      upstream: ["Operator / TAK Web App"],
      downstream: ["Vehicle TAK"]
    },
    dataFlows: {
      "Operator / TAK Web App": { receive: "Loiter waypoint + radius, Mission/waypoint data", send: "Web GUI display, COP updates, Position/track updates" },
      "Vehicle TAK": { receive: "Position reports, Vehicle telemetry, Alert messages", send: "Mission/waypoint data, Command data" }
    }
  },

  "Vehicle TAK": {
    componentName: "Vehicle TAK Client",
    version: "4.10.0",
    supplier: "TAK Product Center / DoD",
    license: "Government Purpose Rights",
    purl: "pkg:generic/tak/vehicle-tak@4.10.0",
    category: "C2 Software",
    description: "On-vehicle TAK client providing CoT message relay and local situational awareness.",
    protocols: ["CoT (Cursor on Target)", "TAK Protocol"],
    dependencies: ["Java 17 (OpenJDK)"],
    interfaces: {
      upstream: ["Cloud TAK"],
      downstream: ["TMS"]
    },
    dataFlows: {
      "Cloud TAK": { receive: "Mission/waypoint data, Command data", send: "Position reports, Vehicle telemetry, Alert messages" },
      "TMS": { receive: "Environmental sensor data, Vehicle telemetry", send: "Forward command as CoT message" }
    }
  },

  // ============ VEHICLE SOFTWARE STACK ============
  "TMS": {
    componentName: "TempestOS Messaging Service (TMS)",
    version: "2.1.0",
    supplier: "Caliburn",
    license: "Proprietary / DFARS 252.227-7014",
    purl: "pkg:generic/caliburn/tms@2.1.0",
    category: "Middleware",
    description: "Integration layer running as containerized services. Built on Protobuf + NATS JetStream for scalable pub/sub messaging. Handles conversions between proprietary messages and protocol standards (CAN, NMEA 0183, STANAG 4817). Payloads subscribe and produce data on stateful, topic-based streams.",
    protocols: ["Protobuf", "NATS JetStream", "NMEA 0183", "CAN", "STANAG 4817", "MAVLink", "CoT"],
    dependencies: ["TempestOS Core", "NATS JetStream"],
    interfaces: {
      upstream: ["Vehicle TAK", "Sensors", "Remote Control"],
      downstream: ["HAL", "MOOS-IvP", "Notification Service"]
    },
    dataFlows: {
      "Vehicle TAK": { receive: "Forward command as CoT message", send: "Environmental sensor data, Vehicle telemetry" },
      "HAL": { receive: "Control interface, GPS position/vehicle state", send: "Autonomy command, Vehicle control command" },
      "MOOS-IvP": { receive: "Track/autonomy status, Navigation + state data", send: "Intended navigation track" },
      "Sensors": { receive: "Environmental sensor data, Startup/manual control inputs" },
      "Remote Control": { receive: "Command data" },
      "Notification Service": { send: "Notification trigger" }
    }
  },

  "HAL": {
    componentName: "Hardware Abstraction Layer (HAL)",
    version: "1.0.3",
    supplier: "Caliburn / Vehicle OEM",
    license: "Proprietary",
    purl: "pkg:generic/caliburn/hal@1.0.3",
    category: "Hardware Interface",
    description: "Abstraction layer between autonomy software and physical vehicle actuators/sensors.",
    protocols: ["Serial", "CAN Bus", "GPIO"],
    dependencies: ["TempestOS Core"],
    interfaces: {
      upstream: ["TMS"],
      downstream: ["HORUS Vehicle"]
    },
    dataFlows: {
      "TMS": { receive: "Autonomy command, Vehicle control command", send: "Control interface, GPS position/vehicle state" },
      "HORUS Vehicle": { receive: "GPS position/vehicle state, Telemetry/status", send: "Vehicle control command" },
      "Radios / SATCOM / RF": { receive: "Two-way comms link" }
    }
  },

  "MOOS-IvP": {
    componentName: "MOOS-IvP Autonomy Engine",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/moos-ivp@22.8",
    category: "Autonomy / Navigation",
    description: "Multi-objective optimization through interval programming. Provides behavior-based autonomous navigation (BHV_Loiter, BHV_Waypoint, etc.).",
    protocols: ["MOOS key/value (MOOSDB)"],
    dependencies: ["MOOSDB", "pHelmIvP", "pMarinePID", "pLogger"],
    interfaces: {
      upstream: ["TMS"],
      downstream: ["TMS"]
    },
    dataFlows: {
      "TMS": { receive: "Intended navigation track", send: "Track/autonomy status, Navigation + state data" }
    }
  },

  "MOOS-IvP Autonomous Navigation": {
    componentName: "MOOS-IvP Autonomy Engine",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/moos-ivp@22.8",
    category: "Autonomy / Navigation",
    description: "MOOS-IvP behavior-based autonomous navigation.",
    protocols: ["MOOS key/value (MOOSDB)"],
    dependencies: ["MOOSDB", "pHelmIvP", "pMarinePID", "pLogger"],
    interfaces: { upstream: ["TMS"], downstream: ["TMS"] },
    dataFlows: {}
  },

  "BHV_Loiter Behavior": {
    componentName: "BHV_Loiter (MOOS-IvP Behavior)",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/bhv-loiter@22.8",
    category: "Autonomy / Navigation",
    description: "Loiter behavior: calculates 8 polygon vertices from center + radius, iterates waypoints.",
    protocols: ["MOOS key/value"],
    dependencies: ["MOOS-IvP"],
    interfaces: {},
    dataFlows: {}
  },

  // ============ MOOS-IvP SUBCOMPONENTS ============
  "MOOSDB": {
    componentName: "MOOSDB (Message Broker)",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/moosdb@22.8",
    category: "Middleware",
    description: "Central publish/subscribe database for MOOS community messages.",
    protocols: ["MOOS key/value"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "pHelmIvP": {
    componentName: "pHelmIvP (Behavior Engine)",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/phelmivp@22.8",
    category: "Autonomy / Navigation",
    description: "Multi-objective behavior coordination via interval programming. Computes DESIRED_HEADING, DESIRED_SPEED.",
    protocols: ["MOOS key/value"],
    dependencies: ["MOOSDB"],
    interfaces: {},
    dataFlows: {}
  },

  "pMarinePID": {
    componentName: "pMarinePID (PID Controller)",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/pmarinepid@22.8",
    category: "Vehicle Control",
    description: "PID controller converting DESIRED_HEADING/SPEED to DESIRED_RUDDER/THRUST.",
    protocols: ["MOOS key/value"],
    dependencies: ["MOOSDB"],
    interfaces: {},
    dataFlows: {}
  },

  "pLogger": {
    componentName: "pLogger (Data Logger)",
    version: "22.8",
    supplier: "MIT / Oxford",
    license: "GPL v3",
    purl: "pkg:generic/moos-ivp/plogger@22.8",
    category: "Data Recording",
    description: "Logs all MOOS variables to .alog file for post-mission analysis.",
    protocols: ["MOOS key/value"],
    dependencies: ["MOOSDB"],
    interfaces: {},
    dataFlows: {}
  },

  // ============ COMMS & SERVICES ============
  "Notification Service": {
    componentName: "Notification Service / Alerting",
    version: "1.2.0",
    supplier: "Caliburn",
    license: "Proprietary",
    purl: "pkg:generic/caliburn/notification-service@1.2.0",
    category: "Services",
    description: "Geofence breach detection and TAK notification dispatch.",
    protocols: ["CoT", "WebSocket"],
    dependencies: ["TMS"],
    interfaces: { upstream: ["TMS"] },
    dataFlows: { "TMS": { receive: "Notification trigger" } }
  },

  "Remote Control": {
    componentName: "Remote Control Interface",
    version: "1.0.0",
    supplier: "Caliburn",
    license: "Proprietary",
    purl: "pkg:generic/caliburn/remote-control@1.0.0",
    category: "C2 Software",
    description: "Manual RC override and startup control inputs for vehicle.",
    protocols: ["Serial", "RF"],
    dependencies: [],
    interfaces: { downstream: ["TMS"] },
    dataFlows: { "TMS": { send: "Command data, Startup/manual control inputs" } }
  },

  "Sensors": {
    componentName: "Sensor Data Aggregator",
    version: "1.0.0",
    supplier: "Vehicle OEM",
    license: "Proprietary",
    purl: "pkg:generic/vehicle/sensors@1.0.0",
    category: "Sensor Interface",
    description: "Aggregates environmental sensor data (METOC, GPS, IMU) into TMS.",
    protocols: ["NMEA", "I2C", "SPI"],
    dependencies: [],
    interfaces: { downstream: ["TMS"] },
    dataFlows: { "TMS": { send: "Environmental sensor data" } }
  },

  // ============ COMMON LOADOUT SOFTWARE ============
  "Precision INS/GPS": {
    componentName: "Precision INS/GPS Navigation Module",
    version: "5.1.0",
    supplier: "Trimble",
    license: "Commercial",
    purl: "pkg:generic/trimble/ins-gps@5.1.0",
    category: "Navigation",
    description: "Military-grade inertial navigation with GPS anti-jamming.",
    protocols: ["NMEA 0183", "NMEA 2000"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Multi-Constellation GNSS": {
    componentName: "Multi-Constellation GNSS Receiver",
    version: "3.0.0",
    supplier: "u-blox",
    license: "Commercial",
    purl: "pkg:generic/ublox/gnss@3.0.0",
    category: "Navigation",
    description: "GPS + GLONASS + Galileo + BeiDou receiver for robust positioning.",
    protocols: ["NMEA 0183", "UBX"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Precision Navigation": {
    componentName: "Precision Navigation Suite",
    version: "2.0.0",
    supplier: "Various",
    license: "Commercial",
    purl: "pkg:generic/nav/precision-nav@2.0.0",
    category: "Navigation",
    description: "Integrated navigation with INS/GPS and heading reference.",
    protocols: ["NMEA 0183"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Inertial Navigation": {
    componentName: "Inertial Navigation System",
    version: "4.2.0",
    supplier: "Honeywell",
    license: "Commercial",
    purl: "pkg:generic/honeywell/ins@4.2.0",
    category: "Navigation",
    description: "Ring laser gyro INS for GPS-denied subsurface navigation.",
    protocols: ["NMEA 0183", "RS-422"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Terrain Following": {
    componentName: "Terrain Following Sonar",
    version: "1.5.0",
    supplier: "Kongsberg",
    license: "Commercial",
    purl: "pkg:generic/kongsberg/terrain-follow@1.5.0",
    category: "Navigation",
    description: "Bottom-following sonar for UUV depth management.",
    protocols: ["RS-232"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  // ============ INFRASTRUCTURE DEPENDENCIES ============
  "AlmaLinux 9.3": {
    componentName: "AlmaLinux",
    version: "9.3",
    supplier: "AlmaLinux OS Foundation",
    license: "GPL v2",
    purl: "pkg:generic/almalinux/almalinux@9.3",
    category: "Operating System",
    description: "RHEL-compatible enterprise Linux distribution.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "NATS JetStream": {
    componentName: "NATS JetStream",
    version: "2.10",
    supplier: "Synadia / CNCF",
    license: "Apache 2.0",
    purl: "pkg:generic/nats-io/nats-server@2.10",
    category: "Messaging",
    description: "Persistent, exactly-once delivery messaging backbone for TMS. Provides stateful, topic-based streams with replay capability. Handles pub/sub between all TMS producers and consumers.",
    protocols: ["NATS Protocol", "JetStream API"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Kubernetes 1.28": {
    componentName: "Kubernetes",
    version: "1.28",
    supplier: "CNCF",
    license: "Apache 2.0",
    purl: "pkg:generic/cncf/kubernetes@1.28",
    category: "Container Orchestration",
    description: "Container orchestration for TempestOS containerized services. Apps can alternatively run via systemd.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Podman 4.8": {
    componentName: "Podman",
    version: "4.8",
    supplier: "Red Hat",
    license: "Apache 2.0",
    purl: "pkg:generic/redhat/podman@4.8",
    category: "Container Runtime",
    description: "Daemonless container engine for rootless containers.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "KVM Hypervisor": {
    componentName: "KVM (Kernel-based Virtual Machine)",
    version: "6.5",
    supplier: "Linux Foundation",
    license: "GPL v2",
    purl: "pkg:generic/linux/kvm@6.5",
    category: "Virtualization",
    description: "Hardware-assisted virtualization in Linux kernel.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "PostgreSQL 15": {
    componentName: "PostgreSQL",
    version: "15.5",
    supplier: "PostgreSQL Global Development Group",
    license: "PostgreSQL License (MIT-like)",
    purl: "pkg:generic/postgresql/postgresql@15.5",
    category: "Database",
    description: "TAK Server backend database.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Java 17 (OpenJDK)": {
    componentName: "OpenJDK",
    version: "17.0.9",
    supplier: "Eclipse Adoptium",
    license: "GPL v2 + Classpath Exception",
    purl: "pkg:generic/adoptium/openjdk@17.0.9",
    category: "Runtime",
    description: "Java runtime for TAK Server and Vehicle TAK.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  "Java 17": {
    componentName: "OpenJDK",
    version: "17.0.9",
    supplier: "Eclipse Adoptium",
    license: "GPL v2 + Classpath Exception",
    purl: "pkg:generic/adoptium/openjdk@17.0.9",
    category: "Runtime",
    description: "Java runtime for TAK Server and Vehicle TAK.",
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  },

  // ============ COMMS HARDWARE/SOFTWARE ============
  "Doodle Radio Link": {
    componentName: "Doodle Labs Mesh Radio",
    version: "3.4.0",
    supplier: "Doodle Labs",
    license: "Commercial",
    purl: "pkg:generic/doodlelabs/mesh-radio@3.4.0",
    category: "Communications",
    description: "Long-range mesh radio providing RF data link to base station.",
    protocols: ["IP Mesh", "MANET"],
    dependencies: [],
    interfaces: { upstream: ["HORUS Vehicle"], downstream: ["San Nicolas Ground Station"] },
    dataFlows: {}
  },

  "Starlink Terminal": {
    componentName: "Starlink Maritime Terminal",
    version: "2024.1",
    supplier: "SpaceX",
    license: "Commercial Service Agreement",
    purl: "pkg:generic/spacex/starlink-maritime@2024.1",
    category: "Communications",
    description: "LEO satellite internet providing high-bandwidth backhaul to home base.",
    protocols: ["IP"],
    dependencies: [],
    interfaces: { upstream: ["San Nicolas Ground Station"], downstream: ["Oxnard Home Base"] },
    dataFlows: {}
  },

  // ============ VEHICLE REPRESENTATION ============
  "HORUS Vehicle": {
    componentName: "SubSeaSail HORUS AUSV",
    version: "TRL 9",
    supplier: "SubSeaSail, Inc.",
    license: "Proprietary",
    purl: "pkg:generic/subseasail/horus@1.0",
    category: "Vehicle Platform",
    description: "Autonomous Undersea and Surface Vehicle. 100% energy harvesting, solar + LiFePO4, submersible.",
    protocols: ["Serial", "CAN Bus"],
    dependencies: [],
    interfaces: { upstream: ["HAL"] },
    dataFlows: { "HAL": { receive: "Vehicle control command", send: "GPS position/vehicle state, Telemetry/status" } }
  },

  "Radios / SATCOM / RF": {
    componentName: "Radio Communications Suite",
    version: "1.0.0",
    supplier: "Various",
    license: "Commercial",
    purl: "pkg:generic/comms/radio-suite@1.0.0",
    category: "Communications",
    description: "Satellite and RF radio equipment for two-way comms.",
    protocols: ["SATCOM", "RF", "IP"],
    dependencies: [],
    interfaces: {
      upstream: ["HAL"],
      downstream: ["San Nicolas Ground Station"]
    },
    dataFlows: {
      "HAL": { receive: "Telemetry/status", send: "Two-way comms link" },
      "San Nicolas Ground Station": { receive: "Forwarded data", send: "Transmit to ground station" }
    }
  },

  "Operator / TAK Web App": {
    componentName: "TAK Web App (Operator Interface)",
    version: "4.10.0",
    supplier: "TAK Product Center / DoD",
    license: "Government Purpose Rights",
    purl: "pkg:generic/tak/web-app@4.10.0",
    category: "User Interface",
    description: "Web-based operator interface for mission command and monitoring.",
    protocols: ["HTTPS", "WebSocket"],
    dependencies: [],
    interfaces: { downstream: ["Cloud TAK"] },
    dataFlows: {
      "Cloud TAK": { send: "Loiter waypoint + radius, Mission/waypoint data", receive: "Web GUI display, COP updates" }
    }
  },

  "San Nicolas Ground Station": {
    componentName: "San Nicolas Island Ground Station",
    version: "N/A",
    supplier: "Naval Base Ventura County",
    license: "Government",
    purl: "pkg:generic/nbvc/sni-ground-station@1.0",
    category: "Infrastructure",
    description: "Base station on high point of San Nicolas Island with Doodle radio and Starlink uplink.",
    protocols: ["IP", "RF"],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  }
};

// Predefined SV-2 system architectures for specific mission profiles
// These define the complete system graph for missions that have known architectures
export const sv2Architectures = {
  "ANTX_HORUS_METOC": {
    name: "ANTX Coastal Trident 2026 - HORUS METOC Architecture",
    description: "SubSeaSail HORUS AUSV system architecture for METOC monitoring at San Nicolas Island",
    systems: [
      "Operator / TAK Web App",
      "Cloud TAK",
      "Vehicle TAK",
      "Remote Control",
      "Sensors",
      "TMS",
      "Notification Service",
      "HAL",
      "MOOS-IvP",
      "HORUS Vehicle",
      "Radios / SATCOM / RF",
      "San Nicolas Ground Station"
    ],
    // Ordered connections for the SV-2 diagram
    connections: [
      { from: "Operator / TAK Web App", to: "Cloud TAK", label: "Mission/waypoint data, CoT messages", bidirectional: true, returnLabel: "COP updates, Position/track updates" },
      { from: "Cloud TAK", to: "Vehicle TAK", label: "Command data, Tasking", bidirectional: true, returnLabel: "Position reports, Vehicle telemetry, Alerts" },
      { from: "Remote Control", to: "TMS", label: "Command data, Manual inputs" },
      { from: "Sensors", to: "TMS", label: "Environmental sensor data" },
      { from: "Vehicle TAK", to: "TMS", label: "Forward command as CoT", bidirectional: true, returnLabel: "Sensor data, Vehicle telemetry" },
      { from: "TMS", to: "Notification Service", label: "Notification trigger (geofence breach)" },
      { from: "TMS", to: "HAL", label: "Autonomy command, Vehicle control", bidirectional: true, returnLabel: "GPS position, Vehicle state" },
      { from: "TMS", to: "MOOS-IvP", label: "Intended navigation track", bidirectional: true, returnLabel: "Track/autonomy status" },
      { from: "HAL", to: "HORUS Vehicle", label: "Vehicle control command", bidirectional: true, returnLabel: "GPS position, Telemetry" },
      { from: "HAL", to: "Radios / SATCOM / RF", label: "Two-way comms link", bidirectional: true },
      { from: "Radios / SATCOM / RF", to: "San Nicolas Ground Station", label: "Forwarded data", bidirectional: true, returnLabel: "Operator connectivity" }
    ]
  }
};

// Helper: get catalog entry, returning a minimal stub if not found.
// Falls back to individualCapabilities / engineeringStacks from the marketplace
// so that capabilities show real supplier/category instead of "Unknown".
export const getCatalogEntry = (name) => {
  if (softwareCatalog[name]) return softwareCatalog[name];

  const marketplaceCap =
    individualCapabilities.find(c => c.name === name) ||
    engineeringStacks.find(s => s.name === name) ||
    null;

  if (marketplaceCap) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    return {
      componentName: name,
      version: marketplaceCap.version || 'Unknown',
      supplier: marketplaceCap.provider || marketplaceCap.supplier || marketplaceCap.manufacturer || 'Unknown',
      license: marketplaceCap.license || 'Proprietary',
      purl: `pkg:generic/${slug}@${marketplaceCap.version || '0.0.0'}`,
      category: marketplaceCap.type || marketplaceCap.category || 'Unknown',
      description: marketplaceCap.description || '',
      protocols: [],
      dependencies: [],
      interfaces: {},
      dataFlows: {}
    };
  }

  return {
    componentName: name,
    version: 'Unknown',
    supplier: 'Unknown',
    license: 'Unknown',
    purl: `pkg:generic/unknown/${name.toLowerCase().replace(/\s+/g, '-')}@0.0.0`,
    category: 'Unknown',
    description: '',
    protocols: [],
    dependencies: [],
    interfaces: {},
    dataFlows: {}
  };
};

// Get all unique software components from a loadout object
export const getComponentsFromLoadout = (loadout) => {
  if (!loadout) return [];
  const softwareCategories = ['AI', 'NAV'];
  const components = new Set();
  for (const cat of softwareCategories) {
    if (loadout[cat]) {
      loadout[cat].forEach(name => components.add(name));
    }
  }
  return [...components];
};

// Get all software components from a mission's profile
export const getComponentsFromMission = (mission) => {
  if (!mission?.missionProfile?.softwareStack) return [];
  return [...mission.missionProfile.softwareStack];
};
