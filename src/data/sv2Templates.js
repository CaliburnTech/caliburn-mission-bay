// SV-2 Architecture Templates
// Pre-built system resource flow diagrams that users can modify

export const sv2Templates = {

  // SSS ANTX Coastal Trident — Mission Bay Configuration
  "ANTX_HORUS": {
    name: "SSS ANTX System Resource Flow",
    description: "SubSeaSail — ANTX Coastal Trident Mission Bay Configuration",

    matchRules: [
      { configName: 'antx' },
      { configName: 'horus' },
      { configName: 'metoc' },
      { hullName: 'subseasail' }
    ],

    // ── Layers (top → bottom) ─────────────────────────────────────────────────
    layers: [
      {
        id: "layer-shore",
        label: "Shore Environments",
        color: "#ecd5e3",
        y: 0,
        height: 175
      },
      {
        id: "layer-hardware",
        label: "Mission Bay Hardware",
        color: "#d4e4f7",
        y: 195,
        height: 315
      },
      {
        id: "layer-software",
        label: "Mission Bay Software",
        color: "#d8edd9",
        y: 530,
        height: 155
      },
      {
        id: "layer-tempestos",
        label: "TempestOS & Services",
        color: "#fde8c8",
        y: 705,
        height: 390
      }
    ],

    // ── Subgroups ─────────────────────────────────────────────────────────────
    subgroups: [
      {
        id: "sg-nobus",
        layerId: "layer-shore",
        label: "Nobus",
        x: 10,
        y: 15,
        width: 225,
        height: 120,
        color: "#f0e0f0"
      },
      // Edit 1: renamed 'Radios' → 'Comms'
      {
        id: "sg-comms",
        layerId: "layer-hardware",
        label: "Comms",
        x: 10,
        y: 10,
        width: 290,
        height: 280,
        color: "#c8d8eb"
      },
      {
        id: "sg-sensing",
        layerId: "layer-hardware",
        label: "Sensing",
        x: 315,
        y: 10,
        width: 265,
        height: 280,
        color: "#c8d8eb"
      },
      {
        id: "sg-mcu-enclave",
        layerId: "layer-hardware",
        label: "MCU Enclave",
        x: 597,
        y: 10,
        width: 288,
        height: 280,
        color: "#f0d4d4"
      }
    ],

    // ── Components ────────────────────────────────────────────────────────────
    components: [

      // Shore Environments (Shore IS the cloud-connected ops environment)
      { id: "tak-server",     label: "TAK Server",     subgroupId: "sg-nobus",  x: 22,  y: 32, width: 178, height: 55 },
      { id: "merlin",         label: "Merlin\nCloud Platform", layerId: "layer-shore", x: 250, y: 15, width: 200, height: 140 },
      { id: "drawbridge-hub", label: "Drawbridge Hub", layerId: "layer-shore",  x: 465, y: 22, width: 165, height: 110 },
      { id: "observer-user",  label: "Observer User",  layerId: "layer-shore",  x: 665, y: 20, width: 155, height: 50 },
      { id: "command-user",   label: "Command User",   layerId: "layer-shore",  x: 665, y: 90, width: 155, height: 50 },

      // Hardware — Comms (Edit 1: subgroupId updated)
      { id: "los-radio", label: "LOS Radio\nDoodle OEM Mini RM-1700-22M3",  subgroupId: "sg-comms", x: 15, y: 28,  width: 258, height: 65 },
      { id: "satcom",    label: "SATCOM\nOrbCom - arch TBD pending Adrian",  subgroupId: "sg-comms", x: 15, y: 115, width: 258, height: 65 },

      // Hardware — Sensing
      { id: "gps",           label: "GPS\nNMEA0183 + Antennae", subgroupId: "sg-sensing", x: 12, y: 28,  width: 240, height: 65 },
      { id: "other-sensors", label: "Other Sensors",             subgroupId: "sg-sensing", x: 12, y: 115, width: 240, height: 65 },

      // Hardware — MCU Enclave
      { id: "automated-piloting", label: "Automated Piloting",             subgroupId: "sg-mcu-enclave", x: 55, y: 55,  width: 178, height: 52 },
      { id: "rc-boat",            label: "RC Boat\nManual Direct Control", subgroupId: "sg-mcu-enclave", x: 55, y: 165, width: 178, height: 52 },

      // Mission Bay Software
      { id: "moos-ivp", label: "MOOS IvP\nNavigation Autonomy", layerId: "layer-software", x: 350, y: 42, width: 235, height: 70 },

      // TempestOS — Row 1
      // Edit 3: 'Comms Interface' → 'Comms Manager'
      { id: "comms-interface", label: "Comms Manager\nRadio/SATCOM",       layerId: "layer-tempestos", x: 20,  y: 25, width: 168, height: 62 },
      { id: "cot-interface",   label: "CoT Interface\nJSON/XML",            layerId: "layer-tempestos", x: 208, y: 25, width: 168, height: 62 },
      { id: "tms",             label: "Tempest Messaging\nService (TMS)",   layerId: "layer-tempestos", x: 396, y: 25, width: 188, height: 62 },
      { id: "nmea-interface",  label: "NMEA 0183\nInterface",               layerId: "layer-tempestos", x: 608, y: 25, width: 148, height: 62 },
      { id: "hal",             label: "HAL",                                layerId: "layer-tempestos", x: 776, y: 25, width: 104, height: 62 },

      // TempestOS — Row 2
      { id: "drawbridge",    label: "Drawbridge Edge\nResilient transport layer", layerId: "layer-tempestos", x: 20,  y: 125, width: 168, height: 62 },
      { id: "tak-client",    label: "TAK Client\nEdge/TempestOS",                 layerId: "layer-tempestos", x: 208, y: 125, width: 168, height: 62 },
      { id: "sss-interface", label: "SSS Interface",                              layerId: "layer-tempestos", x: 776, y: 125, width: 104, height: 62 },

      // TempestOS — Row 3: OWL radio adapters (stacked left so west-channel wires are short)
      // OWLs bridge Drawbridge Hub (shore) ↔ Comms Manager (TempestOS)
      // OrbOwl = OrbCom satellite adapter, DoodleOwl = LoS radio adapter
      { id: "orb-owl",    label: "OrbOwl\nSATCOM adapter",   layerId: "layer-tempestos", x: 20,  y: 235, width: 168, height: 55 },
      { id: "doodle-owl", label: "DoodleOwl\nLoS adapter",   layerId: "layer-tempestos", x: 20,  y: 303, width: 168, height: 55 }
    ],

    // ── Edges ─────────────────────────────────────────────────────────────────
    //
    // Routing strategy:
    //   • West channel (route:'west'): ONLY for truly long cross-layer spans that
    //     cannot be routed without cutting through 3+ layers of content.
    //     Currently: OWL ↔ Drawbridge Hub (TempestOS → Shore, 4-layer span).
    //     Lanes 0 and 1 (x=138, 146) — just 2 thin lines in the label column.
    //
    //   • Right-side arcs (arcOffset): same-layer going-up feedback paths.
    //     arcOffset staggers them so they don't overlap: 0→1132, 1→1160, 2→1188.
    //
    //   • Standard bezier: all other cross-layer connections (≤2-layer spans).
    //     Fan-in/fan-out spreading keeps same-source or same-target edges apart.
    //
    edges: [

      // Cloud ↔ Shore
      { source: "tak-server", target: "merlin", label: "Mission data", bidirectional: true },

      // Shore internal (horizontal auto-route)
      { source: "tak-server",   target: "observer-user", label: "Readout, CoT" },
      { source: "command-user", target: "tak-server",    label: "Waypoints/commands" },

      // LOS Radio / SATCOM → Comms Manager.
      // C2 flows through TempestOS (Radio → Comms Manager → CoT → TAK Client →
      // Drawbridge → Shore), so no direct Radio↔TAK Server edge is needed.
      // Going DOWN from Hardware to TempestOS, these beziers exit the bottom of
      // each radio, pass through empty space in the lower Comms subgroup, cross
      // the Software layer left of MOOS IvP, and enter Comms Manager cleanly.
      { source: "los-radio", target: "comms-interface", label: "LOS radio" },
      { source: "satcom",    target: "comms-interface", label: "CoT/JSON" },

      // Sensing → TempestOS (cross-layer, right side — standard bezier)
      { source: "gps",           target: "nmea-interface", label: "NMEA0183" },
      { source: "other-sensors", target: "tms",            label: "Sensor data" },

      // MOOS-IvP ↔ TMS (bidirectional, 1-layer span)
      { source: "moos-ivp", target: "tms", label: "Pub / Sub", bidirectional: true },

      // TempestOS Row 1 chain (horizontal)
      { source: "comms-interface", target: "cot-interface" },
      { source: "cot-interface",   target: "tms" },
      { source: "nmea-interface",  target: "tms" },

      // CoT Interface → Automated Piloting (cross-layer TempestOS → Hardware MCU Enclave)
      { source: "cot-interface", target: "automated-piloting", label: "CoT commands" },

      // TMS → TAK Client (TMS publishes CoT/SA; TAK Client formats and forwards
      // to TAK Server via the Drawbridge resilient transport).
      { source: "tms", target: "tak-client", label: "CoT / SA" },

      // TAK Client → Drawbridge Edge (hands off to resilient transport layer)
      { source: "tak-client", target: "drawbridge", label: "Transport" },

      // SSS Interface (SubSeaSail boat control adapter)
      // ↔ TMS: publishes boat status, subscribes to control commands
      // → RC Boat: direct helm commands (cross-layer TempestOS → Hardware MCU Enclave)
      { source: "sss-interface", target: "tms",     label: "Boat status / cmds", bidirectional: true },
      { source: "sss-interface", target: "rc-boat", label: "Helm control" },

      // Same-layer going UP arcs — all use left-arc, staggered by arcOffset.
      // These hug the LEFT side of the label column (only 8-34px past main content
      // boundary) rather than the right-side arc that sweeps 900px+ across.
      { source: "drawbridge", target: "comms-interface", label: "Relay",      route: 'left-arc', arcOffset: 2 },
      { source: "orb-owl",    target: "comms-interface", bidirectional: true,  route: 'left-arc', arcOffset: 0 },
      { source: "doodle-owl", target: "comms-interface", bidirectional: true,  route: 'left-arc', arcOffset: 1 },

      // OWL ↔ Drawbridge Hub — very long cross-layer (TempestOS → Shore, 4 layers).
      // Layer-boundary bezier: path stays near sCX inside TempestOS, transitions x
      // in the inter-layer gaps, arrives at tCX inside Shore. No west-channel snaking.
      { source: "orb-owl",    target: "drawbridge-hub", label: "SATCOM link", bidirectional: true },
      { source: "doodle-owl", target: "drawbridge-hub", label: "LoS link",    bidirectional: true }
    ]
  }
};

/**
 * Find a matching hand-crafted template using matchRules.
 *
 * @param {string} identifier - config name, hull name, or other string to match
 * @returns {object|null} matching template or null
 */
export const getSV2Template = (identifier) => {
  if (!identifier) return null;
  const lower = identifier.toLowerCase();

  for (const [_key, template] of Object.entries(sv2Templates)) {
    if (!template.matchRules) continue;
    const matches = template.matchRules.some(rule => {
      if (rule.configName && lower.includes(rule.configName)) return true;
      if (rule.hullName   && lower.includes(rule.hullName))   return true;
      return false;
    });
    if (matches) return template;
  }
  return null;
};

export const getAvailableTemplates = () => Object.keys(sv2Templates);
