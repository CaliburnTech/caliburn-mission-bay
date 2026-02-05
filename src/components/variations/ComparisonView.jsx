import React from 'react';
import { X, Ship, GitBranch, Zap, Navigation, Shield } from 'lucide-react';
import useSquadronStore from '../../store/squadronStore';
import VariationBadge from './VariationBadge';

/**
 * Side-by-side comparison view for up to 4 squadrons
 */
const ComparisonView = () => {
  const {
    isComparisonViewOpen,
    setComparisonViewOpen,
    comparisonSquadronIds,
    getComparisonData,
    removeFromComparison,
    clearComparison,
    squadronUnitConfigurations
  } = useSquadronStore();

  if (!isComparisonViewOpen || comparisonSquadronIds.length < 2) return null;

  const squadrons = getComparisonData();

  // Define comparison properties
  const comparisonFields = [
    { key: 'type', label: 'Type', icon: Ship },
    { key: 'totalUnits', label: 'Total Units', icon: Zap, format: (v) => v?.toLocaleString() },
    { key: 'description', label: 'Description', isLong: true },
  ];

  // Status fields to compare
  const statusFields = ['missionReady', 'deployed', 'charging', 'maintenance', 'inRefit', 'atSea'];

  // Get capabilities from unit configs
  const getSquadronCapabilities = (squadronId) => {
    const config = squadronUnitConfigurations[squadronId];
    if (!config?.outfits) return [];
    const allCaps = config.outfits.flatMap(o => o.capabilities || []);
    return [...new Set(allCaps)]; // Unique capabilities
  };

  // Get all unique capabilities across all compared squadrons
  const allCapabilities = [...new Set(
    squadrons.flatMap(s => getSquadronCapabilities(s.id))
  )].sort();

  return (
    <div className="fixed inset-0 bg-black/90 z-[1000] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-darkest">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl font-bold">Squadron Comparison</h2>
            <span className="text-gray-400 text-sm">
              {squadrons.length} squadrons selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearComparison}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear All
            </button>
            <button
              onClick={() => setComparisonViewOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Squadron Headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}>
            <div /> {/* Empty corner cell */}
            {squadrons.map((squadron) => (
              <div key={squadron.id} className="bg-darker rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Ship size={18} className="text-lime-brand" />
                    <h3 className="text-white font-bold truncate">{squadron.name}</h3>
                  </div>
                  <button
                    onClick={() => removeFromComparison(squadron.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                {squadron.isVariation && (
                  <VariationBadge
                    parentName={squadron.parentName}
                    parentId={squadron.parentId}
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Basic Properties */}
          <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden mb-6">
            <div className="p-3 border-b border-gray-700 bg-gray-800/50">
              <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">Basic Properties</h4>
            </div>
            {comparisonFields.map((field) => (
              <div
                key={field.key}
                className="grid gap-4 border-b border-gray-700/50 last:border-0"
                style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
              >
                <div className="p-3 bg-gray-800/30 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  {field.icon && <field.icon size={14} />}
                  {field.label}
                </div>
                {squadrons.map((squadron) => {
                  const value = squadron[field.key];
                  const displayValue = field.format ? field.format(value) : value;
                  return (
                    <div
                      key={squadron.id}
                      className={`p-3 text-white ${field.isLong ? 'text-sm' : ''}`}
                    >
                      {displayValue || '-'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden mb-6">
            <div className="p-3 border-b border-gray-700 bg-gray-800/50">
              <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">Status Breakdown</h4>
            </div>
            {statusFields.map((field) => {
              // Only show fields that at least one squadron has
              const hasField = squadrons.some(s => s.status?.[field] !== undefined);
              if (!hasField) return null;

              return (
                <div
                  key={field}
                  className="grid gap-4 border-b border-gray-700/50 last:border-0"
                  style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
                >
                  <div className="p-3 bg-gray-800/30 text-gray-400 text-sm font-medium capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  {squadrons.map((squadron) => {
                    const value = squadron.status?.[field];
                    const total = squadron.totalUnits || 1;
                    const percentage = value ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={squadron.id} className="p-3 flex items-center gap-2">
                        <span className="text-white">{value?.toLocaleString() || '-'}</span>
                        {value !== undefined && (
                          <span className="text-gray-500 text-xs">({percentage}%)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Capabilities Comparison */}
          {allCapabilities.length > 0 && (
            <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">
                  Capabilities ({allCapabilities.length})
                </h4>
              </div>
              {allCapabilities.map((capability) => (
                <div
                  key={capability}
                  className="grid gap-4 border-b border-gray-700/50 last:border-0"
                  style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
                >
                  <div className="p-3 bg-gray-800/30 text-gray-400 text-sm font-medium truncate" title={capability}>
                    {capability}
                  </div>
                  {squadrons.map((squadron) => {
                    const hasCap = getSquadronCapabilities(squadron.id).includes(capability);
                    return (
                      <div key={squadron.id} className="p-3">
                        {hasCap ? (
                          <span className="inline-flex items-center gap-1 text-lime-brand text-sm">
                            <Shield size={14} />
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
