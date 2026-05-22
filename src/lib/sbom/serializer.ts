import { v4 as uuidv4 } from 'uuid';
import type { AssembledSbom } from './assembler';

export function serializeToCycloneDx(
  assembled: AssembledSbom,
  meta: { configId: string; companyName: string; generatedAt: Date },
): string {
  const bom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${uuidv4()}`,
    version: 1,
    metadata: {
      timestamp: meta.generatedAt.toISOString(),
      tools: [{ vendor: 'Caliburn', name: 'Mission Bay', version: '1.0' }],
      component: {
        type: 'application',
        name: `Mission Bay Configuration ${meta.configId}`,
        version: '1.0',
        supplier: { name: meta.companyName },
      },
    },
    components: assembled.allComponents.map(c => ({
      type: c.type,
      'bom-ref': c.bomRef,
      name: c.name,
      version: c.version,
      supplier: c.supplier ? { name: c.supplier } : undefined,
      purl: c.purl,
      licenses:
        c.license && c.license !== 'Unknown'
          ? [{ license: { name: c.license } }]
          : undefined,
    })),
    dependencies: assembled.dependencies.map(d => ({
      ref: d.ref,
      dependsOn: d.dependsOn,
    })),
  };

  return JSON.stringify(bom, null, 2);
}

export function serializeToCsv(assembled: AssembledSbom): string {
  const header = 'name,version,supplier,license,category,type';
  const rows = assembled.allComponents.map(c =>
    [c.name, c.version, c.supplier, c.license, c.type, c.isDirect ? 'direct' : 'transitive']
      .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}
