/**
 * Version Snapshot Utilities
 *
 * Creates immutable, self-contained snapshots of a configuration at a point in time.
 * Snapshots pin software versions from the catalog so they're independent of future updates.
 *
 * GIT ANALOGY: A snapshot is the "tree" content of a git commit.
 * The version store wraps it with metadata (parent, message, timestamp) = the commit object.
 */

import { getCatalogEntry } from '../data/softwareCatalog';
import { generateSBOMFromActiveConfig } from './sbomGenerator';
import { resolveSV2 } from './sv2AutoGenerator';
import { sv2DataToFlowchart } from './sv2MermaidGenerator';

/**
 * Create a frozen snapshot of the current configuration state.
 * Pins all software versions at the current moment.
 *
 * @param {object} activeConfig - from configurationStore (slots, name, hullName, etc.)
 * @param {string} hullName - vessel hull name
 * @param {object} sv2Customizations - any user SV-2 edits from sv2Store (optional)
 * @returns {object} Self-contained snapshot
 */
export const snapshotCurrentConfig = (activeConfig, hullName, sv2Customizations = null) => {
  if (!activeConfig) return null;

  // 1. Freeze the slot state
  const slots = {};
  Object.entries(activeConfig.slots || {}).forEach(([category, slotArray]) => {
    slots[category] = [...(slotArray || [])];
  });

  // 2. Pin software versions from the catalog at this moment
  const softwareManifest = buildSoftwareManifest(slots);

  // 3. Generate SBOM snapshot
  const sbomSnapshot = generateSBOMFromActiveConfig(activeConfig, hullName);

  // 4. Generate SV-2 snapshot (Mermaid source)
  let sv2Snapshot = null;
  try {
    const sv2Data = resolveSV2(activeConfig, hullName);
    if (sv2Data) {
      sv2Snapshot = {
        mermaidSource: sv2DataToFlowchart(sv2Data),
        componentCount: sv2Data.components?.length || 0,
        edgeCount: sv2Data.edges?.length || 0,
        layerCount: sv2Data.layers?.length || 0,
        customizations: sv2Customizations || null
      };
    }
  } catch { /* SV-2 generation is optional — don't block snapshot */ }

  return {
    name: activeConfig.name || 'Untitled',
    hullName: hullName || activeConfig.hullName || '',
    squadronId: activeConfig.squadronId || null,
    slots,
    softwareManifest,
    sbomSnapshot,
    sv2Snapshot,
    equippedCount: countEquipped(slots),
    categories: summarizeCategories(slots)
  };
};

/**
 * Build a software manifest by resolving all equipped capabilities + baseline
 * platform components to their current catalog versions.
 *
 * @param {object} slots - { SENSORS: [capName, ...], COMMS: [...], ... }
 * @returns {object} { componentName: version, ... }
 */
const buildSoftwareManifest = (slots) => {
  const manifest = {};

  // Always include TempestOS core platform
  const coreComponents = ['TempestOS Core', 'MOOSDB', 'pHelmIvP', 'pMarinePID', 'pLogger'];
  coreComponents.forEach(name => {
    const entry = getCatalogEntry(name);
    if (entry.version !== 'Unknown') {
      manifest[name] = entry.version;
    }
  });

  // Pin versions for all equipped capabilities
  Object.values(slots).forEach(slotArray => {
    (slotArray || []).forEach(capName => {
      if (!capName) return;
      const entry = getCatalogEntry(capName);
      manifest[capName] = entry.version;

      // Also pin direct dependencies
      (entry.dependencies || []).forEach(dep => {
        const depEntry = getCatalogEntry(dep);
        if (depEntry.version !== 'Unknown') {
          manifest[dep] = depEntry.version;
        }
      });
    });
  });

  return manifest;
};

/**
 * Count total equipped capabilities across all slots.
 */
const countEquipped = (slots) => {
  let count = 0;
  Object.values(slots).forEach(arr => {
    (arr || []).forEach(v => { if (v) count++; });
  });
  return count;
};

/**
 * Summarize which categories have equipped capabilities.
 * Returns { SENSORS: 2, COMMS: 1, ... } (only non-zero)
 */
const summarizeCategories = (slots) => {
  const summary = {};
  Object.entries(slots).forEach(([cat, arr]) => {
    const count = (arr || []).filter(Boolean).length;
    if (count > 0) summary[cat] = count;
  });
  return summary;
};

/**
 * Generate a content hash for a snapshot (for deduplication).
 * Two identical configurations produce the same hash.
 */
export const hashSnapshot = (snapshot) => {
  const content = JSON.stringify({
    slots: snapshot.slots,
    manifest: snapshot.softwareManifest
  });
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash |= 0;
  }
  return `snap_${Math.abs(hash).toString(36)}`;
};
