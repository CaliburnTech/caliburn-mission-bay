import { Shield, X, Plus, Cpu } from 'lucide-react';
import { BRAND_COLORS } from '../../constants/colors';

/**
 * Small card showing an equipped capability in a slot.
 */
export const CapabilityCard = ({ capability, onRemove, isCore }) => {
  if (!capability) return null;

  return (
    <div className={`relative group bg-darkest border rounded-lg p-2 ${isCore ? 'border-lime-brand/50' : 'border-gray-600/50'}`}>
      <div className="flex items-start gap-2">
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isCore ? `${BRAND_COLORS.lime.hex}20` : '#ffffff10' }}
        >
          {capability.icon ? (
            <capability.icon size={16} color={isCore ? BRAND_COLORS.lime.hex : '#9ca3af'} />
          ) : (
            <Shield size={16} color={isCore ? BRAND_COLORS.lime.hex : '#9ca3af'} />
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

/**
 * Clickable empty slot placeholder.
 */
export const EmptySlot = ({ onClick, categoryColor }) => (
  <button
    onClick={onClick}
    className="w-full border-2 border-dashed rounded-lg p-3 flex items-center justify-center gap-2 transition-all hover:border-solid group"
    style={{ borderColor: `${categoryColor}40`, backgroundColor: `${categoryColor}05` }}
  >
    <Plus size={14} style={{ color: categoryColor }} className="opacity-50 group-hover:opacity-100" />
    <span className="text-gray-500 text-xs group-hover:text-gray-300">Add</span>
  </button>
);

/**
 * Visual dots showing slot capacity and fill status.
 */
export const SlotCapacityDots = ({ filled, total, color }) => (
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

/**
 * Card displaying a loadout category with its slots.
 */
export const CategorySlotCard = ({
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
  isSelected,
  requirementUnmet = false,
}) => {
  const Icon = category.icon;
  const totalCapacity = baseCapacity + extraSlots;
  const filledCount = equipped.filter(Boolean).length;
  const canHide = filledCount === 0; // Can only hide if nothing equipped

  return (
    <div
      className={`bg-darker rounded-xl border-2 p-4 transition-all relative group ${
        isSelected
          ? 'border-lime-brand shadow-lg shadow-lime-brand/10'
          : requirementUnmet
          ? 'border-red-500/70 shadow-lg shadow-red-500/10'
          : 'border-gray-700/50'
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
            isCore
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
