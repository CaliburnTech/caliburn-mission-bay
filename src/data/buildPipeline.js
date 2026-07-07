/**
 * TempestOS Build Pipeline Format
 *
 * A "build pipeline" is the ordered list of packages that must be bundled
 * into a TempestOS bootc image to produce a vessel configuration.
 *
 * Think of it like a Dockerfile layer list: the order matters because later
 * packages can depend on earlier ones. The pipeline is derived from a saved
 * configuration's slot assignments plus the always-present TempestOS core
 * services.
 *
 * FORMAT
 * ──────
 * A pipeline is a JSON array of package descriptor objects:
 *
 * [
 *   { "purl": "pkg:generic/caliburn/tempestos@3.2.1",  "layer": "base",    "required": true },
 *   { "purl": "pkg:generic/caliburn/tms@2.1.0",         "layer": "core",    "required": true },
 *   { "purl": "pkg:generic/caliburn/drawbridge@1.0.0",  "layer": "core",    "required": true },
 *   { "purl": "pkg:generic/caliburn/policy-engine@1.0", "layer": "core",    "required": true },
 *   { "purl": "pkg:generic/caliburn/aop-connector@1.0", "layer": "core",    "required": true },
 *   { "purl": "pkg:generic/moos-ivp/moos-ivp@22.8",     "layer": "payload", "required": false, "slot": "NAV" },
 *   ...
 * ]
 *
 * LAYERS (ordered — base is installed first)
 *   base     — TempestOS OS image (AlmaLinux/bootc, STIG'd)
 *   core     — Always-present TempestOS services (TMS, Drawbridge, Policy Engine, AOP Connector)
 *   payload  — Capability packages equipped via loadout slots (sensors, comms, nav, AI, etc.)
 *
 * FIELDS
 *   purl      — Package URL (PURL spec, matches softwareCatalog.js entries)
 *   layer     — Install layer (controls build order)
 *   required  — true = always included; false = only when slot is filled
 *   slot      — (payload only) the slot category this package satisfies (SENSORS, NAV, etc.)
 *   slotIndex — (payload only) index within that slot category (0-based)
 *   deps      — Optional array of purls this package depends on (for dependency validation)
 *   version   — Explicit version override; if omitted, catalog version is used
 */

import { softwareCatalog } from './softwareCatalog';

// ──────────────────────────────────────────
// Core TempestOS pipeline (always present)
// These are the four canonical TempestOS services plus the base OS.
// ──────────────────────────────────────────

export const TEMPESTOS_CORE_PIPELINE = [
  {
    purl: 'pkg:generic/caliburn/tempestos@3.2.1',
    componentName: 'TempestOS Core Platform',
    layer: 'base',
    required: true,
    description: 'AlmaLinux 9.3 bootc image — atomic read-only filesystem, STIG\'d, SELinux enforcing, Podman runtime'
  },
  {
    purl: 'pkg:generic/caliburn/tms@2.1.0',
    componentName: 'TempestOS Messaging Service (TMS)',
    layer: 'core',
    required: true,
    description: 'Pub/sub backbone — Protobuf + NATS JetStream, protocol conversions (NMEA, CAN, MAVLink, CoT)'
  },
  {
    purl: 'pkg:generic/caliburn/drawbridge@1.0.0',
    componentName: 'Drawbridge',
    layer: 'core',
    required: true,
    description: 'Encrypted DDIL-resilient data bridge — link state management, bandwidth negotiation, protocol relay'
  },
  {
    purl: 'pkg:generic/caliburn/policy-engine@1.0.0',
    componentName: 'Policy Engine',
    layer: 'core',
    required: true,
    description: 'Mission-configured authorization and routing policy — gates all Drawbridge relay decisions'
  },
  {
    purl: 'pkg:generic/caliburn/aop-connector@1.0.0',
    componentName: 'AOP / Avalon Edge Connector',
    layer: 'core',
    required: true,
    description: 'External interface to Autonomous Operations Platform — outbound telemetry, inbound tasking and SW updates'
  }
];

// ──────────────────────────────────────────
// Build a pipeline from a saved configuration
// ──────────────────────────────────────────

/**
 * Generate a build pipeline JSON list from a configuration's slot assignments.
 *
 * @param {object} config - Saved configuration { name, hullName, slots: { SENSORS: [...], NAV: [...], ... } }
 * @returns {Array<object>} Ordered pipeline descriptor list
 */
export const generateBuildPipeline = (config) => {
  const pipeline = [...TEMPESTOS_CORE_PIPELINE];

  const slots = config?.slots || {};

  // Add payload packages from equipped slots, ordered by slot category then index
  const SLOT_ORDER = ['C2', 'NAV', 'AI', 'SENSORS', 'COMMS', 'WEAPONS', 'UTILITY', 'OTHER'];

  SLOT_ORDER.forEach(category => {
    const slotArray = slots[category] || [];
    slotArray.forEach((capName, slotIndex) => {
      if (!capName) return;

      const catalogEntry = softwareCatalog[capName];
      const purl = catalogEntry?.purl || `pkg:generic/unknown/${encodeURIComponent(capName)}@unknown`;

      const entry = {
        purl,
        componentName: catalogEntry?.componentName || capName,
        layer: 'payload',
        required: false,
        slot: category,
        slotIndex
      };

      if (catalogEntry?.dependencies?.length) {
        entry.deps = catalogEntry.dependencies;
      }

      if (catalogEntry?.version) {
        entry.version = catalogEntry.version;
      }

      pipeline.push(entry);
    });
  });

  return pipeline;
};

/**
 * Serialize a pipeline to a JSON string (the wire/file format).
 * This is what gets written to disk or sent to the Avalon build system.
 *
 * @param {object} config - Saved configuration
 * @param {Array<object>} pipeline - Output of generateBuildPipeline()
 * @returns {string} JSON string
 */
export const serializePipeline = (config, pipeline) => {
  const manifest = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    configuration: {
      id: config?.id || null,
      name: config?.name || 'unnamed',
      hullName: config?.hullName || 'unknown'
    },
    pipeline
  };
  return JSON.stringify(manifest, null, 2);
};

/**
 * Example pipeline manifest (what the output JSON looks like):
 *
 * {
 *   "schemaVersion": "1.0",
 *   "generatedAt": "2026-07-06T00:00:00.000Z",
 *   "configuration": {
 *     "id": "cfg-abc123",
 *     "name": "ANTX HORUS METOC",
 *     "hullName": "SubSeaSail Horus"
 *   },
 *   "pipeline": [
 *     { "purl": "pkg:generic/caliburn/tempestos@3.2.1",  "layer": "base",    "required": true, ... },
 *     { "purl": "pkg:generic/caliburn/tms@2.1.0",         "layer": "core",    "required": true, ... },
 *     { "purl": "pkg:generic/caliburn/drawbridge@1.0.0",  "layer": "core",    "required": true, ... },
 *     { "purl": "pkg:generic/caliburn/policy-engine@1.0.0", "layer": "core",  "required": true, ... },
 *     { "purl": "pkg:generic/caliburn/aop-connector@1.0.0","layer": "core",   "required": true, ... },
 *     { "purl": "pkg:generic/moos-ivp/moos-ivp@22.8",     "layer": "payload", "required": false, "slot": "NAV", "slotIndex": 0 },
 *     { "purl": "pkg:generic/fathom5/nsyte@2.4.0",        "layer": "payload", "required": false, "slot": "AI",  "slotIndex": 0 }
 *   ]
 * }
 */
