import { describe, it, expect } from 'vitest';
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

describe('assembleSbom', () => {
  it('produces correct total component count', () => {
    const result = assembleSbom({ configuration: mockConfig });
    // TempestOS Core (product) + AlmaLinux + NATS = 3
    expect(result.counts.components).toBe(3);
  });

  it('counts direct components correctly', () => {
    const result = assembleSbom({ configuration: mockConfig });
    // TempestOS Core (isDirect=true) + AlmaLinux (isDirect=true) = 2
    expect(result.counts.topLevel).toBe(2);
  });

  it('separates direct from transitive correctly', () => {
    const result = assembleSbom({ configuration: mockConfig });
    expect(result.topLevelComponents.map(c => c.name)).toContain('TempestOS Core');
    expect(result.transitiveComponents.map(c => c.name)).toContain('NATS');
  });

  it('collects unique licenses without duplicates', () => {
    const result = assembleSbom({ configuration: mockConfig });
    expect(result.licenses).toContain('Proprietary / DFARS 252.227-7014');
    expect(result.licenses).toContain('MIT');
    expect(new Set(result.licenses).size).toBe(result.licenses.length);
  });

  it('sets Unknown supplier for components with null supplier', () => {
    const result = assembleSbom({ configuration: mockConfig });
    const nats = result.allComponents.find(c => c.name === 'NATS');
    expect(nats?.supplier).toBe('Unknown');
  });

  it('sets Unknown license for components with null license', () => {
    const result = assembleSbom({ configuration: mockConfig });
    const nats = result.allComponents.find(c => c.name === 'NATS');
    expect(nats?.license).toBe('Unknown');
  });

  it('preserves purl when present', () => {
    const result = assembleSbom({ configuration: mockConfig });
    const alma = result.allComponents.find(c => c.name === 'AlmaLinux');
    expect(alma?.purl).toBe('pkg:rpm/almalinux/almalinux@9.2');
  });

  it('converts versionNumber to string for product version', () => {
    const result = assembleSbom({ configuration: mockConfig });
    const core = result.allComponents.find(c => c.name === 'TempestOS Core');
    expect(core?.version).toBe('2');
  });

  it('maps OS category to operating-system type', () => {
    const result = assembleSbom({ configuration: mockConfig });
    const alma = result.allComponents.find(c => c.name === 'AlmaLinux');
    expect(alma?.type).toBe('operating-system');
  });

  it('maps MESSAGING category to library type', () => {
    const result = assembleSbom({ configuration: mockConfig });
    const nats = result.allComponents.find(c => c.name === 'NATS');
    expect(nats?.type).toBe('library');
  });

  it('creates a dependency entry per product version with correct dependsOn', () => {
    const result = assembleSbom({ configuration: mockConfig });
    expect(result.dependencies).toHaveLength(1);
    expect(result.dependencies[0]!.ref).toBe('product-pv-1');
    expect(result.dependencies[0]!.dependsOn).toContain('almalinux-9.2');
    expect(result.dependencies[0]!.dependsOn).toContain('nats-2.9');
  });
});
