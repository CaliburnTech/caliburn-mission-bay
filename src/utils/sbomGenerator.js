// SBOM (Software Bill of Materials) generator
// Produces CycloneDX-like structured output from loadout/mission configurations

import { softwareCatalog, getCatalogEntry, getComponentsFromLoadout, getComponentsFromMission } from '../data/softwareCatalog';

// Recursively resolve all dependencies for a set of component names
const resolveDependencies = (componentNames, visited = new Set()) => {
  const allComponents = [];

  for (const name of componentNames) {
    if (visited.has(name)) continue;
    visited.add(name);

    const entry = getCatalogEntry(name);
    allComponents.push({ name, ...entry });

    if (entry.dependencies?.length > 0) {
      const subDeps = resolveDependencies(entry.dependencies, visited);
      allComponents.push(...subDeps);
    }
  }

  return allComponents;
};

// Generate SBOM from a deployment loadout
export const generateSBOMFromLoadout = (loadout, context = {}) => {
  const topLevel = getComponentsFromLoadout(loadout);
  const allComponents = resolveDependencies(topLevel);

  return buildSBOM(allComponents, topLevel, {
    type: 'deployment',
    ...context
  });
};

// Generate SBOM from a mission (uses missionProfile.softwareStack + assigned deployment loadouts)
export const generateSBOMFromMission = (mission, deployments = []) => {
  const missionSoftware = getComponentsFromMission(mission);
  const deploymentSoftware = deployments.flatMap(d => getComponentsFromLoadout(d.loadout));
  const combined = [...new Set([...missionSoftware, ...deploymentSoftware])];
  const allComponents = resolveDependencies(combined);

  return buildSBOM(allComponents, combined, {
    type: 'mission',
    missionId: mission.id,
    missionName: mission.name,
    exercise: mission.missionProfile?.exercise || ''
  });
};

// Generate SBOM from an outfit configuration
export const generateSBOMFromOutfit = (outfit, squadronName = '') => {
  const topLevel = outfit.capabilities || [];
  // Outfit capabilities are hardware names, but we check catalog for any that are software
  const softwareComponents = topLevel.filter(name => softwareCatalog[name]);
  const allComponents = resolveDependencies(softwareComponents);

  return buildSBOM(allComponents, softwareComponents, {
    type: 'outfit',
    outfitName: outfit.name,
    squadronName
  });
};

// Generate SBOM from LoadoutBuilder's active configuration (configurationStore format)
// activeConfig.slots: { SENSORS: [capName, ...], COMMS: [...], AI: [...], ... }
export const generateSBOMFromActiveConfig = (activeConfig, hullName = '') => {
  if (!activeConfig?.slots) return null;

  // Collect all equipped capability names across all slot categories
  const equippedNames = [];
  Object.values(activeConfig.slots).forEach(slotArray => {
    (slotArray || []).forEach(name => {
      if (name) equippedNames.push(name);
    });
  });

  // Every config implicitly includes TempestOS Core as the base platform
  const allNames = ['TempestOS Core', ...equippedNames];
  const uniqueNames = [...new Set(allNames)];

  // Resolve dependencies (TempestOS pulls in AlmaLinux, K8s, etc.)
  const allComponents = resolveDependencies(uniqueNames);

  return buildSBOM(allComponents, uniqueNames, {
    type: 'configuration',
    configName: activeConfig.name || 'Untitled Configuration',
    configId: activeConfig.id,
    hullName,
    squadronId: activeConfig.squadronId,
    equippedCount: equippedNames.length,
    slotSummary: Object.fromEntries(
      Object.entries(activeConfig.slots).map(([cat, slots]) => [
        cat,
        (slots || []).filter(Boolean).length
      ])
    )
  });
};

// Core SBOM builder
const buildSBOM = (allComponents, topLevelNames, context) => {
  const timestamp = new Date().toISOString();
  const topLevelSet = new Set(topLevelNames);

  // Deduplicate by component name
  const seen = new Set();
  const uniqueComponents = allComponents.filter(c => {
    if (seen.has(c.componentName)) return false;
    seen.add(c.componentName);
    return true;
  });

  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    version: 1,
    metadata: {
      timestamp,
      component: {
        type: context.type,
        name: context.missionName || context.outfitName || 'Configuration',
        description: context.exercise || ''
      },
      manufacture: { name: "Caliburn" },
      tools: [{ vendor: "Caliburn", name: "Mission Bay SBOM Generator", version: "1.0.0" }]
    },
    components: uniqueComponents.map(c => ({
      type: c.category === 'Operating System' || c.category === 'Runtime' || c.category === 'Middleware'
        ? 'framework'
        : c.category === 'Vehicle Platform' || c.category === 'Communications' || c.category === 'Infrastructure'
          ? 'device'
          : 'library',
      name: c.componentName,
      version: c.version,
      supplier: { name: c.supplier },
      license: c.license,
      purl: c.purl,
      description: c.description,
      category: c.category,
      protocols: c.protocols || [],
      isTopLevel: topLevelSet.has(c.name),
      dependencyNames: c.dependencies || []
    })),
    dependencies: uniqueComponents
      .filter(c => c.dependencies?.length > 0)
      .map(c => ({
        ref: c.purl,
        dependsOn: c.dependencies.map(dep => getCatalogEntry(dep).purl)
      })),
    context
  };
};

// Export SBOM as formatted JSON string
export const sbomToJSON = (sbom) => JSON.stringify(sbom, null, 2);

// Export SBOM as CSV
export const sbomToCSV = (sbom) => {
  const header = 'Component Name,Version,Supplier,License,Category,PURL,Is Top-Level,Dependencies';
  const rows = sbom.components.map(c =>
    [
      `"${c.name}"`,
      `"${c.version}"`,
      `"${c.supplier.name}"`,
      `"${c.license}"`,
      `"${c.category}"`,
      `"${c.purl}"`,
      c.isTopLevel ? 'Yes' : 'No',
      `"${c.dependencyNames.join('; ')}"`
    ].join(',')
  );
  return [header, ...rows].join('\n');
};

// Get summary stats
export const getSBOMStats = (sbom) => {
  const components = sbom.components;
  const categories = {};
  const licenses = {};
  const suppliers = {};

  components.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
    licenses[c.license] = (licenses[c.license] || 0) + 1;
    suppliers[c.supplier.name] = (suppliers[c.supplier.name] || 0) + 1;
  });

  return {
    totalComponents: components.length,
    topLevelComponents: components.filter(c => c.isTopLevel).length,
    dependencyCount: components.filter(c => !c.isTopLevel).length,
    categories,
    licenses,
    suppliers
  };
};
