import { v4 as uuidv4 } from 'uuid';

// ── Input shape (matches the Prisma query in the Lambda handler) ──────────────

export interface AssemblerInput {
  configuration: {
    id: string;
    company: { id: string; name: string };
    createdAt: Date;
    products: Array<{
      version: {
        id: string;
        versionNumber: number;
        product: { name: string; company: { name: string } };
        license: {
          displayName: string;
          spdxId?: string | null;
          governmentMarking?: string | null;
        } | null;
        components: Array<{
          isDirect: boolean;
          sortOrder: number;
          component: {
            name: string;
            version: string;
            supplier: string | null;
            category: string;
            bomRef: string | null;
            purl: string | null;
            license: { displayName: string; spdxId?: string | null } | null;
          };
        }>;
      };
    }>;
  };
}

// ── Output shapes ─────────────────────────────────────────────────────────────

export interface SbomComponent {
  bomRef: string;
  name: string;
  version: string;
  supplier: string;
  type: string;
  isDirect: boolean;
  purl?: string;
  license: string;
}

export interface SbomDependency {
  ref: string;
  dependsOn: string[];
}

export interface AssembledSbom {
  topLevelComponents: SbomComponent[];
  transitiveComponents: SbomComponent[];
  allComponents: SbomComponent[];
  dependencies: SbomDependency[];
  licenses: string[];
  counts: {
    components: number;
    topLevel: number;
    dependencies: number;
    licenses: number;
  };
}

// ── Assembler ─────────────────────────────────────────────────────────────────

export function assembleSbom(input: AssemblerInput): AssembledSbom {
  const allComponents: SbomComponent[] = [];
  const dependencyMap = new Map<string, string[]>();
  const licenseSet = new Set<string>();

  for (const cp of input.configuration.products) {
    const pv = cp.version;
    const pvBomRef = `product-${pv.id}`;
    const pvDeps: string[] = [];

    const pvComponent: SbomComponent = {
      bomRef: pvBomRef,
      name: pv.product.name,
      version: String(pv.versionNumber),
      supplier: pv.product.company.name,
      type: 'library',
      isDirect: true,
      license: pv.license?.displayName ?? 'Unknown',
    };

    if (pv.license) licenseSet.add(pv.license.displayName);
    allComponents.push(pvComponent);

    const sorted = [...pv.components].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const pc of sorted) {
      const c = pc.component;
      const bomRef = c.bomRef ?? `comp-${uuidv4()}`;
      pvDeps.push(bomRef);

      const comp: SbomComponent = {
        bomRef,
        name: c.name,
        version: c.version,
        supplier: c.supplier ?? 'Unknown',
        type: mapCategory(c.category),
        isDirect: pc.isDirect,
        purl: c.purl ?? undefined,
        license: c.license?.displayName ?? 'Unknown',
      };

      if (c.license) licenseSet.add(c.license.displayName);
      allComponents.push(comp);
    }

    dependencyMap.set(pvBomRef, pvDeps);
  }

  const topLevelComponents = allComponents.filter(c => c.isDirect);
  const transitiveComponents = allComponents.filter(c => !c.isDirect);
  const dependencies = Array.from(dependencyMap.entries()).map(([ref, dependsOn]) => ({
    ref,
    dependsOn,
  }));
  const licenses = Array.from(licenseSet);

  return {
    topLevelComponents,
    transitiveComponents,
    allComponents,
    dependencies,
    licenses,
    counts: {
      components: allComponents.length,
      topLevel: topLevelComponents.length,
      dependencies: dependencies.length,
      licenses: licenses.length,
    },
  };
}

function mapCategory(cat: string): string {
  const map: Record<string, string> = {
    OS: 'operating-system',
    RUNTIME: 'framework',
    MESSAGING: 'library',
    DRIVER: 'firmware',
    SDK: 'library',
    LIBRARY: 'library',
    FIRMWARE: 'firmware',
    APPLICATION: 'application',
    OTHER: 'library',
  };
  return map[cat] ?? 'library';
}
