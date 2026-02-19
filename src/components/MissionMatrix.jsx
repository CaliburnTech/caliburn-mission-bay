import { useState, useMemo } from 'react';
import { X, ChevronRight, ExternalLink, Filter, Eye, EyeOff } from 'lucide-react';
import { individualCapabilities } from '../data/marketplaceData';
import { KEY_MARITIME_MISSIONS, KEY_AERIAL_MISSIONS, ALL_MISSIONS } from './mission-planner/constants';
import { CATEGORY_COLORS } from '../constants/colors';
import useNavigationStore from '../store/navigationStore';

// Platform types for rows
const PLATFORM_TYPES = [
  { key: 'USV', name: 'USV', description: 'Unmanned Surface Vessel', color: '#3b82f6' },
  { key: 'UUV', name: 'UUV', description: 'Unmanned Underwater Vehicle', color: '#06b6d4' },
  { key: 'UAV', name: 'UAV', description: 'Unmanned Aerial Vehicle', color: '#8b5cf6' },
  { key: 'Ship', name: 'Ship', description: 'Crewed Surface Vessel', color: '#64748b' }
];

// Get capabilities for a platform × mission intersection
const getCapabilitiesForCell = (platformType, missionKey) => {
  return individualCapabilities.filter(cap => {
    const platformMatch = cap.platformTypes?.includes(platformType);
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

// Cell Detail Panel (shows when clicking a cell)
const CellDetailPanel = ({ platformType, mission, capabilities, onClose, onSelectCapability }) => {
  const platform = PLATFORM_TYPES.find(p => p.key === platformType);

  return (
    <div className="bg-darker border border-gray-700/50 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: platform?.color || '#64748b' }}
          >
            {platformType}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{platform?.name}</span>
              <span className="text-gray-500">×</span>
              <span style={{ color: mission.color }} className="font-semibold">{mission.name}</span>
            </div>
            <p className="text-gray-500 text-sm">
              {capabilities.length === 0
                ? 'No payloads available - capability gap'
                : `${capabilities.length} payload${capabilities.length > 1 ? 's' : ''} available`}
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

      {capabilities.length > 0 ? (
        <div className="space-y-2">
          {capabilities.map(cap => {
            const categoryColor = CATEGORY_COLORS[cap.category?.replace(/[^A-Z]/g, '')]?.hex || '#64748b';
            return (
              <button
                key={cap.name}
                onClick={() => onSelectCapability(cap)}
                className="w-full p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium group-hover:text-lime-brand transition-colors">
                      {cap.name}
                    </div>
                    <div className="text-gray-500 text-sm">{cap.provider}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                    >
                      {cap.category}
                    </span>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-lime-brand transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2">○</div>
          <p>No payloads support this platform × mission combination</p>
          <p className="text-sm mt-1">This represents a capability gap</p>
        </div>
      )}
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

  // Build matrix data
  const matrixData = useMemo(() => {
    const data = {};
    PLATFORM_TYPES.forEach(platform => {
      data[platform.key] = {};
      missions.forEach(mission => {
        const capabilities = getCapabilitiesForCell(platform.key, mission.key);
        data[platform.key][mission.key] = {
          capabilities,
          count: capabilities.length,
          status: getCellStatus(capabilities.length)
        };
      });
    });
    return data;
  }, [missions]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalGaps = 0;
    let totalLimited = 0;
    let totalAvailable = 0;

    PLATFORM_TYPES.forEach(platform => {
      missions.forEach(mission => {
        const cell = matrixData[platform.key]?.[mission.key];
        if (cell?.status.status === 'gap') totalGaps++;
        else if (cell?.status.status === 'limited') totalLimited++;
        else totalAvailable++;
      });
    });

    return { totalGaps, totalLimited, totalAvailable };
  }, [matrixData, missions]);

  const handleCellClick = (platformKey, missionKey) => {
    if (selectedCell?.platform === platformKey && selectedCell?.mission === missionKey) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ platform: platformKey, mission: missionKey });
    }
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="p-3 text-left text-gray-400 text-sm font-medium w-24">Platform</th>
                {missions.map(mission => (
                  <th
                    key={mission.key}
                    className="p-3 text-center text-sm font-medium min-w-[100px]"
                    style={{ color: mission.color }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {mission.icon && <mission.icon size={16} />}
                      <span className="text-xs">{mission.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLATFORM_TYPES.map(platform => (
                <tr key={platform.key} className="border-b border-gray-700/30 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.key}
                      </div>
                      <span className="text-gray-300 text-sm hidden sm:inline">{platform.description}</span>
                    </div>
                  </td>
                  {missions.map(mission => {
                    const cell = matrixData[platform.key]?.[mission.key];
                    const isSelected = selectedCell?.platform === platform.key && selectedCell?.mission === mission.key;
                    const isGap = cell?.status.status === 'gap';

                    if (showGapsOnly && !isGap) {
                      return (
                        <td key={mission.key} className="p-3 text-center">
                          <div className="text-gray-700">—</div>
                        </td>
                      );
                    }

                    return (
                      <td key={mission.key} className="p-3 text-center">
                        <button
                          onClick={() => handleCellClick(platform.key, mission.key)}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${cell?.status.bg} ${
                            isSelected
                              ? 'ring-2 ring-lime-brand scale-110'
                              : 'hover:scale-105 hover:ring-1 hover:ring-gray-500'
                          }`}
                          title={`${platform.key} × ${mission.name}: ${cell?.count || 0} payloads`}
                        >
                          <span
                            className="text-2xl"
                            style={{ color: cell?.status.color }}
                          >
                            {cell?.count || '○'}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Detail */}
      {selectedCell && (
        <CellDetailPanel
          platformType={selectedCell.platform}
          mission={missions.find(m => m.key === selectedCell.mission)}
          capabilities={matrixData[selectedCell.platform]?.[selectedCell.mission]?.capabilities || []}
          onClose={() => setSelectedCell(null)}
          onSelectCapability={setSelectedCapability}
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
