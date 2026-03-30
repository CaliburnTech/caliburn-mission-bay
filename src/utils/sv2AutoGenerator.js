/**
 * SV-2 Auto-Generator
 *
 * Generates a complete SV-2 diagram from any vessel configuration.
 *
 * ARCHITECTURE MODEL:
 *   Shore Environments — C2 Station, Avalon (dev env)
 *   Cloud Services — Remote control, data collection relay
 *   Mission Bay — THE HOST LAYER for equipped capabilities/payloads
 *     └─ Sensors subgroup (equipped sensor capabilities)
 *     └─ Comms subgroup (equipped comms capabilities)
 *     └─ C2 subgroup (equipped C2 capabilities)
 *     └─ Nav / AI / Weapons / etc. (other equipped capabilities)
 *   Equipment — Physical hardware interfaces (radios, sensor hardware)
 *   Applications — On-vessel middleware (autonomy, C2 clients)
 *   TempestOS — OS layer (TMS pub/sub, MCU bridge, sensor publisher)
 *   Compute — Processors, RAM, storage, MCU
 *
 * Equipped capabilities from the loadout are children of Mission Bay.
 * TempestOS/Compute/Equipment contain platform infrastructure.
 */

import { getCapabilityByName } from '../store/configurationStore';
import { getCatalogEntry } from '../data/softwareCatalog';
import {
  SV2_LAYERS,
  SV2_SUBGROUPS,
  getArchitectureLayer,
  BASELINE_COMPONENTS,
  DEFAULT_EDGE_RULES,
  COMPUTE_TEMPLATES,
  LAYOUT
} from '../data/sv2LayerMap';
import { getSV2Template } from '../data/sv2Templates';

// ──────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────

export const resolveSV2 = (activeConfig, hullName) => {
  // Tier 1: hand-crafted template
  const template = getSV2Template(hullName) || getSV2Template(activeConfig?.name);
  if (template) return { ...template, _source: 'template' };

  // Tier 2: auto-generate
  return generateSV2FromConfig(activeConfig, hullName);
};

export const generateSV2FromConfig = (activeConfig, hullName) => {
  const slots = activeConfig?.slots || {};

  // Step 1: Collect equipped capabilities
  const equipped = [];
  Object.entries(slots).forEach(([slotCategory, slotArray]) => {
    (slotArray || []).forEach((capName, idx) => {
      if (!capName) return;
      const capability = getCapabilityByName(capName);
      equipped.push({ capName, capability, slotCategory, slotIndex: idx });
    });
  });

  // Step 2: Determine active layers
  const activeLayers = determineActiveLayers(equipped);

  // Step 3: Build Mission Bay subgroups from equipped capabilities
  const mbSubgroups = buildMissionBaySubgroups(equipped);

  // Step 4: Collect baseline components (TempestOS, Shore, Cloud)
  const baselineComps = collectBaselineComponents(equipped);

  // Step 5: Compute template
  const computeTemplate = COMPUTE_TEMPLATES[hullName] || COMPUTE_TEMPLATES['_default'];

  // Step 6: Layout
  const layout = computeLayout(activeLayers, mbSubgroups, equipped, baselineComps, computeTemplate);

  // Step 7: Edges
  const edges = generateEdges(equipped, baselineComps, computeTemplate);

  return {
    name: `SV-2: ${hullName || 'Configuration'}`,
    description: `Auto-generated from ${activeConfig?.name || 'configuration'} — ${equipped.length} capabilities equipped`,
    layers: layout.layers,
    subgroups: layout.subgroups,
    components: layout.components,
    edges,
    _source: 'auto',
    _configHash: hashConfig(slots)
  };
};

// ──────────────────────────────────────────
// Determine active layers
// ──────────────────────────────────────────

const determineActiveLayers = (equipped) => {
  // Always: shore, missionbay, tempestos, compute
  const active = new Set(['layer-shore', 'layer-missionbay', 'layer-tempestos', 'layer-compute']);

  if (equipped.some(e => e.slotCategory === 'COMMS' || e.slotCategory === 'SENSORS')) {
    active.add('layer-cloud');
  }

  // Equipment layer if hardware-type capabilities are equipped
  if (equipped.some(e => ['SENSORS', 'COMMS', 'WEAPONS'].includes(e.slotCategory))) {
    active.add('layer-equipment');
  }

  // Applications layer if software-type capabilities
  if (equipped.some(e => ['NAV', 'AI', 'C2'].includes(e.slotCategory))) {
    active.add('layer-applications');
  }

  return SV2_LAYERS.filter(l => active.has(l.id));
};

// ──────────────────────────────────────────
// Build Mission Bay subgroups
// ──────────────────────────────────────────
// Group equipped capabilities by slot category into subgroups within Mission Bay

const SLOT_CATEGORY_LABELS = {
  SENSORS: 'Sensors',
  COMMS: 'Communications',
  WEAPONS: 'Weapons',
  C2: 'C2 Systems',
  NAV: 'Navigation',
  AI: 'AI & Autonomy',
  UTILITY: 'Utility',
  OTHER: 'Other'
};

const SLOT_CATEGORY_COLORS = {
  SENSORS: '#bfdbfe',
  COMMS: '#c4b5fd',
  WEAPONS: '#fecaca',
  C2: '#fed7aa',
  NAV: '#bbf7d0',
  AI: '#d9f99d',
  UTILITY: '#e5e7eb',
  OTHER: '#e5e7eb'
};

const buildMissionBaySubgroups = (equipped) => {
  const groups = {};
  equipped.forEach(e => {
    if (!groups[e.slotCategory]) groups[e.slotCategory] = [];
    groups[e.slotCategory].push(e);
  });

  return Object.entries(groups).map(([cat, caps]) => ({
    id: `mb-${cat.toLowerCase()}`,
    layerId: 'layer-missionbay',
    label: SLOT_CATEGORY_LABELS[cat] || cat,
    color: SLOT_CATEGORY_COLORS[cat] || '#e5e7eb',
    caps
  }));
};

// ──────────────────────────────────────────
// Collect baseline components
// ──────────────────────────────────────────

const collectBaselineComponents = (equipped) => {
  const equippedCategories = new Set(equipped.map(e => e.slotCategory));
  const result = [];

  Object.values(BASELINE_COMPONENTS).forEach(group => {
    group.forEach(comp => {
      if (comp.alwaysPresent) {
        result.push(comp);
      } else if (comp.requiresCategory && equippedCategories.has(comp.requiresCategory)) {
        result.push(comp);
      }
    });
  });

  return result;
};

// ──────────────────────────────────────────
// Layout
// ──────────────────────────────────────────

const computeLayout = (activeLayers, mbSubgroups, equipped, baselineComps, computeTemplate) => {
  const { diagramWidth: _diagramWidth, layerGap, layerPaddingX, layerPaddingY,
    componentWidth, componentHeight, componentGapX, componentGapY, componentsPerRow,
    subgroupPaddingX, subgroupPaddingY } = LAYOUT;

  const allComponents = [];
  const allSubgroups = [];

  // ── Mission Bay subgroups: compute sizes ──
  const sgLayouts = {};
  mbSubgroups.forEach(sg => {
    const count = sg.caps.length;
    const rows = Math.ceil(count / componentsPerRow) || 1;
    const cols = Math.min(count, componentsPerRow) || 1;
    const width = cols * (componentWidth + componentGapX) + subgroupPaddingX + 20;
    const height = rows * (componentHeight + componentGapY) + subgroupPaddingY + 15;
    sgLayouts[sg.id] = { width, height };
  });

  // ── Compute layer heights ──
  const layerHeights = {};
  activeLayers.forEach(layer => {
    let height = layer.minHeight;

    if (layer.id === 'layer-missionbay') {
      // Size to fit subgroups
      const sgMaxHeight = mbSubgroups.length > 0
        ? Math.max(...mbSubgroups.map(sg => sgLayouts[sg.id]?.height || 80))
        : 60;
      height = Math.max(sgMaxHeight + layerPaddingY * 2 + 10, layer.minHeight);
    } else if (layer.id === 'layer-compute' && computeTemplate) {
      const count = computeTemplate.components.length;
      const rows = Math.ceil(count / componentsPerRow);
      height = Math.max(rows * (componentHeight + componentGapY) + layerPaddingY * 2 + 30, layer.minHeight);
    } else {
      // Baseline components in this layer
      const layerBaseline = baselineComps.filter(bc => bc.layerId === layer.id);
      if (layerBaseline.length > 0) {
        const rows = Math.ceil(layerBaseline.length / componentsPerRow);
        height = Math.max(rows * (componentHeight + componentGapY) + layerPaddingY * 2 + 10, layer.minHeight);
      }
    }

    layerHeights[layer.id] = height;
  });

  // ── Layer y positions ──
  let currentY = 0;
  const layerPositions = {};
  const outputLayers = activeLayers.map(layer => {
    const height = layerHeights[layer.id];
    const y = currentY;
    layerPositions[layer.id] = y;
    currentY += height + layerGap;
    return { id: layer.id, label: layer.label, color: layer.color, y, height };
  });

  // ── Place Mission Bay subgroups and their capability children ──
  let sgX = layerPaddingX;
  mbSubgroups.forEach(sg => {
    const layout = sgLayouts[sg.id];
    allSubgroups.push({
      id: sg.id,
      layerId: 'layer-missionbay',
      label: sg.label,
      x: sgX,
      y: layerPaddingY,
      width: layout.width,
      height: layout.height,
      color: sg.color
    });

    sg.caps.forEach((cap, idx) => {
      const row = Math.floor(idx / componentsPerRow);
      const col = idx % componentsPerRow;
      allComponents.push({
        id: `cap-${cap.slotCategory}-${cap.slotIndex}`,
        label: cap.capName,
        subgroupId: sg.id,
        x: subgroupPaddingX + col * (componentWidth + componentGapX),
        y: subgroupPaddingY + row * (componentHeight + componentGapY),
        width: componentWidth,
        height: componentHeight,
        _slotCategory: cap.slotCategory
      });
    });

    sgX += layout.width + 20;
  });

  // ── Place baseline components in their layers ──
  const baselineByLayer = {};
  baselineComps.forEach(bc => {
    if (!baselineByLayer[bc.layerId]) baselineByLayer[bc.layerId] = [];
    baselineByLayer[bc.layerId].push(bc);
  });

  Object.entries(baselineByLayer).forEach(([layerId, comps]) => {
    comps.forEach((comp, idx) => {
      const row = Math.floor(idx / componentsPerRow);
      const col = idx % componentsPerRow;
      allComponents.push({
        id: comp.id,
        label: comp.label,
        layerId,
        x: layerPaddingX + col * (componentWidth + componentGapX + 10),
        y: layerPaddingY + 10 + row * (componentHeight + componentGapY),
        width: 170,
        height: componentHeight,
        _externalInterface: comp.externalInterface || false
      });
    });
  });

  // ── Place compute components ──
  if (computeTemplate && layerPositions['layer-compute'] !== undefined) {
    let csgX = layerPaddingX;
    (computeTemplate.subgroups || []).forEach(csg => {
      const compCount = computeTemplate.components.filter(c => c.subgroupId === csg.id).length;
      const width = Math.max(compCount * (130 + componentGapX) + subgroupPaddingX + 20, 200);
      allSubgroups.push({
        id: csg.id,
        layerId: 'layer-compute',
        label: csg.label,
        x: csgX,
        y: layerPaddingY,
        width,
        height: 90,
        color: csg.color || '#c8d8eb'
      });
      csgX += width + 20;
    });

    const byComputeSg = {};
    computeTemplate.components.forEach(cc => {
      const key = cc.subgroupId || '_root';
      if (!byComputeSg[key]) byComputeSg[key] = [];
      byComputeSg[key].push(cc);
    });

    Object.entries(byComputeSg).forEach(([sgId, comps]) => {
      comps.forEach((cc, idx) => {
        allComponents.push({
          id: cc.id,
          label: cc.label,
          subgroupId: sgId !== '_root' ? sgId : undefined,
          layerId: sgId === '_root' ? 'layer-compute' : undefined,
          x: subgroupPaddingX + idx * (130 + componentGapX),
          y: 35,
          width: 120,
          height: componentHeight
        });
      });
    });
  }

  return { layers: outputLayers, subgroups: allSubgroups, components: allComponents };
};

// ──────────────────────────────────────────
// Edge generation
// ──────────────────────────────────────────

const generateEdges = (equipped, baselineComps, computeTemplate) => {
  const edges = [];
  const allIds = new Set([
    ...equipped.map(e => `cap-${e.slotCategory}-${e.slotIndex}`),
    ...baselineComps.map(bc => bc.id),
    ...(computeTemplate?.components || []).map(cc => cc.id)
  ]);

  // Apply default edge rules
  DEFAULT_EDGE_RULES.forEach(rule => {
    if (rule.sourceId && rule.targetId) {
      if (allIds.has(rule.sourceId) && allIds.has(rule.targetId)) {
        edges.push({ source: rule.sourceId, target: rule.targetId, label: rule.defaultLabel });
      }
    } else if (rule.sourceFilter && rule.targetId && allIds.has(rule.targetId)) {
      equipped.forEach(e => {
        const capId = `cap-${e.slotCategory}-${e.slotIndex}`;
        // Match by slot category mapped to the filter's subgroup/layer
        const archLayer = getArchitectureLayer(e.capability, e.slotCategory);
        const matches =
          (rule.sourceFilter.subgroupId && archLayer.subgroupId === rule.sourceFilter.subgroupId) ||
          (rule.sourceFilter.layerId && archLayer.layerId === rule.sourceFilter.layerId);
        if (matches) {
          const catalogEntry = getCatalogEntry(e.capName);
          const protocol = catalogEntry?.protocols?.[0];
          const label = protocol && protocol !== 'Unknown' ? protocol : rule.defaultLabel;
          edges.push({ source: capId, target: rule.targetId, label });
        }
      });
    }
  });

  // Compute template edges
  if (computeTemplate?.edges) {
    computeTemplate.edges.forEach(ce => {
      if (allIds.has(ce.sourceId) && allIds.has(ce.targetId)) {
        edges.push({ source: ce.sourceId, target: ce.targetId, label: ce.label });
      }
    });
  }

  // Connect Mission Bay capabilities to TMS (everything goes through the pub/sub bus)
  if (allIds.has('tms')) {
    equipped.forEach(e => {
      const capId = `cap-${e.slotCategory}-${e.slotIndex}`;
      const catalogEntry = getCatalogEntry(e.capName);
      const protocol = catalogEntry?.protocols?.[0] || 'TMS Channel';
      // Only add if no edge already exists to TMS for this cap
      if (!edges.some(ed => ed.source === capId && ed.target === 'tms')) {
        edges.push({ source: capId, target: 'tms', label: protocol });
      }
    });
  }

  // Deduplicate
  const seen = new Set();
  return edges.filter(e => {
    const key = `${e.source}->${e.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const hashConfig = (slots) => {
  const sorted = Object.entries(slots || {})
    .map(([k, v]) => `${k}:${(v || []).filter(Boolean).sort().join(',')}`)
    .sort()
    .join('|');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) - hash) + sorted.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
};
