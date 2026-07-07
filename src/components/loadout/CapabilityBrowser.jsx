import { useState, useMemo } from 'react';
import { X, Shield, Plus } from 'lucide-react';
import { individualCapabilities } from '../../data/marketplaceData';

/**
 * Slide-out panel for browsing and selecting capabilities.
 * Used in the loadout builder to add capabilities to slots.
 */
const CapabilityBrowser = ({
  isOpen,
  onClose,
  category,
  onSelect,
  onHover,
  equippedIds,
  initialSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Reset search term when initialSearchTerm changes (for global search).
  // Uses the React "adjust state during render" pattern instead of an effect.
  const [prevInitialSearchTerm, setPrevInitialSearchTerm] = useState(initialSearchTerm);
  if (initialSearchTerm !== prevInitialSearchTerm) {
    setPrevInitialSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }

  // Filter capabilities by category types (or show all if types is null)
  const availableCapabilities = useMemo(() => {
    if (!category) return [];
    // If types is null, show all capabilities (global search mode)
    if (category.types === null) {
      return individualCapabilities.filter(cap => !equippedIds.includes(cap.name));
    }
    return individualCapabilities.filter(cap =>
      category.types.includes(cap.category) &&
      !equippedIds.includes(cap.name)
    );
  }, [category, equippedIds]);

  const filteredCapabilities = useMemo(() => {
    if (!searchTerm) return availableCapabilities;
    const term = searchTerm.toLowerCase();
    return availableCapabilities.filter(cap =>
      cap.name.toLowerCase().includes(term) ||
      cap.provider.toLowerCase().includes(term) ||
      cap.capabilities?.some(c => c.toLowerCase().includes(term))
    );
  }, [availableCapabilities, searchTerm]);

  if (!isOpen || !category) return null;

  const Icon = category.icon;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end">
      <div
        className="h-full w-[450px] bg-darkest border-l-2 flex flex-col animate-slide-in-right"
        style={{ borderColor: category.color }}
      >
        {/* Header */}
        <div
          className="p-4 border-b border-gray-700/50"
          style={{ backgroundColor: `${category.color}10` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${category.color}30` }}
              >
                <Icon size={22} color={category.color} />
              </div>
              <div>
                <h3 className="text-gray-100 font-bold text-lg">{category.name}</h3>
                <p className="text-gray-400 text-sm">{availableCapabilities.length} available</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search capabilities..."
            className="w-full px-3 py-2 bg-darker border border-gray-600/50 rounded-lg text-gray-100 text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Capability List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCapabilities.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No matching capabilities</p>
            </div>
          ) : (
            filteredCapabilities.map((cap) => (
              <button
                key={cap.name}
                onClick={() => onSelect(cap)}
                onMouseEnter={() => onHover?.(cap)}
                onMouseLeave={() => onHover?.(null)}
                className="w-full bg-darker border border-gray-700/50 rounded-lg p-4 text-left hover:border-lime-brand/50 hover:bg-lime-brand/5 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {cap.icon ? (
                      <cap.icon size={24} className="text-gray-400 group-hover:text-lime-brand transition-colors" />
                    ) : (
                      <Shield size={24} className="text-gray-400 group-hover:text-lime-brand transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-100 font-semibold group-hover:text-lime-brand transition-colors">
                      {cap.name}
                    </div>
                    <div className="text-gray-500 text-sm">{cap.provider}</div>
                    <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {cap.description}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 mt-2 text-xs">
                      {cap.swap?.power > 0 && (
                        <span className="text-yellow-400">-{cap.swap.power}kW</span>
                      )}
                      {cap.swap?.weight > 0 && (
                        <span className="text-gray-400">{cap.swap.weight}kg</span>
                      )}
                      <span className="text-cyan-400">{cap.trl}</span>
                    </div>

                    {/* Capabilities tags */}
                    {cap.capabilities && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cap.capabilities.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-700/50 rounded text-[0.65rem] text-gray-400"
                          >
                            {c}
                          </span>
                        ))}
                        {cap.capabilities.length > 3 && (
                          <span className="text-gray-500 text-[0.65rem]">
                            +{cap.capabilities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Plus
                    size={20}
                    className="text-gray-600 group-hover:text-lime-brand transition-colors flex-shrink-0"
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CapabilityBrowser;
