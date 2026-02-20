import { useState, useMemo } from 'react';
import { X, ChevronRight, ExternalLink, Eye, EyeOff, Ship, Plus, Check } from 'lucide-react';
import { individualCapabilities } from '../data/marketplaceData';
import { vesselHullData, vesselHullComponents } from '../data/vesselData';
import { KEY_MARITIME_MISSIONS, KEY_AERIAL_MISSIONS, ALL_MISSIONS } from './mission-planner/constants';
import { CATEGORY_COLORS } from '../constants/colors';
import useNavigationStore from '../store/navigationStore';
import useOutfitterStore from '../store/outfitterStore';
import useSquadronStore from '../store/squadronStore';

// Platform type colors
const PLATFORM_COLORS = {
  USV: '#3b82f6',
  UUV: '#06b6d4',
  UAV: '#8b5cf6',
  Ship: '#64748b'
};

// Get capabilities for a vessel × mission intersection
const getCapabilitiesForCell = (vessel, missionKey) => {
  return individualCapabilities.filter(cap => {
    // Check if capability supports this vessel's platform type
    const platformMatch = cap.platformTypes?.includes(vessel.platformType);
    const missionMatch = cap.missionTags?.includes(missionKey);
    return platformMatch && missionMatch;
  });
};

// Cell status based on capability count
const getCellStatus = (count) => {
  if (count === 0) return { status: 'gap', color: '#374151', label: '○', bg: 'bg-gray-800/50' };
  if (count === 1) return { status: 'limited', color: '#f59e0b', label: '◐', bg: 'bg-amber-500/10' };
  return { status: 'available', color: '#22c55e', label: '■', bg: 'bg-green-500/10' };
};

// Capability Detail Modal
const CapabilityModal = ({ capability, onClose }) => {
  if (!capability) return null;

  const categoryColor = CATEGORY_COLORS[capability.category?.replace(/[^A-Z]/g, '')]?.hex || '#64748b';

  return (
    <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4">
      <div className="bg-darkest border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{capability.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{capability.provider}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-300 mb-4">{capability.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {capability.category}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
              {capability.trl}
            </span>
          </div>

          {/* Platform Compatibility */}
          {capability.platformTypes && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Platform Compatibility</h4>
              <div className="flex gap-2">
                {capability.platformTypes.map(pt => (
                  <span key={pt} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {pt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mission Tags */}
          {capability.missionTags && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Mission Support</h4>
              <div className="flex flex-wrap gap-2">
                {capability.missionTags.map(tag => {
                  const mission = ALL_MISSIONS.find(m => m.key === tag);
                  return (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: `${mission?.color || '#64748b'}20`, color: mission?.color || '#64748b' }}
                    >
                      {mission?.name || tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* SWaP */}
          {capability.swap && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">SWaP Requirements</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <div className="text-gray-500 text-xs">Weight</div>
                  <div className="text-white font-medium">{capability.swap.weight} kg</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <div className="text-gray-500 text-xs">Power</div>
                  <div className="text-white font-medium">{capability.swap.power} kW</div>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <div className="text-gray-500 text-xs">Size</div>
                  <div className="text-white font-medium capitalize">{capability.swap.size}</div>
                </div>
              </div>
            </div>
          )}

          {/* Capabilities list */}
          {capability.capabilities && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Features</h4>
              <ul className="space-y-1">
                {capability.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-brand" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 bg-darker/50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-lime-brand text-black font-semibold rounded-lg hover:bg-lime-brand/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Cell Detail Modal (shows when clicking a cell)
const CellDetailModal = ({ vessel, mission, capabilities = [], onClose, existingSquadrons = [], onViewSquadrons, onNewConfiguration }) => {
  const [selectedByCategory, setSelectedByCategory] = useState({});

  const platformColor = PLATFORM_COLORS[vessel?.platformType] || '#64748b';
  const VesselIcon = vessel ? (vesselHullComponents[vessel.icon] || vesselHullComponents[vessel.name]) : null;

  // Calculate totals from selected capabilities
  const selectedCaps = Object.values(selectedByCategory);
  const totalWeight = selectedCaps.reduce((sum, cap) => sum + (cap?.swap?.weight || 0), 0);
  const totalPower = selectedCaps.reduce((sum, cap) => sum + (cap?.swap?.power || 0), 0);

  const maxWeight = vessel?.capacity?.totalWeight || 0;
  const maxPower = vessel?.capacity?.totalPower || 0;

  const weightOverflow = maxWeight > 0 && totalWeight > maxWeight;
  const powerOverflow = maxPower > 0 && totalPower > maxPower;

  const toggleCapability = (category, cap) => {
    setSelectedByCategory(prev => {
      if (prev[category]?.name === cap.name) {
        // Deselect
        const next = { ...prev };
        delete next[category];
        return next;
      }
      // Select (replaces any existing selection in this category)
      return { ...prev, [category]: cap };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-darker border border-gray-700 rounded-xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 flex items-center justify-center overflow-hidden rounded-lg bg-gray-800/50">
            {VesselIcon ? (
              <VesselIcon size={64} className="opacity-80" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: platformColor }}
              >
                {vessel?.platformType || '?'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold">{vessel?.name || 'Unknown'}</span>
              <span className="text-gray-500">for</span>
              <span style={{ color: mission?.color || '#888' }} className="font-semibold">{mission?.name || 'Unknown'}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {capabilities.length === 0
                ? 'No compatible payloads in marketplace'
                : `${capabilities.length} payload options across ${Object.keys(capabilities.reduce((g, c) => ({ ...g, [c.category || 'OTHER']: true }), {})).length} categories`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Vessel Specs Bar with Running Totals */}
      {vessel?.capacity && (
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-gray-500 text-xs uppercase">Payload</div>
              <div className={`font-semibold ${weightOverflow ? 'text-red-400' : totalWeight > 0 ? 'text-lime-brand' : 'text-white'}`}>
                {totalWeight > 0 ? `${totalWeight} / ${maxWeight}` : maxWeight} kg
              </div>
              {maxWeight > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${weightOverflow ? 'bg-red-400' : 'bg-lime-brand'}`}
                    style={{ width: `${Math.min((totalWeight / maxWeight) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Power</div>
              <div className={`font-semibold ${powerOverflow ? 'text-red-400' : totalPower > 0 ? 'text-yellow-400' : 'text-white'}`}>
                {totalPower > 0 ? `${totalPower} / ${maxPower}` : maxPower} kW
              </div>
              {maxPower > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${powerOverflow ? 'bg-red-400' : 'bg-yellow-400'}`}
                    style={{ width: `${Math.min((totalPower / maxPower) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Range</div>
              <div className="text-white font-semibold">{vessel.specs?.range || '—'} nm</div>
            </div>
          </div>
          {selectedCaps.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-400 text-center">
              {selectedCaps.length} payload{selectedCaps.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-2 mb-4">
        {existingSquadrons.length > 0 && (
          <button
            onClick={onViewSquadrons}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm transition-colors"
          >
            <Ship size={16} />
            View {existingSquadrons.length} Existing
          </button>
        )}
        <button
          onClick={onNewConfiguration}
          disabled={weightOverflow || powerOverflow}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            weightOverflow || powerOverflow
              ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
              : selectedCaps.length > 0
                ? 'bg-lime-brand hover:bg-lime-brand/90 text-black'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {weightOverflow || powerOverflow ? (
            <>Exceeds Capacity</>
          ) : selectedCaps.length > 0 ? (
            <>
              <Check size={16} />
              Create with {selectedCaps.length} Payload{selectedCaps.length > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <Plus size={16} />
              Configure {vessel?.name || 'Vessel'}
            </>
          )}
        </button>
      </div>

      {capabilities.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs text-gray-400 mb-2">
            Build a loadout by selecting from each category:
          </div>
          {/* Group capabilities by category */}
          {Object.entries(
            capabilities.reduce((groups, cap) => {
              const category = cap.category || 'OTHER';
              if (!groups[category]) groups[category] = [];
              groups[category].push(cap);
              return groups;
            }, {})
          ).map(([category, caps]) => {
            const categoryColor = CATEGORY_COLORS[category?.replace(/[^A-Z]/g, '')]?.hex || '#64748b';
            return (
              <div key={category} className="border border-gray-700/50 rounded-lg overflow-hidden">
                <div
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide flex items-center justify-between"
                  style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                >
                  <span>{category}</span>
                  <span className="text-gray-500 font-normal">pick 1 of {caps.length}</span>
                </div>
                <div className="divide-y divide-gray-700/30">
                  {caps.map(cap => {
                    const isSelected = selectedByCategory[category]?.name === cap.name;
                    return (
                      <button
                        key={cap.name}
                        onClick={() => toggleCapability(category, cap)}
                        className={`w-full p-3 text-left transition-colors group ${isSelected ? 'bg-lime-brand/10' : 'hover:bg-gray-800/50'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-lime-brand bg-lime-brand' : 'border-gray-600'}`}>
                              {isSelected && <Check size={10} className="text-black" />}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-medium text-sm truncate transition-colors ${isSelected ? 'text-lime-brand' : 'text-white group-hover:text-lime-brand'}`}>
                                {cap.name}
                              </div>
                              <div className="text-gray-500 text-xs">{cap.provider}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs shrink-0">
                            {cap.swap?.weight > 0 && (
                              <span className="text-gray-400">{cap.swap.weight}kg</span>
                            )}
                            {cap.swap?.power > 0 && (
                              <span className="text-yellow-500">{cap.swap.power}kW</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2">○</div>
          <p>No payloads in the marketplace support this combination</p>
          <p className="text-sm mt-1 text-amber-500">Capability gap - contact vendors for solutions</p>
        </div>
      )}
      </div>
    </div>
  );
};

// Main Mission Matrix Component
const MissionMatrix = () => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const [domainFilter, setDomainFilter] = useState('MARITIME'); // MARITIME, AERIAL, ALL

  const { setSelectedView } = useNavigationStore();
  const { setSelectedHull, setSelectedMountPoint, setVesselConfiguration } = useOutfitterStore();
  const { squadrons } = useSquadronStore();

  // Get missions based on domain filter
  const missions = useMemo(() => {
    switch (domainFilter) {
      case 'MARITIME':
        return KEY_MARITIME_MISSIONS;
      case 'AERIAL':
        return KEY_AERIAL_MISSIONS;
      default:
        return ALL_MISSIONS;
    }
  }, [domainFilter]);

  // Filter vessels based on domain
  const vessels = useMemo(() => {
    return vesselHullData.filter(vessel => {
      if (domainFilter === 'MARITIME') {
        return vessel.platformType === 'USV' || vessel.platformType === 'UUV' || vessel.platformType === 'Ship';
      }
      if (domainFilter === 'AERIAL') {
        return vessel.platformType === 'UAV';
      }
      return true; // ALL
    });
  }, [domainFilter]);

  // Build matrix data
  const matrixData = useMemo(() => {
    const data = {};
    vessels.forEach(vessel => {
      data[vessel.name] = {};
      missions.forEach(mission => {
        const capabilities = getCapabilitiesForCell(vessel, mission.key);
        data[vessel.name][mission.key] = {
          capabilities,
          count: capabilities.length,
          status: getCellStatus(capabilities.length)
        };
      });
    });
    return data;
  }, [missions, vessels]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalGaps = 0;
    let totalLimited = 0;
    let totalAvailable = 0;

    vessels.forEach(vessel => {
      missions.forEach(mission => {
        const cell = matrixData[vessel.name]?.[mission.key];
        if (cell?.status?.status === 'gap') totalGaps++;
        else if (cell?.status?.status === 'limited') totalLimited++;
        else totalAvailable++;
      });
    });

    return { totalGaps, totalLimited, totalAvailable };
  }, [matrixData, missions, vessels]);

  const handleCellClick = (vesselName, missionKey) => {
    if (selectedCell?.vessel === vesselName && selectedCell?.mission === missionKey) {
      setSelectedCell(null);
    } else {
      const vessel = vessels.find(v => v.name === vesselName);
      setSelectedCell({ vessel: vesselName, vesselData: vessel, mission: missionKey });
    }
  };

  // Get existing squadrons for a vessel
  const getSquadronsForVessel = (vesselName) => {
    return (squadrons || []).filter(s => s.hullName === vesselName || s.platformName === vesselName);
  };

  // Navigate to view existing squadrons
  const handleViewSquadrons = () => {
    setSelectedView('shipyard');
  };

  // Navigate to create new configuration
  const handleNewConfiguration = (vessel) => {
    setSelectedHull(vessel);
    setSelectedMountPoint(null);
    setVesselConfiguration({});
    setSelectedView('outfitter');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Matrix</h1>
          <p className="text-gray-400 mt-1">Platform × Mission capability coverage</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 bg-darker border border-gray-700 rounded-lg text-gray-200 text-sm"
          >
            <option value="MARITIME">Maritime Missions</option>
            <option value="AERIAL">Aerial Missions</option>
            <option value="ALL">All Missions</option>
          </select>

          {/* Show Gaps Toggle */}
          <button
            onClick={() => setShowGapsOnly(!showGapsOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showGapsOnly
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            {showGapsOnly ? <EyeOff size={16} /> : <Eye size={16} />}
            {showGapsOnly ? 'Showing Gaps' : 'Show Gaps Only'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-lg">■</span>
          <span className="text-gray-400">Multiple solutions ({totals.totalAvailable})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">◐</span>
          <span className="text-gray-400">Limited ({totals.totalLimited})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-lg">○</span>
          <span className="text-gray-400">Gap ({totals.totalGaps})</span>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="bg-darker rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="p-3 text-left text-gray-400 text-sm font-medium w-48">Platform</th>
                {missions.map(mission => (
                  <th
                    key={mission.key}
                    className="p-2 text-center text-sm font-medium"
                    style={{ color: mission.color }}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      {mission.icon && <mission.icon size={16} />}
                      <span className="text-xs leading-tight">{mission.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vessels.map(vessel => {
                const platformColor = PLATFORM_COLORS[vessel.platformType] || '#64748b';
                const VesselIcon = vesselHullComponents[vessel.icon] || vesselHullComponents[vessel.name];
                return (
                  <tr key={vessel.name} className="border-b border-gray-700/30 last:border-0">
                    <td className="p-2 w-48">
                      <button
                        onClick={() => handleNewConfiguration(vessel)}
                        className="flex items-center gap-2 w-full text-left group cursor-pointer hover:bg-gray-800/50 rounded-lg p-1 -m-1 transition-colors"
                        title={`Configure ${vessel.name}`}
                      >
                        <div className="w-10 h-7 flex-shrink-0 flex items-center justify-center overflow-hidden rounded bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors">
                          {VesselIcon ? (
                            <VesselIcon size={40} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: platformColor }}
                            >
                              {vessel.platformType}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-gray-200 text-sm font-medium truncate group-hover:text-lime-brand transition-colors">{vessel.name}</span>
                          <span className="text-gray-500 text-xs">{vessel.platformType}</span>
                        </div>
                      </button>
                    </td>
                    {missions.map(mission => {
                      const cell = matrixData[vessel.name]?.[mission.key];
                      const isSelected = selectedCell?.vessel === vessel.name && selectedCell?.mission === mission.key;
                      const isGap = cell?.status?.status === 'gap';

                      if (showGapsOnly && !isGap) {
                        return (
                          <td key={mission.key} className="p-2">
                            <div className="flex justify-center">
                              <div className="w-12 h-12 flex items-center justify-center text-gray-700">—</div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={mission.key} className="p-2">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleCellClick(vessel.name, mission.key)}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all border ${cell?.status?.bg} ${
                                isSelected
                                  ? 'ring-2 ring-lime-brand scale-110 border-lime-brand'
                                  : 'border-transparent hover:scale-110 hover:border-gray-500 hover:shadow-lg hover:shadow-black/20'
                              }`}
                              title={`Click to view ${cell?.count || 0} payloads for ${vessel.name} × ${mission.name}`}
                            >
                              <span
                                className="text-xl font-semibold"
                                style={{ color: cell?.status?.color }}
                              >
                                {cell?.count || '○'}
                              </span>
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Detail Modal */}
      {selectedCell && (
        <CellDetailModal
          vessel={selectedCell.vesselData}
          mission={missions.find(m => m.key === selectedCell.mission)}
          capabilities={matrixData[selectedCell.vessel]?.[selectedCell.mission]?.capabilities || []}
          onClose={() => setSelectedCell(null)}
          existingSquadrons={getSquadronsForVessel(selectedCell.vessel)}
          onViewSquadrons={handleViewSquadrons}
          onNewConfiguration={() => handleNewConfiguration(selectedCell.vesselData)}
        />
      )}

      {/* Capability Detail Modal */}
      <CapabilityModal
        capability={selectedCapability}
        onClose={() => setSelectedCapability(null)}
      />

      {/* Quick Actions */}
      <div className="flex items-center justify-between p-4 bg-darker rounded-xl border border-gray-700/50">
        <div className="text-sm text-gray-400">
          Click any cell to see available payloads for that platform × mission combination
        </div>
        <button
          onClick={() => setSelectedView('squadron')}
          className="flex items-center gap-2 px-4 py-2 bg-lime-brand text-black font-semibold rounded-lg hover:bg-lime-brand/90 transition-colors"
        >
          Plan a Mission
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
};

export default MissionMatrix;
