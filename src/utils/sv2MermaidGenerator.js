/**
 * SV-2 Mermaid Source Generator
 *
 * Converts SV-2 data (from resolveSV2 pipeline) into Mermaid architecture
 * diagram source. This is the SINGLE SOURCE OF TRUTH for the diagram —
 * the visual rendering and AI chat both operate on this text.
 *
 * Uses Mermaid's `architecture-beta` diagram type which supports:
 *   - Groups (our layers)
 *   - Services/nodes (our components)
 *   - Labeled edges with directional connections
 */

import { resolveSV2 } from './sv2AutoGenerator';
import { getCatalogEntry } from '../data/softwareCatalog';

/**
 * Generate Mermaid architecture source from a configuration.
 * This is the main entry point.
 */
export const generateMermaidArchitecture = (activeConfig, hullName) => {
  const sv2Data = resolveSV2(activeConfig, hullName);
  if (!sv2Data) return '%%  No diagram data available';
  return sv2DataToMermaid(sv2Data);
};

/**
 * Convert resolved SV-2 data structure to Mermaid architecture syntax.
 */
export const sv2DataToMermaid = (sv2Data) => {
  const lines = [];
  lines.push('architecture-beta');
  lines.push('');
  lines.push(`    %% ${sv2Data.name}`);
  lines.push(`    %% ${sv2Data.description || ''}`);
  lines.push('');

  // Track which components are placed in groups (to avoid duplicates)
  const placedComponents = new Set();

  // Icon mapping for groups
  const groupIcons = {
    'layer-shore': 'cloud',
    'layer-cloud': 'cloud',
    'layer-missionbay': 'server',
    'layer-equipment': 'disk',
    'layer-applications': 'server',
    'layer-tempestos': 'disk',
    'layer-compute': 'server',
  };

  // Render each layer as a group
  sv2Data.layers.forEach(layer => {
    const icon = groupIcons[layer.id] || 'server';
    lines.push(`    group ${sanitize(layer.id)}(${icon})[${layer.label}]`);

    // Subgroups within this layer
    const layerSubgroups = sv2Data.subgroups.filter(sg => sg.layerId === layer.id);
    layerSubgroups.forEach(sg => {
      lines.push(`        group ${sanitize(sg.id)}(${icon})[${sg.label}] in ${sanitize(layer.id)}`);

      // Components in this subgroup
      const sgComps = sv2Data.components.filter(c => c.subgroupId === sg.id);
      sgComps.forEach(comp => {
        const label = cleanLabel(comp.label);
        lines.push(`            service ${sanitize(comp.id)}(${icon})[${label}] in ${sanitize(sg.id)}`);
        placedComponents.add(comp.id);
      });
    });

    // Direct components in this layer (not in subgroups)
    const directComps = sv2Data.components.filter(c =>
      c.layerId === layer.id && !c.subgroupId && !placedComponents.has(c.id)
    );
    directComps.forEach(comp => {
      const label = cleanLabel(comp.label);
      lines.push(`        service ${sanitize(comp.id)}(${icon})[${label}] in ${sanitize(layer.id)}`);
      placedComponents.add(comp.id);
    });

    lines.push('');
  });

  // Any orphan components not placed in a group
  sv2Data.components.forEach(comp => {
    if (!placedComponents.has(comp.id)) {
      const label = cleanLabel(comp.label);
      lines.push(`    service ${sanitize(comp.id)}(server)[${label}]`);
    }
  });

  lines.push('');
  lines.push('    %% Data Flows');

  // Render edges
  sv2Data.edges.forEach(edge => {
    const from = sanitize(edge.source);
    const to = sanitize(edge.target);
    // Mermaid architecture edges: from:Direction --> Direction:to
    // Use R (right) --> L (left) for horizontal, B (bottom) --> T (top) for vertical
    lines.push(`    ${from}:R --> L:${to}`);
  });

  return lines.join('\n');
};

/**
 * Generate a simpler flowchart-style Mermaid diagram as fallback.
 * Used when architecture-beta has rendering issues or for simpler views.
 */
export const sv2DataToFlowchart = (sv2Data) => {
  const lines = [];

  // ═══════════════════════════════════════════════════════
  // AUTO-GENERATED SECTION
  // ═══════════════════════════════════════════════════════
  lines.push('graph TD');
  lines.push(`    %% ${sv2Data.name}`);
  lines.push('');
  lines.push('    %% ═══════════════════════════════════════════════════════');
  lines.push('    %% AUTO-GENERATED from configuration');
  lines.push('    %% This section updates when capabilities change.');
  lines.push('    %% Do not edit above the ENGINEER ADDITIONS marker.');
  lines.push('    %% ═══════════════════════════════════════════════════════');
  lines.push('');

  // Subgraphs for layers
  sv2Data.layers.forEach(layer => {
    lines.push(`    subgraph ${sanitize(layer.id)}["⬒ ${layer.label.toUpperCase()}"]`);
    lines.push(`        direction LR`);

    const layerSgs = sv2Data.subgroups.filter(sg => sg.layerId === layer.id);
    layerSgs.forEach(sg => {
      lines.push(`        subgraph ${sanitize(sg.id)}["◈ ${sg.label.toUpperCase()}"]`);
      const sgComps = sv2Data.components.filter(c => c.subgroupId === sg.id);
      sgComps.forEach(c => {
        lines.push(`            ${sanitize(c.id)}["${labelWithVersion(c.label)}"]`);
      });
      lines.push('        end');
    });

    const directComps = sv2Data.components.filter(c => c.layerId === layer.id && !c.subgroupId);
    directComps.forEach(c => {
      lines.push(`        ${sanitize(c.id)}["${labelWithVersion(c.label)}"]`);
    });

    lines.push('    end');
    lines.push('');
  });

  // Auto-generated edges
  lines.push('    %% Auto-generated data flows');
  sv2Data.edges.forEach(e => {
    const label = e.label ? `|"${e.label}"|` : '';
    lines.push(`    ${sanitize(e.source)} -->${label} ${sanitize(e.target)}`);
  });

  // Styling
  lines.push('');
  const layerStyles = {
    'layer-shore': 'fill:#e8d5e8,stroke:#c084fc',
    'layer-cloud': 'fill:#fde8c8,stroke:#f97316',
    'layer-missionbay': 'fill:#dbeafe,stroke:#3b82f6',
    'layer-equipment': 'fill:#d4e4f7,stroke:#3b82f6',
    'layer-applications': 'fill:#d4edda,stroke:#22c55e',
    'layer-tempestos': 'fill:#e8f5e9,stroke:#16a34a',
    'layer-compute': 'fill:#d4e4f7,stroke:#3b82f6',
  };
  Object.entries(layerStyles).forEach(([id, style]) => {
    lines.push(`    style ${sanitize(id)} ${style}`);
  });

  // ═══════════════════════════════════════════════════════
  // ENGINEER ADDITIONS SECTION
  // ═══════════════════════════════════════════════════════
  lines.push('');
  lines.push('    %% ═══════════════════════════════════════════════════════');
  lines.push('    %% ENGINEER ADDITIONS');
  lines.push('    %% Add your custom detail below this line.');
  lines.push('    %% Sub-protocols, internal buses, timing, annotations.');
  lines.push('    %% This section is preserved when the config changes.');
  lines.push('    %% ═══════════════════════════════════════════════════════');
  lines.push('');
  lines.push('    %% Example: Add sub-protocol detail');
  lines.push('    %% sensor_mux["Sensor Mux Board"]');
  lines.push('    %% water_temp -->|"I2C @ 400kHz"| sensor_mux');
  lines.push('    %% sensor_mux -->|"SPI @ 10MHz"| sensor_pub');

  return lines.join('\n');
};

// The marker that separates auto-generated from engineer sections
export const ENGINEER_MARKER = '%% ENGINEER ADDITIONS';

/**
 * Extract the engineer additions section from an existing Mermaid source.
 * Returns everything after the ENGINEER ADDITIONS marker (inclusive).
 */
export const extractEngineerAdditions = (mermaidSource) => {
  if (!mermaidSource) return null;
  const idx = mermaidSource.indexOf(ENGINEER_MARKER);
  if (idx === -1) return null;

  // Find the start of the marker line (go back to the previous %% ═══ line)
  const markerBlockStart = mermaidSource.lastIndexOf('%% ═══', idx);
  const startIdx = markerBlockStart !== -1 ? markerBlockStart : idx;

  return mermaidSource.substring(startIdx);
};

/**
 * Merge a newly generated Mermaid base with existing engineer additions.
 * The auto-generated section is replaced; engineer additions are preserved.
 *
 * @param {string} newBase - freshly generated Mermaid from sv2DataToFlowchart
 * @param {string} existingSource - the current full Mermaid source with engineer edits
 * @returns {string} merged Mermaid source
 */
export const mergeWithEngineerAdditions = (newBase, existingSource) => {
  const existingAdditions = extractEngineerAdditions(existingSource);
  if (!existingAdditions) return newBase;

  // Replace the engineer section in the new base with the preserved one
  const newEngineerStart = newBase.indexOf(ENGINEER_MARKER);
  if (newEngineerStart === -1) {
    // New base doesn't have the marker — append engineer additions
    return newBase + '\n\n' + existingAdditions;
  }

  const newMarkerBlockStart = newBase.lastIndexOf('%% ═══', newBase.indexOf(ENGINEER_MARKER));
  const autoSection = newBase.substring(0, newMarkerBlockStart !== -1 ? newMarkerBlockStart : newEngineerStart);

  return autoSection.trimEnd() + '\n\n' + existingAdditions;
};

/**
 * Check if the auto-generated section has changed (config was modified).
 * Compares only the auto section, ignoring engineer additions.
 */
export const hasAutoSectionChanged = (sourceA, sourceB) => {
  const getAutoSection = (src) => {
    if (!src) return '';
    const idx = src.indexOf(ENGINEER_MARKER);
    const blockStart = idx !== -1 ? src.lastIndexOf('%% ═══', idx) : -1;
    return blockStart !== -1 ? src.substring(0, blockStart).trim() : src.trim();
  };
  return getAutoSection(sourceA) !== getAutoSection(sourceB);
};

// Sanitize IDs for Mermaid (alphanumeric + underscore only)
const sanitize = (id) => (id || '').replace(/[^a-zA-Z0-9_]/g, '_');

// Clean label text for Mermaid
const cleanLabel = (label) => (label || '').replace(/\n/g, ' ').replace(/"/g, "'");

// Add version number to label when available in the software catalog
const labelWithVersion = (label) => {
  const clean = cleanLabel(label);
  const entry = getCatalogEntry(clean);
  if (entry && entry.version && entry.version !== 'Unknown') {
    return `${clean} v${entry.version}`;
  }
  return clean;
};
