import React from 'react';
import { Move, ArrowRight } from 'lucide-react';

/**
 * Renders a single mount point node on the vessel diagram.
 * Handles both fixed mount points and custom slots with consistent behavior.
 *
 * @param {Object} props
 * @param {string} props.mountName - Unique identifier for this mount point
 * @param {Object} props.position - {x, y} percentage position on diagram
 * @param {Object|null} props.equippedCapability - The capability equipped at this mount, or null
 * @param {boolean} props.isSelected - Whether this mount is currently selected
 * @param {boolean} props.isCustom - Whether this is a custom (user-added) slot
 * @param {boolean} props.isMovingSource - Whether this mount is the source of a move operation
 * @param {boolean} props.isValidMoveTarget - Whether this mount can receive a moved capability
 * @param {boolean} props.isDragSource - Whether this mount is being dragged
 * @param {boolean} props.isDropTarget - Whether this mount is a valid drop target
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onDragStart - Drag start handler
 * @param {Function} props.onDragEnd - Drag end handler
 * @param {Function} props.onDragOver - Drag over handler
 * @param {Function} props.onDrop - Drop handler
 */
const MountPointNode = ({
  mountName,
  position,
  equippedCapability,
  isSelected,
  isCustom = false,
  isMovingSource,
  isValidMoveTarget,
  isDragSource,
  isDropTarget,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {
  const isEquipped = !!equippedCapability;
  const EquippedIcon = equippedCapability?.icon;

  // Determine node styling based on state
  const getNodeClasses = () => {
    const base = `absolute -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-full flex items-center justify-center text-[1.4rem] font-bold transition-all duration-200 z-10`;
    const cursor = isEquipped ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer';
    const opacity = isDragSource ? 'opacity-50 scale-90' : '';

    let colors;
    if (isDropTarget) {
      colors = 'bg-purple-400/50 text-purple-200';
    } else if (isMovingSource) {
      colors = 'bg-blue-400 text-black animate-pulse';
    } else if (isValidMoveTarget) {
      colors = 'bg-blue-400/40 text-blue-300 hover:bg-blue-400/60';
    } else if (isEquipped) {
      colors = 'bg-green-400 text-black';
    } else if (isSelected) {
      colors = 'bg-lime-brand text-black';
    } else {
      colors = 'bg-lime-brand/30 text-lime-brand';
    }

    let border;
    if (isDropTarget) {
      border = 'border-2 border-dashed border-purple-400';
    } else if (isMovingSource) {
      border = 'border-[3px] border-blue-400';
    } else if (isValidMoveTarget) {
      border = 'border-2 border-dashed border-blue-400';
    } else if (isCustom && !isSelected) {
      border = 'border-2 border-dashed border-lime-brand/80';
    } else if (isSelected) {
      border = 'border-[3px] border-lime-brand';
    } else {
      border = 'border-2 border-lime-brand/50';
    }

    return `${base} ${cursor} ${opacity} ${colors} ${border}`;
  };

  // Determine box shadow based on state
  const getBoxShadow = () => {
    if (isDropTarget) {
      return '0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 20px rgba(168, 85, 247, 0.3)';
    }
    if (isMovingSource) {
      return '0 0 0 4px rgba(96, 165, 250, 0.5), 0 0 20px rgba(96, 165, 250, 0.3)';
    }
    if (isValidMoveTarget) {
      return '0 0 0 4px rgba(96, 165, 250, 0.2)';
    }
    if (isSelected) {
      return '0 0 0 4px rgba(203, 253, 0, 0.3)';
    }
    if (isEquipped) {
      return '0 0 0 2px rgba(74, 222, 128, 0.5)';
    }
    return 'none';
  };

  // Determine icon to display
  const renderIcon = () => {
    if (isDropTarget) return <ArrowRight size={24} />;
    if (isMovingSource) return <Move size={24} />;
    if (isValidMoveTarget) return <ArrowRight size={24} />;
    if (isEquipped && EquippedIcon) return <EquippedIcon size={24} />;
    return isEquipped ? '✓' : '+';
  };

  return (
    <>
      {/* Mount Point Circle */}
      <div
        onClick={onClick}
        draggable={isEquipped}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={getNodeClasses()}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          boxShadow: getBoxShadow()
        }}
        title={isEquipped ? `Drag to move: ${equippedCapability.name}` : mountName}
      >
        {renderIcon()}
        {/* Custom slot move indicator */}
        {isCustom && !isEquipped && !isDragSource && (
          <Move
            size={12}
            className="absolute -bottom-0.5 -right-0.5 text-lime-brand bg-black/80 rounded-full p-px"
          />
        )}
      </div>

      {/* Mount Point Label */}
      <div
        className={`absolute -translate-x-1/2 text-xs text-lime-brand font-semibold text-center pointer-events-none bg-black/70 py-1 px-2 rounded-md whitespace-nowrap z-[5] ${isCustom ? 'border border-dashed border-lime-brand/50' : ''}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y + 8}%`,
          textShadow: '0 0 4px rgba(0,0,0,0.8)'
        }}
      >
        {mountName}
      </div>
    </>
  );
};

export default MountPointNode;
