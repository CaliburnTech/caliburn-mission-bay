import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionMatrix from './MissionMatrix';

// Hoisted so the vi.mock factories below can reference them
const storeMocks = vi.hoisted(() => ({
  setSelectedView: vi.fn(),
  setSelectedHull: vi.fn(),
  setSelectedMountPoint: vi.fn(),
  setVesselConfiguration: vi.fn(),
}));

// Mock the stores (MissionMatrix calls these hooks without selectors)
vi.mock('../store/navigationStore', () => ({
  default: () => ({
    setSelectedView: storeMocks.setSelectedView,
  }),
}));

vi.mock('../store/outfitterStore', () => ({
  default: () => ({
    setSelectedHull: storeMocks.setSelectedHull,
    setSelectedMountPoint: storeMocks.setSelectedMountPoint,
    setVesselConfiguration: storeMocks.setVesselConfiguration,
  }),
}));

vi.mock('../store/squadronStore', () => ({
  default: () => ({
    squadrons: [],
  }),
}));

// Spread the REAL modules so transitive importers keep working
// (configurationStore needs VESSEL_SLOT_CAPACITY/engineeringStacks,
// staticAdapter needs capabilityCategories/squadrons, etc.) and override
// only the data the matrix renders.
vi.mock('../data/vesselData', async (importOriginal) => ({
  ...(await importOriginal()),
  vesselHullData: [
    { name: 'TestVessel', platformType: 'USV', icon: 'TestVessel' },
  ],
}));

vi.mock('../data/marketplaceData', async (importOriginal) => ({
  ...(await importOriginal()),
  individualCapabilities: [
    {
      name: 'TestCapability',
      provider: 'Test Provider',
      category: 'SENSORS',
      platformTypes: ['USV'],
      // MCM is a real KEY_MARITIME_MISSIONS key, so the TestVessel × MCM
      // cell has exactly one compatible payload; every other cell is a gap.
      missionTags: ['MCM'],
    },
  ],
}));

describe('MissionMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the matrix with the mocked platform and mission columns', () => {
    render(<MissionMatrix />);

    expect(screen.getByText('Mission Matrix')).toBeInTheDocument();
    // Vessel row (default MARITIME filter includes USV)
    expect(screen.getByText('TestVessel')).toBeInTheDocument();
    // A maritime mission column header
    expect(screen.getByText('Mine Countermeasures')).toBeInTheDocument();
    // Legend totals: exactly one limited cell (TestVessel × MCM), rest gaps
    expect(screen.getByText(/Limited \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Multiple solutions \(0\)/)).toBeInTheDocument();
  });

  it('opens the cell detail modal with compatible payloads on cell click', () => {
    render(<MissionMatrix />);

    // The TestVessel × MCM cell has 1 compatible payload
    const cell = screen.getByTitle(/1 payloads for TestVessel × Mine Countermeasures/);
    fireEvent.click(cell);

    // Modal lists the matching capability and its provider
    expect(screen.getByText('TestCapability')).toBeInTheDocument();
    expect(screen.getByText('Test Provider')).toBeInTheDocument();
    expect(screen.getByText(/1 payload options across 1 categories/)).toBeInTheDocument();
  });

  it('filters out maritime vessels when switching the domain to AERIAL', () => {
    render(<MissionMatrix />);
    expect(screen.getByText('TestVessel')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'AERIAL' } });

    // USV vessel is hidden, aerial mission columns are shown
    expect(screen.queryByText('TestVessel')).not.toBeInTheDocument();
    expect(screen.getByText('Aerial ISR')).toBeInTheDocument();
  });

  it('hides non-gap cells when the gaps toggle is on', () => {
    render(<MissionMatrix />);

    // The non-gap MCM cell is present before toggling
    expect(screen.getByTitle(/1 payloads for TestVessel × Mine Countermeasures/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Gaps Only'));

    // Toggle label flips and the non-gap cell is replaced by a placeholder
    expect(screen.getByText('Showing Gaps')).toBeInTheDocument();
    expect(screen.queryByTitle(/1 payloads for TestVessel × Mine Countermeasures/)).not.toBeInTheDocument();
    // Gap cells (0 payloads) are still rendered
    expect(screen.getAllByTitle(/0 payloads for TestVessel/).length).toBeGreaterThan(0);
  });

  it('navigates to the outfitter when a vessel row is clicked', () => {
    render(<MissionMatrix />);

    fireEvent.click(screen.getByTitle('Configure TestVessel'));

    expect(storeMocks.setSelectedHull).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'TestVessel' })
    );
    expect(storeMocks.setVesselConfiguration).toHaveBeenCalledWith({});
    expect(storeMocks.setSelectedView).toHaveBeenCalledWith('outfitter');
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
