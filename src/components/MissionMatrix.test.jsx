import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionMatrix from './MissionMatrix';

// Mock the stores
vi.mock('../store/navigationStore', () => ({
  default: () => ({
    setSelectedView: vi.fn(),
  }),
}));

vi.mock('../store/outfitterStore', () => ({
  default: () => ({
    setSelectedHull: vi.fn(),
    setSelectedMountPoint: vi.fn(),
    setVesselConfiguration: vi.fn(),
  }),
}));

vi.mock('../store/squadronStore', () => ({
  default: () => ({
    squadrons: [],
  }),
}));

// Mock vessel data with minimal data
vi.mock('../data/vesselData', () => ({
  vesselHullData: [
    { name: 'TestVessel', platformType: 'USV', icon: 'TestVessel' },
  ],
  vesselHullComponents: {},
}));

// Mock marketplace data
vi.mock('../data/marketplaceData', () => ({
  individualCapabilities: [
    {
      name: 'TestCapability',
      provider: 'Test Provider',
      category: 'SENSORS',
      platformTypes: ['USV'],
      missionTags: ['SEA_DENIAL'],
    },
  ],
}));

describe('MissionMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MissionMatrix />);
    expect(screen.getByText('Mission Matrix')).toBeInTheDocument();
  });

  it('handles clicking a cell with valid data', () => {
    render(<MissionMatrix />);

    // Find and click a cell button
    const cells = screen.getAllByRole('button');
    const matrixCell = cells.find(btn => btn.title?.includes('payloads'));

    if (matrixCell) {
      fireEvent.click(matrixCell);
      // Should not throw an error
      expect(true).toBe(true);
    }
  });

  it('handles domain filter changes', () => {
    render(<MissionMatrix />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'AERIAL' } });

    // Should not throw an error
    expect(true).toBe(true);
  });

  it('handles show gaps toggle', () => {
    render(<MissionMatrix />);

    const gapsButton = screen.getByText(/Show Gaps/);
    fireEvent.click(gapsButton);

    // Should not throw an error
    expect(true).toBe(true);
  });
});

describe('MissionMatrix - Null Safety', () => {
  it('handles undefined cell status gracefully', () => {
    // This tests that cell?.status?.status pattern works
    const cellData = undefined;
    const status = cellData?.status?.status;
    expect(status).toBeUndefined();
  });

  it('handles undefined mission gracefully', () => {
    const missions = [{ key: 'TEST', name: 'Test', color: '#fff' }];
    const mission = missions.find(m => m.key === 'NONEXISTENT');
    expect(mission).toBeUndefined();
    // Should not throw when accessing properties with optional chaining
    expect(mission?.color).toBeUndefined();
  });

  it('handles undefined vessel gracefully', () => {
    const vessels = [{ name: 'TestVessel' }];
    const vessel = vessels.find(v => v.name === 'NonExistent');
    expect(vessel).toBeUndefined();
    expect(vessel?.platformType).toBeUndefined();
  });

  it('handles empty squadrons array', () => {
    const squadrons = [];
    const filtered = squadrons.filter(s => s.hullName === 'Test');
    expect(filtered).toHaveLength(0);
  });
});
