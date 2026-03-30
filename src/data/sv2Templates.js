// SV-2 Architecture Templates
// Pre-built system resource flow diagrams that users can modify
// Each template defines layers, components within layers, and data flow edges

export const sv2Templates = {
  // ANTX Coastal Trident 2026 - SubSeaSail HORUS METOC
  "ANTX_HORUS": {
    name: "SSS ANTX System Resource Flow",
    description: "SubSeaSail HORUS AUSV — ANTX Coastal Trident 2026 METOC Configuration",

    // Match rules: if any rule matches, this template is used instead of auto-generation
    matchRules: [
      { configName: 'antx' },
      { configName: 'horus' },
      { configName: 'metoc' },
      { hullName: 'subseasail' }
    ],

    // Layers define the colored horizontal bands (top to bottom)
    layers: [
      {
        id: "layer-shore",
        label: "Shore Environments",
        color: "#e8d5e8",
        y: 0,
        height: 200
      },
      {
        id: "layer-cloud",
        label: "SubSeaSail Cloud",
        color: "#fde8c8",
        y: 230,
        height: 130
      },
      {
        id: "layer-equipment",
        label: "Equipment",
        color: "#d4e4f7",
        y: 390,
        height: 280
      },
      {
        id: "layer-applications",
        label: "Applications",
        color: "#d4edda",
        y: 700,
        height: 180
      },
      {
        id: "layer-tempestos",
        label: "TempestOS",
        color: "#e8f5e9",
        y: 910,
        height: 180
      },
      {
        id: "layer-compute",
        label: "Compute",
        color: "#d4e4f7",
        y: 1120,
        height: 180
      }
    ],

    // Sub-groups within layers
    subgroups: [
      {
        id: "sg-avalon",
        layerId: "layer-shore",
        label: "Avalon",
        x: 40,
        y: 20,
        width: 220,
        height: 120,
        color: "#f5f0f5"
      },
      {
        id: "sg-radios",
        layerId: "layer-equipment",
        label: "Radios",
        x: 40,
        y: 20,
        width: 240,
        height: 160,
        color: "#c8d8eb"
      },
      {
        id: "sg-sensing",
        layerId: "layer-equipment",
        label: "Sensing",
        x: 300,
        y: 20,
        width: 560,
        height: 160,
        color: "#c8d8eb"
      },
      {
        id: "sg-horus-main",
        layerId: "layer-compute",
        label: "Horus Main Domain",
        x: 40,
        y: 20,
        width: 520,
        height: 100,
        color: "#c8d8eb"
      },
      {
        id: "sg-mcu",
        layerId: "layer-compute",
        label: "MCU",
        x: 600,
        y: 20,
        width: 220,
        height: 100,
        color: "#c8d8eb"
      }
    ],

    // Components (nodes) placed within layers/subgroups
    components: [
      // Shore Environments
      { id: "tak-server", label: "TAK Server", subgroupId: "sg-avalon", x: 30, y: 35, width: 160, height: 50 },
      { id: "remote-control", label: "Remote Control", layerId: "layer-cloud", x: 100, y: 20, width: 160, height: 40 },
      { id: "data-collection", label: "Data Collection", layerId: "layer-cloud", x: 300, y: 20, width: 160, height: 40 },

      // Equipment - Radios
      { id: "doodle", label: "Doodle", subgroupId: "sg-radios", x: 20, y: 50, width: 90, height: 45 },
      { id: "sat-comm", label: "Sat Comm", subgroupId: "sg-radios", x: 125, y: 50, width: 90, height: 45 },

      // Equipment - Sensors
      { id: "microphone", label: "Microphone", subgroupId: "sg-sensing", x: 20, y: 30, width: 140, height: 45 },
      { id: "water-temp", label: "Water Temperature", subgroupId: "sg-sensing", x: 180, y: 30, width: 160, height: 45 },
      { id: "salinity", label: "Salinity", subgroupId: "sg-sensing", x: 360, y: 30, width: 140, height: 45 },
      { id: "hdg-gps", label: "HDG, GPS", subgroupId: "sg-sensing", x: 20, y: 90, width: 140, height: 45 },
      { id: "anemometer", label: "Anemometer", subgroupId: "sg-sensing", x: 180, y: 90, width: 160, height: 45 },
      { id: "depth-sensor", label: "Depth Sensor", subgroupId: "sg-sensing", x: 360, y: 90, width: 140, height: 45 },

      // Applications
      { id: "tak-mobile", label: 'TAK "Mobile"', layerId: "layer-applications", x: 40, y: 40, width: 140, height: 50 },
      { id: "drawbridge", label: "Drawbridge", layerId: "layer-applications", x: 220, y: 40, width: 160, height: 50 },
      { id: "moos-ivp", label: "MOOS IvP\n(Navigation Autonomy)", layerId: "layer-applications", x: 520, y: 40, width: 200, height: 50 },

      // TempestOS
      { id: "main-mcu-svc", label: "Main to MCU Service", layerId: "layer-tempestos", x: 40, y: 40, width: 180, height: 50 },
      { id: "tms", label: "Tempest Messaging\nService", layerId: "layer-tempestos", x: 280, y: 40, width: 180, height: 50 },
      { id: "sensor-pub", label: "Sensor publisher", layerId: "layer-tempestos", x: 520, y: 40, width: 160, height: 50 },

      // Compute - Horus Main Domain
      { id: "arm-a53", label: "4x ARM A53", subgroupId: "sg-horus-main", x: 20, y: 35, width: 130, height: 45 },
      { id: "ram", label: "RAM", subgroupId: "sg-horus-main", x: 170, y: 35, width: 100, height: 45 },
      { id: "storage", label: "Storage", subgroupId: "sg-horus-main", x: 290, y: 35, width: 130, height: 45 },

      // Compute - MCU
      { id: "mcu-arm-1", label: "1x ARM", subgroupId: "sg-mcu", x: 20, y: 35, width: 80, height: 45 },
      { id: "mcu-arm-2", label: "1x ARM", subgroupId: "sg-mcu", x: 115, y: 35, width: 80, height: 45 }
    ],

    // Edges with labeled data flows
    edges: [
      // Shore → Cloud
      { source: "tak-server", target: "remote-control", label: "C2" },
      { source: "tak-server", target: "data-collection", label: "C2 down, Env Data Up" },

      // Cloud → Equipment
      { source: "remote-control", target: "doodle", label: "RC Commands", style: "dashed" },

      // Equipment → Applications
      { source: "hdg-gps", target: "drawbridge", label: "(NMEA 2000) Lat, Long, HDG" },
      { source: "anemometer", target: "drawbridge", label: "NMEA Wind Speed" },
      { source: "depth-sensor", target: "drawbridge", label: "???, ft" },
      { source: "water-temp", target: "drawbridge", label: "???, F" },
      { source: "salinity", target: "drawbridge", label: "???, psu?" },
      { source: "doodle", target: "tak-mobile", label: "RC Commands" },

      // Applications internal
      { source: "drawbridge", target: "moos-ivp", label: "GPS, HDG, C2" },

      // Applications → TempestOS
      { source: "tak-mobile", target: "tms", label: "C2" },
      { source: "drawbridge", target: "tms", label: "Env Data" },
      { source: "drawbridge", target: "sensor-pub", label: "Env Data" },
      { source: "moos-ivp", target: "main-mcu-svc", label: "Nav Commands" },

      // TempestOS internal
      { source: "tms", target: "main-mcu-svc", label: "Nav Commands" },

      // TempestOS → Compute
      { source: "main-mcu-svc", target: "arm-a53", label: "Nav Commands" },
      { source: "sensor-pub", target: "storage", label: "Env Data" },
      { source: "ram", target: "storage", label: "Sensor Logs\nText" },

      // Compute cross-domain
      { source: "arm-a53", target: "mcu-arm-1", label: "Vehicle Control Behaviors" },

      // MCU Embedded Code (vertical sidebar concept - represented as edge)
      { source: "storage", target: "mcu-arm-2", label: "Env Data" },

      // Equipment outputs upward
      { source: "doodle", target: "tak-server", label: "Env Data" },
      { source: "sat-comm", target: "tak-server", label: "C2" },

      // Sensor to TempestOS direct
      { source: "microphone", target: "sensor-pub", label: "???, dB?" }
    ]
  }
};

/**
 * Find a matching hand-crafted template using matchRules.
 * Accepts a string (config name, hull name, etc.) and checks against all templates.
 *
 * @param {string} identifier - config name, hull name, or other identifier to match
 * @returns {object|null} matching template or null
 */
export const getSV2Template = (identifier) => {
  if (!identifier) return null;
  const lower = identifier.toLowerCase();

  for (const [_key, template] of Object.entries(sv2Templates)) {
    if (!template.matchRules) continue;
    const matches = template.matchRules.some(rule => {
      if (rule.configName && lower.includes(rule.configName)) return true;
      if (rule.hullName && lower.includes(rule.hullName)) return true;
      return false;
    });
    if (matches) return template;
  }
  return null;
};

// Get all available template keys
export const getAvailableTemplates = () => Object.keys(sv2Templates);
