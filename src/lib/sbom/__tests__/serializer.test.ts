import { describe, it, expect } from 'vitest';
import { serializeToCycloneDx, serializeToCsv } from '../serializer';
import { assembleSbom } from '../assembler';
import type { AssemblerInput } from '../assembler';

const mockConfig: AssemblerInput['configuration'] = {
  id: 'cfg-1',
  company: { id: 'co-1', name: 'ACME Defense' },
  createdAt: new Date(),
  products: [
    {
      version: {
        id: 'pv-1',
        versionNumber: 2,
        product: { name: 'TempestOS Core', company: { name: 'Caliburn' } },
        license: {
          displayName: 'Proprietary / DFARS 252.227-7014',
          spdxId: null,
          governmentMarking: 'DFARS 252.227-7014',
        },
        components: [
          {
            isDirect: true,
            sortOrder: 0,
            component: {
              name: 'AlmaLinux',
              version: '9.2',
              supplier: 'AlmaLinux OS Foundation',
              category: 'OS',
              bomRef: 'almalinux-9.2',
              purl: 'pkg:rpm/almalinux/almalinux@9.2',
              license: { displayName: 'MIT', spdxId: 'MIT' },
            },
          },
          {
            isDirect: false,
            sortOrder: 1,
            component: {
              name: 'NATS',
              version: '2.9',
              supplier: null,
              category: 'MESSAGING',
              bomRef: 'nats-2.9',
              purl: null,
              license: null,
            },
          },
        ],
      },
    },
  ],
};

describe('serializeToCycloneDx', () => {
  it('produces valid CycloneDX 1.5 envelope', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const json = serializeToCycloneDx(assembled, {
      configId: 'cfg-1',
      companyName: 'ACME',
      generatedAt: new Date(),
    });
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed.bomFormat).toBe('CycloneDX');
    expect(parsed.specVersion).toBe('1.5');
    expect(parsed.serialNumber).toMatch(/^urn:uuid:/);
    expect(parsed.version).toBe(1);
  });

  it('includes all components', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const json = serializeToCycloneDx(assembled, {
      configId: 'cfg-1',
      companyName: 'ACME',
      generatedAt: new Date(),
    });
    const parsed = JSON.parse(json) as { components: unknown[] };
    expect(parsed.components.length).toBe(3);
  });

  it('includes dependencies', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const json = serializeToCycloneDx(assembled, {
      configId: 'cfg-1',
      companyName: 'ACME',
      generatedAt: new Date(),
    });
    const parsed = JSON.parse(json) as { dependencies: unknown[] };
    expect(parsed.dependencies.length).toBeGreaterThan(0);
  });

  it('every component has a bom-ref', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const json = serializeToCycloneDx(assembled, {
      configId: 'cfg-1',
      companyName: 'ACME',
      generatedAt: new Date(),
    });
    const parsed = JSON.parse(json) as { components: Array<Record<string, unknown>> };
    for (const c of parsed.components) {
      expect(c['bom-ref']).toBeTruthy();
    }
  });

  it('metadata includes correct tool and supplier', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const json = serializeToCycloneDx(assembled, {
      configId: 'cfg-1',
      companyName: 'ACME',
      generatedAt: new Date(),
    });
    const parsed = JSON.parse(json) as {
      metadata: {
        tools: Array<{ vendor: string; name: string }>;
        component: { supplier: { name: string } };
      };
    };
    expect(parsed.metadata.tools[0]!.vendor).toBe('Caliburn');
    expect(parsed.metadata.component.supplier.name).toBe('ACME');
  });

  it('omits licenses field for Unknown licenses', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const json = serializeToCycloneDx(assembled, {
      configId: 'cfg-1',
      companyName: 'ACME',
      generatedAt: new Date(),
    });
    const parsed = JSON.parse(json) as {
      components: Array<{ name: string; licenses?: unknown }>;
    };
    const nats = parsed.components.find(c => c.name === 'NATS');
    expect(nats?.licenses).toBeUndefined();
  });
});

describe('serializeToCsv', () => {
  it('produces a CSV with the correct header row', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const csv = serializeToCsv(assembled);
    expect(csv.split('\n')[0]).toBe('name,version,supplier,license,category,type');
  });

  it('produces one data row per component', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const csv = serializeToCsv(assembled);
    const lines = csv.split('\n');
    expect(lines.length).toBe(1 + assembled.counts.components);
  });

  it('marks direct components as "direct"', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const csv = serializeToCsv(assembled);
    expect(csv).toContain('"direct"');
  });

  it('marks transitive components as "transitive"', () => {
    const assembled = assembleSbom({ configuration: mockConfig });
    const csv = serializeToCsv(assembled);
    expect(csv).toContain('"transitive"');
  });
});
