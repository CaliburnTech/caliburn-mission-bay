import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, Eye, Radio, Crosshair, Shield, Navigation, Cpu,
  Wifi, Radar, Zap, Plus, X, Check, AlertTriangle, Ship, Rocket,
  AlertCircle, CheckCircle2, Search
} from 'lucide-react';
import useOutfitterStore from '../store/outfitterStore';
import useNavigationStore from '../store/navigationStore';
import { vesselHullData, vesselHullComponents } from '../data/vesselData';
import { individualCapabilities } from '../data/marketplaceData';
import DeploymentFlowModal from './loadout/DeploymentFlowModal';

// Category definitions with icons, colors, and compatible equipment types
const LOADOUT_CATEGORIES = {
  SENSORS: {
    name: 'Sensors',
    icon: Eye,
    color: '#06b6d4', // cyan
    types: ['EO/IR SENSORS', 'RADAR/RF', 'ACOUSTIC/SONAR'],
    description: 'Detection & surveillance systems'
  },
  COMMS: {
    name: 'Communications',
    icon: Wifi,
    color: '#8b5cf6', // violet
    types: ['RF COMMUNICATIONS', 'SATCOM', 'UNDERWATER COMMS'],
    description: 'Data links & networking'
  },
  WEAPONS: {
    name: 'Weapons',
    icon: Crosshair,
    color: '#ef4444', // red
    types: ['KINETIC WEAPONS', 'DIRECTED ENERGY'],
    description: 'Offensive capabilities'
  },
  EW: {
    name: 'Electronic Warfare',
    icon: Zap,
    color: '#f97316', // orange
    types: ['ELECTRONIC SUPPORT', 'ELECTRONIC ATTACK', 'ELECTRONIC PROTECTION'],
    description: 'EW & countermeasures'
  },
  NAV: {
    name: 'Navigation',
    icon: Navigation,
    color: '#22c55e', // green
    types: ['NAVIGATION'],
    description: 'Position & guidance'
  },
  AI: {
    name: 'AI & Autonomy',
    icon: Cpu,
    color: '#cbfd00', // lime brand
    types: ['UNMANNED SYSTEMS', 'COMMAND & CONTROL'],
    description: 'Autonomous control systems',
    hasCore: true // TempestOS always present
  },
  UTILITY: {
    name: 'Utility',
    icon: Shield,
    color: '#64748b', // slate
    types: ['LOGISTICS', 'LOGISTICS & SUPPORT', 'MAINTENANCE', 'SUPPLY CHAIN', 'DATA PROCESSING', 'CYBER DEFENSE'],
    description: 'Support & utility systems'
  },
  OTHER: {
    name: 'Other',
    icon: Plus,
    color: '#a855f7', // purple
    types: null, // null means accepts any type
    description: 'Custom & miscellaneous'
  }
};

// Special "ALL" category for global search
const ALL_CATEGORY = {
  name: 'All Capabilities',
  icon: Search,
  color: '#cbfd00', // lime brand
  types: null, // null means show all
  description: 'Search all capabilities'
};

// Slot capacity per vessel type (simplified from complex mount points)
const VESSEL_SLOT_CAPACITY = {
  // Small USVs
  "MetalShark": { SENSORS: 2, COMMS: 2, WEAPONS: 1, EW: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  "Saildrone": { SENSORS: 2, COMMS: 2, WEAPONS: 0, EW: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  "SubSeaSail": { SENSORS: 1, COMMS: 1, WEAPONS: 0, EW: 0, NAV: 1, AI: 1, UTILITY: 0, OTHER: 0 },
  "Otter X": { SENSORS: 2, COMMS: 1, WEAPONS: 0, EW: 0, NAV: 1, AI: 1, UTILITY: 1, OTHER: 0 },
  "Mariner": { SENSORS: 2, COMMS: 2, WEAPONS: 1, EW: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  // SNC AEGIR Family
  "AEGIR-F": { SENSORS: 1, COMMS: 1, WEAPONS: 1, EW: 0, NAV: 1, AI: 1, UTILITY: 0, OTHER: 0 },
  "AEGIR-W": { SENSORS: 2, COMMS: 2, WEAPONS: 2, EW: 2, NAV: 1, AI: 2, UTILITY: 2, OTHER: 0 },
  "AEGIR-H": { SENSORS: 3, COMMS: 3, WEAPONS: 2, EW: 2, NAV: 2, AI: 3, UTILITY: 3, OTHER: 0 },
  // Medium USVs
  "MASC": { SENSORS: 3, COMMS: 3, WEAPONS: 2, EW: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 },
  // AUSV
  "Triton": { SENSORS: 2, COMMS: 2, WEAPONS: 0, EW: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 },
  // Large UUV
  "Manta Ray": { SENSORS: 3, COMMS: 2, WEAPONS: 1, EW: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 },
  // Crewed vessels
  "Arleigh Burke": { SENSORS: 5, COMMS: 4, WEAPONS: 6, EW: 3, NAV: 2, AI: 4, UTILITY: 3, OTHER: 0 },
  "Virginia Class": { SENSORS: 4, COMMS: 3, WEAPONS: 4, EW: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 },
  // Fallback
  "Custom Platform": { SENSORS: 3, COMMS: 2, WEAPONS: 2, EW: 2, NAV: 2, AI: 3, UTILITY: 2, OTHER: 0 }
};

// Default slot capacity for unknown vessels
const DEFAULT_SLOTS = { SENSORS: 2, COMMS: 2, WEAPONS: 1, EW: 1, NAV: 1, AI: 2, UTILITY: 1, OTHER: 0 };

// All category keys for iteration
const ALL_CATEGORY_KEYS = ['SENSORS', 'COMMS', 'WEAPONS', 'EW', 'NAV', 'AI', 'UTILITY', 'OTHER'];

// Capability Card Component
const CapabilityCard = ({ capability, onRemove, isCore }) => {
  if (!capability) return null;

  return (
    <div className={`relative group bg-darkest border rounded-lg p-2 ${isCore ? 'border-lime-brand/50' : 'border-gray-600/50'}`}>
      <div className="flex items-start gap-2">
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isCore ? '#cbfd0020' : '#ffffff10' }}
        >
          {capability.icon ? (
            <capability.icon size={16} color={isCore ? '#cbfd00' : '#9ca3af'} />
          ) : (
            <Shield size={16} color={isCore ? '#cbfd00' : '#9ca3af'} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-100 text-xs font-semibold truncate">
            {capability.name}
          </div>
          <div className="text-gray-500 text-[0.65rem] truncate">
            {capability.provider}
          </div>
        </div>
        {!isCore && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
          >
            <X size={12} className="text-red-400" />
          </button>
        )}
      </div>
      {capability.swap && (
        <div className="flex gap-2 mt-1.5 text-[0.6rem]">
          {capability.swap.power > 0 && (
            <span className="text-yellow-400">-{capability.swap.power}kW</span>
          )}
          {capability.swap.weight > 0 && (
            <span className="text-gray-400">{capability.swap.weight}kg</span>
          )}
        </div>
      )}
    </div>
  );
};

// Empty Slot Component
const EmptySlot = ({ onClick, categoryColor }) => (
  <button
    onClick={onClick}
    className="w-full border-2 border-dashed rounded-lg p-3 flex items-center justify-center gap-2 transition-all hover:border-solid group"
    style={{ borderColor: `${categoryColor}40`, backgroundColor: `${categoryColor}05` }}
  >
    <Plus size={14} style={{ color: categoryColor }} className="opacity-50 group-hover:opacity-100" />
    <span className="text-gray-500 text-xs group-hover:text-gray-300">Add</span>
  </button>
);

// Dot Capacity Indicator
const SlotCapacityDots = ({ filled, total, color }) => (
  <div className="flex gap-1">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className="w-2 h-2 rounded-full transition-all"
        style={{
          backgroundColor: i < filled ? color : `${color}30`,
          boxShadow: i < filled ? `0 0 6px ${color}50` : 'none'
        }}
      />
    ))}
  </div>
);

// Category Slot Card Component
const CategorySlotCard = ({
  categoryKey,
  category,
  equipped,
  baseCapacity,
  extraSlots,
  onSlotClick,
  onRemove,
  onAddSlot,
  onRemoveSlot,
  onHide,
  isSelected
}) => {
  const Icon = category.icon;
  const totalCapacity = baseCapacity + extraSlots;
  const filledCount = equipped.filter(Boolean).length;
  const canHide = filledCount === 0; // Can only hide if nothing equipped

  return (
    <div
      className={`bg-darker rounded-xl border-2 p-4 transition-all relative group ${
        isSelected ? 'border-lime-brand shadow-lg shadow-lime-brand/10' : 'border-gray-700/50'
      }`}
    >
      {/* Hide button */}
      {canHide && onHide && (
        <button
          onClick={() => onHide(categoryKey)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Hide category"
        >
          <X size={12} className="text-gray-300" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon size={18} color={category.color} />
          </div>
          <div>
            <div className="text-gray-100 text-sm font-semibold">{category.name}</div>
            <div className="text-gray-500 text-[0.65rem]">{category.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SlotCapacityDots filled={filledCount} total={totalCapacity} color={category.color} />
          {extraSlots > 0 && (
            <span className="text-[0.6rem] text-yellow-400 font-medium">+{extraSlots}</span>
          )}
        </div>
      </div>

      {/* Slots */}
      <div className="space-y-2">
        {/* TempestOS Core (always first in AI category) */}
        {category.hasCore && (
          <CapabilityCard
            capability={{
              name: 'TempestOS Core',
              provider: 'Caliburn',
              icon: Cpu
            }}
            isCore={true}
          />
        )}

        {/* Equipped capabilities */}
        {equipped.map((cap, idx) => (
          <div key={idx} className="relative group">
            {cap ? (
              <CapabilityCard
                capability={cap}
                onRemove={() => onRemove(categoryKey, idx)}
              />
            ) : (
              <EmptySlot
                onClick={() => onSlotClick(categoryKey, idx)}
                categoryColor={category.color}
              />
            )}
            {/* Show remove slot button for extra slots when empty */}
            {!cap && idx >= baseCapacity && (
              <button
                onClick={() => onRemoveSlot(categoryKey)}
                className="absolute -right-1 -top-1 w-4 h-4 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove slot"
              >
                <X size={10} className="text-white" />
              </button>
            )}
          </div>
        ))}

        {/* No slots message */}
        {totalCapacity === 0 && !category.hasCore && (
          <div className="text-gray-600 text-xs text-center py-2 italic">
            Not available on this platform
          </div>
        )}

        {/* Add Slot Button */}
        <button
          onClick={() => onAddSlot(categoryKey)}
          className="w-full border border-dashed border-gray-600/50 rounded-lg py-2 flex items-center justify-center gap-1.5 text-gray-500 hover:border-lime-brand/50 hover:text-lime-brand/70 transition-all text-xs"
        >
          <Plus size={12} />
          Add {category.name} Slot
        </button>
      </div>
    </div>
  );
};

// Capability Browser Panel
const CapabilityBrowser = ({
  isOpen,
  onClose,
  category,
  onSelect,
  onHover,
  equippedIds,
  isGlobalSearch = false,
  initialSearchTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Reset search term when initialSearchTerm changes (for global search)
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

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

// Mario Kart Style Stat Bars Component (for center column)
const MarioKartStats = ({ vessel, loadout, previewCapability }) => {
  // Calculate current totals from loadout
  const currentStats = useMemo(() => {
    let powerUsed = 0;
    let weightUsed = 0;
    let speedDelta = 0;
    let rangeDelta = 0;

    Object.values(loadout).forEach(categoryItems => {
      categoryItems.forEach(cap => {
        if (cap?.swap) {
          powerUsed += cap.swap.power || 0;
          weightUsed += cap.swap.weight || 0;
        }
        if (cap?.statImpacts) {
          speedDelta += cap.statImpacts.speed || 0;
          rangeDelta += cap.statImpacts.range || 0;
        }
      });
    });

    const baseSpeed = vessel?.specs?.speed || 10;
    const baseRange = vessel?.specs?.range || 100;
    const powerCapacity = vessel?.capacity?.totalPower || 10;
    const weightCapacity = vessel?.capacity?.totalWeight || 500;
    const baseSignature = vessel?.specs?.rcs || 5;

    return {
      speed: Math.max(0, baseSpeed + speedDelta),
      baseSpeed,
      range: Math.max(0, baseRange + rangeDelta),
      baseRange,
      powerUsed,
      powerCapacity,
      powerRemaining: powerCapacity - powerUsed,
      weightUsed,
      weightCapacity,
      weightRemaining: weightCapacity - weightUsed,
      signature: baseSignature
    };
  }, [vessel, loadout]);

  // Calculate preview deltas if hovering a capability
  const previewDeltas = useMemo(() => {
    if (!previewCapability) return null;

    const swap = previewCapability.swap || {};
    const impacts = previewCapability.statImpacts || {};

    return {
      speed: impacts.speed || 0,
      range: impacts.range || 0,
      power: swap.power || 0,
      weight: swap.weight || 0
    };
  }, [previewCapability]);

  // Stat bar with Mario Kart style segments
  const StatBar = ({ label, icon: Icon, value, maxValue, unit, color, previewDelta, isCapacity }) => {
    const basePercent = Math.min(100, (value / maxValue) * 100);
    const deltaPercent = previewDelta ? Math.min(100 - basePercent, Math.max(-basePercent, (Math.abs(previewDelta) / maxValue) * 100)) : 0;
    const isPositive = previewDelta > 0;
    const isNegative = previewDelta < 0;

    // For capacity stats (power/payload), negative delta means using more = bad
    const showWarning = isCapacity ? (value - (previewDelta || 0)) < 0 : false;

    return (
      <div className="flex items-center gap-3">
        <div className="w-6 flex justify-center">
          <Icon size={14} style={{ color }} />
        </div>
        <div className="w-16 text-gray-400 text-xs font-medium">{label}</div>
        <div className="flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden flex relative">
          {/* Base bar */}
          <div
            className="h-full rounded-full transition-all duration-300 relative z-10"
            style={{
              width: `${basePercent}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}40`
            }}
          />
          {/* Preview delta overlay */}
          {previewDelta !== 0 && previewDelta && (
            <div
              className={`h-full absolute transition-all duration-300 ${isPositive ? 'rounded-r-full' : 'rounded-l-full'}`}
              style={{
                width: `${deltaPercent}%`,
                left: isNegative ? `${basePercent - deltaPercent}%` : `${basePercent}%`,
                backgroundColor: isCapacity
                  ? (isNegative ? '#ef4444' : '#22c55e')
                  : (isPositive ? '#22c55e' : '#ef4444'),
                opacity: 0.8,
                animation: 'pulse 1s ease-in-out infinite'
              }}
            />
          )}
          {/* Segment lines for Mario Kart feel */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-gray-700/30 last:border-0" />
            ))}
          </div>
        </div>
        <div className="w-20 text-right">
          <span className={`text-sm font-bold ${showWarning ? 'text-red-400' : 'text-gray-200'}`}>
            {isCapacity ? `${value}` : value}
          </span>
          {previewDelta !== 0 && previewDelta && (
            <span className={`text-xs ml-1 font-semibold ${
              isCapacity
                ? (previewDelta < 0 ? 'text-red-400' : 'text-green-400')
                : (previewDelta > 0 ? 'text-green-400' : 'text-red-400')
            }`}>
              {previewDelta > 0 ? '+' : ''}{isCapacity ? -previewDelta : previewDelta}
            </span>
          )}
          <span className="text-gray-500 text-xs ml-1">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-darker/50 rounded-xl p-4 space-y-2.5">
      <StatBar
        label="SPEED"
        icon={Zap}
        value={currentStats.speed}
        maxValue={50}
        unit="kts"
        color="#06b6d4"
        previewDelta={previewDeltas?.speed}
      />
      <StatBar
        label="RANGE"
        icon={Navigation}
        value={currentStats.range}
        maxValue={Math.max(1000, currentStats.baseRange * 1.5)}
        unit="nm"
        color="#22c55e"
        previewDelta={previewDeltas?.range}
      />
      <StatBar
        label="POWER"
        icon={Zap}
        value={currentStats.powerRemaining}
        maxValue={currentStats.powerCapacity}
        unit="kW"
        color="#f97316"
        previewDelta={previewDeltas?.power}
        isCapacity
      />
      <StatBar
        label="PAYLOAD"
        icon={Ship}
        value={currentStats.weightRemaining}
        maxValue={currentStats.weightCapacity}
        unit="kg"
        color="#8b5cf6"
        previewDelta={previewDeltas?.weight}
        isCapacity
      />
    </div>
  );
};

// Deployment Status Component
const DeploymentStatus = ({ isReady, issues, equippedCount, onDeploy }) => {
  return (
    <div className={`mt-4 rounded-xl border-2 p-4 transition-all ${
      isReady
        ? 'bg-lime-brand/10 border-lime-brand/50'
        : 'bg-gray-800/50 border-gray-600/50'
    }`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isReady ? (
            <CheckCircle2 size={20} className="text-lime-brand" />
          ) : (
            <AlertCircle size={20} className="text-yellow-400" />
          )}
          <span className={`font-bold text-sm ${isReady ? 'text-lime-brand' : 'text-yellow-400'}`}>
            {isReady ? 'READY TO DEPLOY' : 'CONFIGURATION INCOMPLETE'}
          </span>
        </div>
        <span className="text-gray-400 text-xs">
          {equippedCount} capabilities equipped
        </span>
      </div>

      {/* Issues List (when not ready) */}
      {!isReady && issues.length > 0 && (
        <div className="space-y-1 mb-3">
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${
                issue.severity === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <span className={issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                {issue.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ready Checklist (when ready) */}
      {isReady && (
        <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Power budget OK
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Payload capacity OK
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Core systems active
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Capabilities loaded
          </div>
        </div>
      )}

      {/* Deploy Button */}
      <button
        onClick={onDeploy}
        disabled={!isReady}
        className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          isReady
            ? 'bg-lime-brand text-black hover:bg-lime-brand/90 cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Rocket size={16} />
        {isReady ? 'Deploy to Mission' : 'Complete Configuration to Deploy'}
      </button>
    </div>
  );
};

// Main Loadout Builder Component
const LoadoutBuilder = ({ onBackToShipyard }) => {
  const { selectedHull, setSelectedHull } = useOutfitterStore();

  // Local loadout state (category -> array of equipped capabilities)
  const [loadout, setLoadout] = useState({
    SENSORS: [],
    COMMS: [],
    WEAPONS: [],
    EW: [],
    NAV: [],
    AI: [],
    UTILITY: [],
    OTHER: []
  });

  // Extra slots state (beyond base capacity)
  const [extraSlots, setExtraSlots] = useState({
    SENSORS: 0,
    COMMS: 0,
    WEAPONS: 0,
    EW: 0,
    NAV: 0,
    AI: 0,
    UTILITY: 0,
    OTHER: 0
  });

  // Visible categories state (which categories are shown)
  const [visibleCategories, setVisibleCategories] = useState({
    SENSORS: true,
    COMMS: true,
    WEAPONS: true,
    EW: true,
    NAV: true,
    AI: true,
    UTILITY: true,
    OTHER: false // Hidden by default, user can add it
  });

  // Browser state
  const [browserOpen, setBrowserOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [previewCapability, setPreviewCapability] = useState(null);

  // Global search state
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isGlobalSearchMode, setIsGlobalSearchMode] = useState(false);

  // Deployment modal state
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

  // Navigation store for mission planner navigation
  const { setSelectedView } = useNavigationStore();

  // Get base slot capacity for current vessel
  const baseSlotCapacity = VESSEL_SLOT_CAPACITY[selectedHull?.name] || DEFAULT_SLOTS;

  // Get total capacity (base + extra)
  const getTotalCapacity = (categoryKey) => {
    return (baseSlotCapacity[categoryKey] || 0) + (extraSlots[categoryKey] || 0);
  };

  // Initialize empty slots based on capacity
  const getEquippedWithEmptySlots = (categoryKey) => {
    const capacity = getTotalCapacity(categoryKey);
    const equipped = loadout[categoryKey] || [];
    const result = [...equipped];
    while (result.length < capacity) {
      result.push(null);
    }
    return result.slice(0, capacity);
  };

  // Add extra slot to a category
  const handleAddSlot = (categoryKey) => {
    setExtraSlots(prev => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || 0) + 1
    }));
  };

  // Remove extra slot from a category (only if empty)
  const handleRemoveSlot = (categoryKey) => {
    const currentExtra = extraSlots[categoryKey] || 0;
    if (currentExtra <= 0) return;

    // Check if the last slot is empty before removing
    const equipped = loadout[categoryKey] || [];
    const totalCapacity = getTotalCapacity(categoryKey);
    const lastSlotIndex = totalCapacity - 1;

    if (equipped[lastSlotIndex]) {
      // Last slot has a capability, can't remove
      return;
    }

    setExtraSlots(prev => ({
      ...prev,
      [categoryKey]: Math.max(0, (prev[categoryKey] || 0) - 1)
    }));

    // Also trim the loadout if needed
    setLoadout(prev => ({
      ...prev,
      [categoryKey]: (prev[categoryKey] || []).slice(0, totalCapacity - 1)
    }));
  };

  // Hide a category
  const handleHideCategory = (categoryKey) => {
    // Don't allow hiding if category has equipped capabilities
    const equipped = loadout[categoryKey] || [];
    if (equipped.some(Boolean)) {
      return; // Can't hide category with equipped items
    }
    setVisibleCategories(prev => ({
      ...prev,
      [categoryKey]: false
    }));
  };

  // Show a category
  const handleShowCategory = (categoryKey) => {
    setVisibleCategories(prev => ({
      ...prev,
      [categoryKey]: true
    }));
  };

  // Get hidden categories
  const hiddenCategories = ALL_CATEGORY_KEYS.filter(key => !visibleCategories[key]);

  // Get all equipped capability names (to prevent duplicates)
  const equippedIds = useMemo(() => {
    return Object.values(loadout).flat().filter(Boolean).map(c => c.name);
  }, [loadout]);

  // Calculate deployment readiness
  const deploymentStatus = useMemo(() => {
    const issues = [];
    const equipped = Object.values(loadout).flat().filter(Boolean);
    const equippedCount = equipped.length;

    // Calculate resource usage
    let powerUsed = 0;
    let weightUsed = 0;
    equipped.forEach(cap => {
      if (cap?.swap) {
        powerUsed += cap.swap.power || 0;
        weightUsed += cap.swap.weight || 0;
      }
    });

    const powerCapacity = selectedHull?.capacity?.totalPower || 10;
    const weightCapacity = selectedHull?.capacity?.totalWeight || 500;

    // Check: At least one capability equipped
    if (equippedCount === 0) {
      issues.push({ severity: 'warning', message: 'No capabilities equipped' });
    }

    // Check: Power budget
    if (powerUsed > powerCapacity) {
      issues.push({ severity: 'error', message: `Power exceeded by ${(powerUsed - powerCapacity).toFixed(1)}kW` });
    }

    // Check: Weight budget
    if (weightUsed > weightCapacity) {
      issues.push({ severity: 'error', message: `Payload exceeded by ${(weightUsed - weightCapacity).toFixed(0)}kg` });
    }

    // Check: Recommend at least sensors or comms for most deployments
    const hasSensors = loadout.SENSORS?.some(Boolean);
    const hasComms = loadout.COMMS?.some(Boolean);
    if (!hasSensors && !hasComms && equippedCount > 0) {
      issues.push({ severity: 'warning', message: 'Consider adding sensors or comms' });
    }

    // Ready if no errors and at least one capability
    const hasErrors = issues.some(i => i.severity === 'error');
    const isReady = equippedCount > 0 && !hasErrors;

    return {
      isReady,
      issues,
      equippedCount,
      powerUsed,
      weightUsed,
      powerCapacity,
      weightCapacity
    };
  }, [loadout, selectedHull]);

  // Handle deploy action - opens deployment modal
  const handleDeploy = () => {
    if (deploymentStatus.isReady) {
      setDeploymentModalOpen(true);
    }
  };

  // Navigate to mission planner
  const handleNavigateToMissionPlanner = () => {
    setSelectedView('squadron');
  };

  // Handle slot click
  const handleSlotClick = (categoryKey, slotIndex) => {
    setSelectedCategory(LOADOUT_CATEGORIES[categoryKey]);
    setSelectedSlotIndex({ category: categoryKey, index: slotIndex });
    setIsGlobalSearchMode(false);
    setBrowserOpen(true);
  };

  // Handle global search
  const handleGlobalSearch = () => {
    setSelectedCategory(ALL_CATEGORY);
    setSelectedSlotIndex(null);
    setIsGlobalSearchMode(true);
    setBrowserOpen(true);
  };

  // Find appropriate slot category for a capability
  const findSlotForCapability = (capability) => {
    for (const [key, cat] of Object.entries(LOADOUT_CATEGORIES)) {
      if (cat.types && cat.types.includes(capability.category)) {
        // Check if there's an empty slot
        const capacity = getTotalCapacity(key);
        const equipped = loadout[key] || [];
        const emptyIndex = equipped.findIndex(item => !item);
        if (emptyIndex !== -1) return { category: key, index: emptyIndex };
        if (equipped.length < capacity) return { category: key, index: equipped.length };
      }
    }
    return null;
  };

  // Handle capability selection
  const handleSelectCapability = (capability) => {
    // If in global search mode, find appropriate slot
    if (isGlobalSearchMode) {
      const slot = findSlotForCapability(capability);
      if (slot) {
        setLoadout(prev => {
          const newCategoryItems = [...(prev[slot.category] || [])];
          newCategoryItems[slot.index] = capability;
          return { ...prev, [slot.category]: newCategoryItems };
        });
      }
    } else if (selectedSlotIndex) {
      const { category, index } = selectedSlotIndex;
      setLoadout(prev => {
        const newCategoryItems = [...(prev[category] || [])];
        newCategoryItems[index] = capability;
        return { ...prev, [category]: newCategoryItems };
      });
    }
    setBrowserOpen(false);
    setSelectedSlotIndex(null);
    setPreviewCapability(null);
  };

  // Handle remove capability
  const handleRemove = (categoryKey, index) => {
    setLoadout(prev => {
      const newCategoryItems = [...(prev[categoryKey] || [])];
      newCategoryItems[index] = null;
      return { ...prev, [categoryKey]: newCategoryItems };
    });
  };

  // Close browser
  const handleCloseBrowser = () => {
    setBrowserOpen(false);
    setSelectedSlotIndex(null);
    setPreviewCapability(null);
    setIsGlobalSearchMode(false);
    setGlobalSearchTerm('');
  };

  // Get vessel hull component
  const VesselHull = selectedHull ? vesselHullComponents[selectedHull.icon] || vesselHullComponents[selectedHull.name] : null;

  // Auto-redirect to shipyard if no hull selected
  useEffect(() => {
    if (!selectedHull) {
      onBackToShipyard();
    }
  }, [selectedHull, onBackToShipyard]);

  // Don't render anything while redirecting
  if (!selectedHull) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToShipyard}
            className="px-3 py-2 bg-transparent border border-lime-brand/50 text-lime-brand rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-lime-brand/10 transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Platforms
          </button>
          <div>
            <h1 className="text-gray-100 text-2xl font-bold">{selectedHull.name.toUpperCase()}</h1>
            <p className="text-gray-500">{selectedHull.type} • {selectedHull.displacement}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            deploymentStatus.isReady
              ? 'bg-lime-brand/20 text-lime-brand border border-lime-brand/30'
              : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
          }`}>
            {deploymentStatus.isReady ? (
              <><CheckCircle2 size={14} /> Ready</>
            ) : (
              <><AlertCircle size={14} /> {deploymentStatus.equippedCount === 0 ? 'Empty' : 'Incomplete'}</>
            )}
          </div>
          <button
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Check size={18} />
            Save Draft
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              onFocus={handleGlobalSearch}
              placeholder="Search all capabilities..."
              className="w-full pl-10 pr-4 py-2.5 bg-darker border border-gray-700/50 rounded-lg text-gray-100 placeholder:text-gray-500 focus:border-lime-brand/50 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleGlobalSearch}
            className="px-4 py-2.5 bg-lime-brand/10 border border-lime-brand/30 text-lime-brand rounded-lg text-sm font-semibold hover:bg-lime-brand/20 transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            Browse All
          </button>
        </div>
      </div>

      {/* Hidden Categories Bar */}
      {hiddenCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs">Add category:</span>
          {hiddenCategories.map(key => {
            const cat = LOADOUT_CATEGORIES[key];
            const Icon = cat.icon;
            return (
              <button
                key={key}
                onClick={() => handleShowCategory(key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-darker border border-gray-700/50 rounded-lg text-xs hover:border-lime-brand/50 transition-colors group"
              >
                <Icon size={12} style={{ color: cat.color }} />
                <span className="text-gray-400 group-hover:text-gray-200">{cat.name}</span>
                <Plus size={10} className="text-gray-500 group-hover:text-lime-brand" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-[1fr_300px_1fr] gap-6">
        {/* Left Column - Sensors, Comms, Weapons, Other */}
        <div className="space-y-4">
          {['SENSORS', 'COMMS', 'WEAPONS', 'OTHER'].filter(key => visibleCategories[key]).map(key => (
            <CategorySlotCard
              key={key}
              categoryKey={key}
              category={LOADOUT_CATEGORIES[key]}
              equipped={getEquippedWithEmptySlots(key)}
              baseCapacity={baseSlotCapacity[key] || 0}
              extraSlots={extraSlots[key] || 0}
              onSlotClick={handleSlotClick}
              onRemove={handleRemove}
              onAddSlot={handleAddSlot}
              onRemoveSlot={handleRemoveSlot}
              onHide={handleHideCategory}
              isSelected={selectedSlotIndex?.category === key}
            />
          ))}
        </div>

        {/* Center - Vessel Preview + Mario Kart Stats */}
        <div className="flex flex-col items-center">
          <div className="bg-darker rounded-2xl border border-gray-700/50 p-6 w-full">
            <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-b from-gray-800/30 to-transparent rounded-xl">
              {VesselHull ? (
                <VesselHull size={180} />
              ) : (
                <Ship size={100} className="text-gray-600" />
              )}
            </div>
            <div className="text-center mt-3">
              <div className="text-lime-brand font-bold text-lg">{selectedHull.name}</div>
              <div className="text-gray-500 text-sm">{selectedHull.type}</div>
            </div>
          </div>

          {/* Mario Kart Style Stats */}
          <div className="mt-4 w-full">
            <MarioKartStats
              vessel={selectedHull}
              loadout={loadout}
              previewCapability={previewCapability}
            />
          </div>

          {/* Deployment Status */}
          <div className="w-full">
            <DeploymentStatus
              isReady={deploymentStatus.isReady}
              issues={deploymentStatus.issues}
              equippedCount={deploymentStatus.equippedCount}
              onDeploy={handleDeploy}
            />
          </div>
        </div>

        {/* Right Column - EW, Nav, AI, Utility */}
        <div className="space-y-4">
          {['EW', 'NAV', 'AI', 'UTILITY'].filter(key => visibleCategories[key]).map(key => (
            <CategorySlotCard
              key={key}
              categoryKey={key}
              category={LOADOUT_CATEGORIES[key]}
              equipped={getEquippedWithEmptySlots(key)}
              baseCapacity={baseSlotCapacity[key] || 0}
              extraSlots={extraSlots[key] || 0}
              onSlotClick={handleSlotClick}
              onRemove={handleRemove}
              onAddSlot={handleAddSlot}
              onRemoveSlot={handleRemoveSlot}
              onHide={handleHideCategory}
              isSelected={selectedSlotIndex?.category === key}
            />
          ))}
        </div>
      </div>

      {/* Capability Browser */}
      <CapabilityBrowser
        isOpen={browserOpen}
        onClose={handleCloseBrowser}
        category={selectedCategory}
        onSelect={handleSelectCapability}
        onHover={setPreviewCapability}
        equippedIds={equippedIds}
        isGlobalSearch={isGlobalSearchMode}
        initialSearchTerm={isGlobalSearchMode ? globalSearchTerm : ''}
      />

      {/* Deployment Flow Modal */}
      <DeploymentFlowModal
        isOpen={deploymentModalOpen}
        onClose={() => setDeploymentModalOpen(false)}
        hull={selectedHull}
        loadout={loadout}
        onNavigateToMissionPlanner={handleNavigateToMissionPlanner}
      />
    </div>
  );
};

export default LoadoutBuilder;
