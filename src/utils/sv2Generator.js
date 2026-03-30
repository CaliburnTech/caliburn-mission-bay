// SV-2 (Systems Viewpoint 2) Mermaid diagram generator
// Generates DoDAF SV-2 system communication descriptions from configurations

import { softwareCatalog, getCatalogEntry, sv2Architectures, getComponentsFromLoadout, getComponentsFromMission } from '../data/softwareCatalog';

// Sanitize node names for Mermaid (no special chars in IDs)
const nodeId = (name) => name.replace(/[^a-zA-Z0-9]/g, '_');

// Generate SV-2 Mermaid diagram from a mission
export const generateSV2ForMission = (mission, deployments = []) => {
  // Check for a predefined architecture first
  const predefined = findPredefinedArchitecture(mission);
  if (predefined) {
    return buildMermaidFromArchitecture(predefined);
  }

  // Fall back to auto-generation from loadout data
  const missionSoftware = getComponentsFromMission(mission);
  const deploymentSoftware = deployments.flatMap(d => getComponentsFromLoadout(d.loadout));
  const allNames = [...new Set([...missionSoftware, ...deploymentSoftware])];

  return buildMermaidFromComponents(allNames, {
    title: `SV-2: ${mission.name}`,
    missionType: mission.template
  });
};

// Generate SV-2 from a deployment loadout
export const generateSV2FromLoadout = (loadout, context = {}) => {
  const names = getComponentsFromLoadout(loadout);
  return buildMermaidFromComponents(names, {
    title: `SV-2: ${context.name || 'Deployment'}`,
    ...context
  });
};

// Find a predefined SV-2 architecture matching a mission
const findPredefinedArchitecture = (mission) => {
  if (mission?.missionProfile?.exercise?.includes('ANTX')) {
    return sv2Architectures['ANTX_HORUS_METOC'];
  }
  return null;
};

// Build Mermaid diagram from a predefined sv2Architecture object
const buildMermaidFromArchitecture = (arch) => {
  const lines = ['graph LR'];

  // Add title as a comment
  lines.push(`  %% ${arch.name}`);
  lines.push('');

  // Define nodes with styling subgraphs by category
  const categories = {};
  arch.systems.forEach(sysName => {
    const entry = getCatalogEntry(sysName);
    const cat = entry.category || 'System';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(sysName);
  });

  // Generate connections
  arch.connections.forEach(conn => {
    const fromId = nodeId(conn.from);
    const toId = nodeId(conn.to);
    const fromEntry = getCatalogEntry(conn.from);
    const toEntry = getCatalogEntry(conn.to);
    const fromLabel = `${conn.from}`;
    const toLabel = `${conn.to}`;

    // Ensure nodes are declared with labels
    if (conn.bidirectional) {
      lines.push(`  ${fromId}["${fromLabel}"] -->|"${truncate(conn.label, 50)}"| ${toId}["${toLabel}"]`);
      if (conn.returnLabel) {
        lines.push(`  ${toId} -->|"${truncate(conn.returnLabel, 50)}"| ${fromId}`);
      }
    } else {
      lines.push(`  ${fromId}["${fromLabel}"] -->|"${truncate(conn.label, 50)}"| ${toId}["${toLabel}"]`);
    }
  });

  // Add styling
  lines.push('');
  lines.push('  %% Styling');

  // Color nodes by category
  const categoryColors = {
    'User Interface': '#06b6d4',
    'C2 Software': '#3b82f6',
    'Middleware': '#8b5cf6',
    'Hardware Interface': '#f97316',
    'Autonomy / Navigation': '#4ade80',
    'Vehicle Platform': '#ef4444',
    'Communications': '#eab308',
    'Infrastructure': '#6b7280',
    'Services': '#ec4899',
    'Sensor Interface': '#14b8a6'
  };

  arch.systems.forEach(sysName => {
    const entry = getCatalogEntry(sysName);
    const color = categoryColors[entry.category] || '#9ca3af';
    lines.push(`  style ${nodeId(sysName)} fill:${color},stroke:#cbfd00,stroke-width:2px,color:#fff`);
  });

  return {
    mermaid: lines.join('\n'),
    title: arch.name,
    description: arch.description,
    systems: arch.systems,
    connectionCount: arch.connections.length
  };
};

// Auto-generate SV-2 from a list of component names using their interface metadata
const buildMermaidFromComponents = (componentNames, context = {}) => {
  const lines = ['graph LR'];
  lines.push(`  %% ${context.title || 'System View'}`);
  lines.push('');

  const addedConnections = new Set();
  const referencedNodes = new Set();

  componentNames.forEach(name => {
    const entry = getCatalogEntry(name);
    referencedNodes.add(name);

    // Add connections from interface metadata
    if (entry.interfaces?.downstream) {
      entry.interfaces.downstream.forEach(target => {
        const connKey = `${name}->${target}`;
        if (!addedConnections.has(connKey)) {
          addedConnections.add(connKey);
          referencedNodes.add(target);

          const flowData = entry.dataFlows?.[target];
          const label = flowData?.send || 'data';
          lines.push(`  ${nodeId(name)}["${name}"] -->|"${truncate(label, 40)}"| ${nodeId(target)}["${target}"]`);

          if (flowData?.receive) {
            const returnKey = `${target}->${name}`;
            if (!addedConnections.has(returnKey)) {
              addedConnections.add(returnKey);
              lines.push(`  ${nodeId(target)} -->|"${truncate(flowData.receive, 40)}"| ${nodeId(name)}`);
            }
          }
        }
      });
    }

    if (entry.interfaces?.upstream) {
      entry.interfaces.upstream.forEach(source => {
        referencedNodes.add(source);
        const connKey = `${source}->${name}`;
        if (!addedConnections.has(connKey)) {
          addedConnections.add(connKey);
          const sourceEntry = getCatalogEntry(source);
          const flowData = sourceEntry.dataFlows?.[name];
          const label = flowData?.send || 'data';
          lines.push(`  ${nodeId(source)}["${source}"] -->|"${truncate(label, 40)}"| ${nodeId(name)}["${name}"]`);
        }
      });
    }
  });

  // Style nodes
  lines.push('');
  const categoryColors = {
    'User Interface': '#06b6d4',
    'C2 Software': '#3b82f6',
    'Middleware': '#8b5cf6',
    'Hardware Interface': '#f97316',
    'Autonomy / Navigation': '#4ade80',
    'Vehicle Platform': '#ef4444',
    'Communications': '#eab308',
    'Infrastructure': '#6b7280'
  };

  referencedNodes.forEach(name => {
    const entry = getCatalogEntry(name);
    const color = categoryColors[entry.category] || '#9ca3af';
    lines.push(`  style ${nodeId(name)} fill:${color},stroke:#cbfd00,stroke-width:2px,color:#fff`);
  });

  return {
    mermaid: lines.join('\n'),
    title: context.title || 'System Architecture',
    description: `Auto-generated SV-2 for ${context.missionType || 'configuration'}`,
    systems: [...referencedNodes],
    connectionCount: addedConnections.size
  };
};

// Truncate long labels
const truncate = (str, max) => {
  if (!str) return '';
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
};

// Export raw Mermaid source for copy/paste
export const getSV2MermaidSource = (sv2Result) => sv2Result.mermaid;

// Get a downloadable SVG data URL from rendered SVG string
export const svgToDataUrl = (svgString) => {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};
