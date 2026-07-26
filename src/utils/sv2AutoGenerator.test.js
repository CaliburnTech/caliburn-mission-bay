import { describe, it, expect } from 'vitest';
import { generateSV2FromConfig } from './sv2AutoGenerator';
import { LAYOUT } from '../data/sv2LayerMap';

// A loadout large enough to reproduce the tangling: multiple sensors plus
// comms, weapons, C2 and nav across several slot categories.
const fullConfig = {
  name: 'Test Config',
  slots: {
    SENSORS: ['Advanced Towed Sonar', 'Hidden Level Passive Radar', 'Scion ESM Suite'],
    COMMS: ['MILSATCOM Terminal', 'Cryptographic Communications Module'],
    WEAPONS: ['SM-6 Missile System', 'High-Energy Laser Weapon'],
    C2: ['Swarm Coordination System'],
    NAV: ['Autonomous EW Navigation Suite'],
    AI: ['Guardian AI Targeting Package']
  }
};

const capIds = (sv2) =>
  sv2.components.filter(c => c.id.startsWith('cap-')).map(c => c.id);

describe('generateSV2FromConfig edge generation', () => {
  it('should not draw a direct TMS edge for a capability that feeds sensor-pub', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');

    const feedsAggregator = sv2.edges
      .filter(e => e.target === 'sensor-pub')
      .map(e => e.source);

    expect(feedsAggregator.length).toBeGreaterThan(0);

    feedsAggregator.forEach(source => {
      const directToTms = sv2.edges.some(e => e.source === source && e.target === 'tms');
      expect(directToTms).toBe(false);
    });
  });

  it('should never emit both directions of the same connection', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');

    const pairs = new Set();
    sv2.edges.forEach(e => {
      const undirected = [e.source, e.target].sort().join('<->');
      expect(pairs.has(undirected)).toBe(false);
      pairs.add(undirected);
    });
  });

  it('should not emit duplicate directed edges', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');
    const directed = sv2.edges.map(e => `${e.source}->${e.target}`);
    expect(new Set(directed).size).toBe(directed.length);
  });

  it('should keep every capability connected to the architecture', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');
    const connected = new Set(sv2.edges.flatMap(e => [e.source, e.target]));

    capIds(sv2).forEach(id => {
      expect(connected.has(id)).toBe(true);
    });
  });

  it('should not reference edge endpoints that do not exist as components', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');
    const componentIds = new Set(sv2.components.map(c => c.id));

    sv2.edges.forEach(e => {
      expect(componentIds.has(e.source)).toBe(true);
      expect(componentIds.has(e.target)).toBe(true);
    });
  });
});

describe('generateSV2FromConfig layout', () => {
  it('should wrap subgroups so none overflow the diagram width', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');
    const mbSubgroups = sv2.subgroups.filter(sg => sg.layerId === 'layer-missionbay');

    expect(mbSubgroups.length).toBeGreaterThan(0);

    mbSubgroups.forEach(sg => {
      expect(sg.x + sg.width).toBeLessThanOrEqual(LAYOUT.diagramWidth);
    });
  });

  it('should grow the Mission Bay layer to contain every wrapped subgroup', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');
    const missionBay = sv2.layers.find(l => l.id === 'layer-missionbay');
    const mbSubgroups = sv2.subgroups.filter(sg => sg.layerId === 'layer-missionbay');

    mbSubgroups.forEach(sg => {
      expect(sg.y + sg.height).toBeLessThanOrEqual(missionBay.height);
    });
  });

  it('should not overlap subgroups placed on the same row', () => {
    const sv2 = generateSV2FromConfig(fullConfig, 'TestHull');
    const mbSubgroups = sv2.subgroups.filter(sg => sg.layerId === 'layer-missionbay');

    mbSubgroups.forEach((a, i) => {
      mbSubgroups.slice(i + 1).forEach(b => {
        const overlapsX = a.x < b.x + b.width && b.x < a.x + a.width;
        const overlapsY = a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlapsX && overlapsY).toBe(false);
      });
    });
  });

  it('should handle an empty loadout without crashing', () => {
    const sv2 = generateSV2FromConfig({ name: 'Empty', slots: {} }, 'TestHull');
    expect(sv2.components.length).toBeGreaterThan(0);
    expect(Array.isArray(sv2.edges)).toBe(true);
  });
});
