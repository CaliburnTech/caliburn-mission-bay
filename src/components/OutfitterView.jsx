import React from 'react';
import { Ship, X, Target, Settings, ChevronLeft, Plus, Minus, Grid3X3, Maximize2, Move } from 'lucide-react';
import { vesselHullComponents, vesselHullData, vesselMountPoints, isAerialPlatform } from '../data/vesselData';
import { individualCapabilities, capabilityCategories } from '../data/marketplaceData';
import { getSecurityLevel, STATUS_COLORS, BRAND_COLORS } from '../constants/colors';
import useOutfitterStore from '../store/outfitterStore';
import useMountPointDragDrop from '../hooks/useMountPointDragDrop';
import VesselStatsDisplay from './VesselStatsDisplay';
import AerialStatsDisplay from './AerialStatsDisplay';
import MountPointNode from './MountPointNode';

const OutfitterView = ({ onBackToShipyard }) => {
  // Get state and actions from outfitter store
  const {
    selectedHull, setSelectedHull,
    selectedMountPoint, setSelectedMountPoint,
    vesselConfiguration, setVesselConfiguration,
    availableSlots, addNewSlot, removeSlot,
    selectedCategory, setSelectedCategory,
    slotPositions, updateSlotPosition,
    setIsFullScreenConfig,
    equipCapability, unequipMountPoint, getCompatibleCapabilities,
    movingFromMount, setMovingFromMount, moveCapability
  } = useOutfitterStore();

  // Use custom hook for drag-drop functionality
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    isDragSource,
    isDropTarget
  } = useMountPointDragDrop(moveCapability);

  const handleBackToShipyard = () => {
    if (onBackToShipyard) {
      onBackToShipyard();
    }
    setSelectedHull(null);
  };

  return (
    <div>
      {/* Back to Fleet Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={handleBackToShipyard}
          className="text-gray-400 hover:text-lime-brand transition-colors flex items-center gap-2 text-sm"
        >
          <ChevronLeft size={16} />
          Back to My Squadrons
        </button>
      </div>

      {/* Platform Selection - Show when no hull selected */}
      {!selectedHull && (
        <div className="bg-darker rounded-xl p-8 border-2 border-lime-brand/30 mb-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-8">
              <Ship className="text-lime-brand mx-auto mb-4" size={48} />
              <h2 className="text-lime-brand font-bold text-3xl mb-2">
                DESIGN NEW PLATFORM
              </h2>
              <p className="text-gray-400 text-base">Choose a vessel base to begin your configuration</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 max-w-6xl mx-auto">
              {vesselHullData.map((vessel) => (
                <div
                  key={vessel.name}
                  onClick={() => {
                    setSelectedHull(vessel);
                    setSelectedMountPoint(null);
                  }}
                  className="bg-darkest border border-lime-brand/20 rounded-xl p-8 cursor-pointer transition-all duration-200 text-center hover:border-lime-brand"
                >
                  <div className="mb-4 flex justify-center">
                    {vesselHullComponents[vessel.icon] &&
                      React.createElement(vesselHullComponents[vessel.icon], { size: 120 })
                    }
                  </div>
                  <h3 className="text-lime-brand font-bold text-xl mb-2">
                    {vessel.name.toUpperCase()}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {vessel.type}
                  </p>
                  <p className="text-gray-300 text-xs mb-4">
                    {vessel.displacement}
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {vessel.description}
                  </p>
                </div>
              ))}

              {/* Design from Scratch Option */}
              <div
                onClick={() => {
                  setSelectedHull({
                    name: "Custom Platform",
                    type: "Design from Scratch",
                    displacement: "Variable",
                    icon: "Custom Platform",
                    description: "Custom platform with flexible mount points"
                  });
                  setSelectedMountPoint(null);
                }}
                className="bg-darkest border-2 border-dashed border-lime-brand/40 rounded-xl p-8 cursor-pointer transition-all duration-200 text-center relative hover:border-lime-brand hover:bg-darker"
              >
                <div className="text-5xl mb-4 opacity-80">⚙️</div>
                <h3 className="text-lime-brand font-bold text-xl mb-2">
                  DESIGN FROM SCRATCH
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  Custom Platform
                </p>
                <p className="text-gray-300 text-xs mb-4">
                  Variable Specifications
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Create a custom platform with configurable mount points and specifications
                </p>
                <div className="absolute top-4 right-4 bg-lime-brand/20 text-lime-brand py-1 px-2 rounded text-[0.625rem] font-bold">
                  BETA
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Outfitter Interface - Show when hull selected */}
      {selectedHull && (
        <div className="flex gap-4">

          {/* Enhanced Left Panel - Capability Selection */}
          {selectedMountPoint && (
            <div className="w-[340px] flex-shrink-0 max-h-[80vh] overflow-y-auto">
              <div className="bg-darker rounded-xl p-6 border border-lime-brand/20 sticky top-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lime-brand font-bold text-base">{selectedMountPoint}</h3>
                    <p className="text-gray-400 text-xs">
                      {vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.category || availableSlots.find(s => s.id === selectedMountPoint)?.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMountPoint(null)}
                    className="bg-transparent text-gray-400 border-0 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-darkest rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">
                    Compatible Type:
                  </p>
                  <p className="text-lime-brand text-xs font-semibold">
                    {vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.type || 'MODULAR'}
                  </p>
                </div>

                {/* Category Selector */}
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2">Browse by Category:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(capabilityCategories).map(([categoryName, category]) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategory === categoryName;
                      return (
                        <button
                          key={categoryName}
                          onClick={() => setSelectedCategory(isSelected ? null : categoryName)}
                          className={`${isSelected ? 'bg-lime-brand/20 text-lime-brand border-lime-brand' : 'bg-transparent text-gray-400 border-gray-400/30'} border rounded-md p-2 text-[0.625rem] cursor-pointer flex items-center gap-1 text-left transition-all duration-200`}
                        >
                          <Icon size={12} />
                          <span className="text-[0.625rem] font-medium">
                            {categoryName.replace(' & ', ' &\n')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Capabilities List */}
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
                  {(() => {
                    const mountPointType = vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.type;
                    let capabilities = mountPointType ? getCompatibleCapabilities(mountPointType) : individualCapabilities;

                    // Filter by selected category if one is chosen
                    if (selectedCategory) {
                      const categoryTypes = capabilityCategories[selectedCategory]?.subcategories || [];
                      capabilities = capabilities.filter(cap => categoryTypes.includes(cap.category));
                    }

                    return capabilities.map((cap, idx) => {
                      const IconComponent = cap.icon || Settings;
                      const currentConfig = vesselConfiguration[selectedHull?.name]?.[selectedMountPoint];
                      const isEquipped = currentConfig?.name === cap.name;
                      const capAbilities = cap.capabilities || [];

                      return (
                        <div
                          key={`${cap.name}-${idx}`}
                          onClick={() => equipCapability(selectedMountPoint, cap)}
                          className={`${isEquipped ? 'bg-[#2a3844] border-2 border-lime-brand' : 'bg-darkest border border-lime-brand/10 hover:bg-darker hover:border-lime-brand/30'} rounded-md p-3 cursor-pointer transition-all duration-200`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-lime-brand/20 p-1.5 rounded-md">
                              <IconComponent size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-bold ${isEquipped ? 'text-lime-brand' : 'text-gray-300'} text-sm mb-1`}>{cap.name}</h4>
                              <p className="text-xs text-gray-400 mb-1">{cap.provider}</p>
                              <div className="flex gap-1 flex-wrap">
                                {capAbilities.slice(0, 2).map((ability, abilityIdx) => (
                                  <span key={abilityIdx} className="bg-blue-500/20 text-blue-400 py-0.5 px-1.5 rounded text-[0.625rem]">
                                    {ability}
                                  </span>
                                ))}
                                {capAbilities.length > 2 && (
                                  <span className="text-gray-400 text-[0.625rem]">
                                    +{capAbilities.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                            {isEquipped && (
                              <div className="bg-lime-brand text-black py-1 px-2 rounded text-[0.625rem] font-bold">
                                EQUIPPED
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Vessel Diagram */}
          <div className="flex-1">
            <div className="bg-darker rounded-xl p-8 border border-lime-brand/20 relative">
              {/* Header with platform selector */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedHull(null);
                      setSelectedMountPoint(null);
                    }}
                    className="bg-transparent text-lime-brand border border-lime-brand/30 rounded-md p-2 cursor-pointer flex items-center gap-2 hover:bg-lime-brand/10"
                  >
                    <ChevronLeft size={16} />
                    Back to Platforms
                  </button>
                  <div>
                    <h2 className="text-lime-brand text-3xl font-bold mb-2">
                      {selectedHull.name.toUpperCase()}
                    </h2>
                    <p className="text-gray-400 text-base">
                      {selectedHull.type} • {selectedHull.displacement}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedHull(null);
                    setSelectedMountPoint(null);
                    setVesselConfiguration({});
                  }}
                  className="bg-transparent text-gray-400 border border-gray-400/30 rounded-lg py-2 px-4 text-sm cursor-pointer flex items-center gap-2"
                >
                  <Ship size={16} />
                  Change Platform
                </button>
              </div>

              {/* Enhanced Vessel Diagram */}
              <div className="relative w-full h-[650px] bg-darkest rounded-2xl border border-lime-brand/10 overflow-hidden mb-8">

                {/* Technical drawing background grid */}
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(203, 253, 0, 0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(203, 253, 0, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                  }}
                />

                {/* Professional vessel hull outline */}
                <div className="absolute inset-0 flex justify-center items-center">
                  {vesselHullComponents[selectedHull.icon] &&
                    React.createElement(vesselHullComponents[selectedHull.icon], { size: 520 })
                  }
                </div>

                {/* TempestOS Core Platform - Central Hub */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-xl bg-lime-brand/90 border-[3px] border-lime-brand cursor-pointer flex items-center justify-center text-3xl font-bold text-black transition-all duration-200 z-[15]"
                  style={{
                    boxShadow: '0 0 20px rgba(203, 253, 0, 0.6), inset 0 0 20px rgba(203, 253, 0, 0.3)'
                  }}
                  title="TempestOS Core Platform - Central Processing Hub"
                >
                  <Settings size={40} />
                </div>

                {/* TempestOS Label */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-base text-lime-brand font-bold text-center pointer-events-none bg-black/80 py-2 px-4 rounded-lg whitespace-nowrap z-[5] border-2 border-lime-brand/60"
                  style={{
                    top: 'calc(50% + 60px)',
                    textShadow: '0 0 8px rgba(0,0,0,0.8)',
                    boxShadow: '0 0 10px rgba(203, 253, 0, 0.3)'
                  }}
                >
                  TempestOS CORE
                </div>

                {/* Connection Lines from Mount Points to TempestOS */}
                <svg className="absolute inset-0 w-full h-full z-[1]">
                  {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                    const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                    return (
                      <line
                        key={`line-${mountName}`}
                        x1={`${mount.x}%`}
                        y1={`${mount.y}%`}
                        x2="50%"
                        y2="50%"
                        stroke={isEquipped ? STATUS_COLORS.ready.hex : `${BRAND_COLORS.lime.hex}4D`}
                        strokeWidth={isEquipped ? "3" : "1"}
                        strokeDasharray={isEquipped ? "none" : "5,5"}
                        opacity={isEquipped ? "0.8" : "0.4"}
                      />
                    );
                  })}
                  {availableSlots.map((slot) => {
                    const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                    const isEquipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                    return (
                      <line
                        key={`line-${slot.id}`}
                        x1={`${position.x}%`}
                        y1={`${position.y}%`}
                        x2="50%"
                        y2="50%"
                        stroke={isEquipped ? STATUS_COLORS.ready.hex : `${BRAND_COLORS.lime.hex}4D`}
                        strokeWidth={isEquipped ? "3" : "1"}
                        strokeDasharray={slot.isCustom ? "3,3" : (isEquipped ? "none" : "5,5")}
                        opacity={isEquipped ? "0.8" : "0.4"}
                      />
                    );
                  })}
                </svg>

                {/* Instructions overlay when no mount point selected */}
                {!selectedMountPoint && !movingFromMount && (
                  <div className="absolute top-5 left-5 text-left text-gray-400 text-base pointer-events-none bg-darkest/95 p-4 rounded-lg border border-lime-brand/30 max-w-[300px] z-20">
                    <Target className="inline mr-2 text-lime-brand" size={20} />
                    <span className="text-lime-brand font-semibold">LOADOUT INTERFACE</span>
                    <div className="mt-2 text-sm leading-relaxed">
                      • Click mount points to add capabilities<br />
                      • TempestOS connects to all systems<br />
                      • Drag custom slots to reposition
                    </div>
                  </div>
                )}

                {/* Move mode instruction overlay */}
                {movingFromMount && (
                  <div className="absolute top-5 left-5 text-left bg-blue-500/20 p-4 rounded-lg border-2 border-blue-400 max-w-[320px] z-20">
                    <Move className="inline mr-2 text-blue-400" size={20} />
                    <span className="text-blue-400 font-semibold">MOVE MODE</span>
                    <div className="mt-2 text-sm text-blue-300 leading-relaxed">
                      Moving: <span className="font-bold text-white">{vesselConfiguration[selectedHull?.name]?.[movingFromMount]?.name}</span>
                      <br />
                      Click another mount point to relocate
                    </div>
                    <button
                      onClick={() => setMovingFromMount(null)}
                      className="mt-3 bg-blue-500/30 text-blue-300 border border-blue-400/50 rounded px-3 py-1 text-xs cursor-pointer hover:bg-blue-500/50"
                    >
                      Cancel Move
                    </button>
                  </div>
                )}

                {/* Fixed Mount Points */}
                {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                  const equippedCap = vesselConfiguration[selectedHull.name]?.[mountName];

                  const handleMountClick = () => {
                    if (movingFromMount) {
                      if (movingFromMount === mountName) {
                        setMovingFromMount(null);
                      } else {
                        moveCapability(movingFromMount, mountName);
                      }
                    } else {
                      setSelectedMountPoint(mountName);
                    }
                  };

                  return (
                    <MountPointNode
                      key={mountName}
                      mountName={mountName}
                      position={{ x: mount.x, y: mount.y }}
                      equippedCapability={equippedCap}
                      isSelected={selectedMountPoint === mountName}
                      isCustom={false}
                      isMovingSource={movingFromMount === mountName}
                      isValidMoveTarget={movingFromMount && movingFromMount !== mountName}
                      isDragSource={isDragSource(mountName)}
                      isDropTarget={isDropTarget(mountName)}
                      onClick={handleMountClick}
                      onDragStart={(e) => handleDragStart(e, mountName, !!equippedCap)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, mountName)}
                      onDrop={(e) => handleDrop(e, mountName)}
                    />
                  );
                })}

                {/* Custom Slots - keep separate due to slot repositioning functionality */}
                {availableSlots.map((slot) => {
                  const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                  const equippedCap = vesselConfiguration[selectedHull.name]?.[slot.id];

                  const handleSlotClick = () => {
                    if (movingFromMount) {
                      if (movingFromMount === slot.id) {
                        setMovingFromMount(null);
                      } else {
                        moveCapability(movingFromMount, slot.id);
                      }
                    } else {
                      setSelectedMountPoint(slot.id);
                    }
                  };

                  // Custom slots have additional repositioning logic when empty
                  const handleSlotDragEnd = (e) => {
                    handleDragEnd();
                    // If slot was empty, reposition it
                    if (!equippedCap) {
                      const rect = e.target.parentElement.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      updateSlotPosition(slot.id, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
                    }
                  };

                  return (
                    <MountPointNode
                      key={slot.id}
                      mountName={slot.name}
                      position={position}
                      equippedCapability={equippedCap}
                      isSelected={selectedMountPoint === slot.id}
                      isCustom
                      isMovingSource={movingFromMount === slot.id}
                      isValidMoveTarget={movingFromMount && movingFromMount !== slot.id}
                      isDragSource={isDragSource(slot.id)}
                      isDropTarget={isDropTarget(slot.id)}
                      onClick={handleSlotClick}
                      onDragStart={(e) => handleDragStart(e, slot.id, !!equippedCap)}
                      onDragEnd={handleSlotDragEnd}
                      onDragOver={(e) => handleDragOver(e, slot.id)}
                      onDrop={(e) => handleDrop(e, slot.id)}
                    />
                  );
                })}

                {/* Capability Area Indicators */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                  <div className="bg-black/80 border border-lime-brand/30 rounded-lg p-3 text-xs text-lime-brand">
                    <div className="font-bold mb-2">CAPABILITY AREAS</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span>Equipped</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-lime-brand/30 border-2 border-lime-brand/50" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-lime-brand/30 border-2 border-dashed border-lime-brand/80" />
                        <span>Custom</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Configuration Summary */}
              <div className="card-accent">
                <div className="flex justify-between items-center mb-lg">
                  <h3 className="section-title">
                    Current Configuration
                  </h3>
                  <div className="flex gap-sm">
                    <button
                      onClick={() => setIsFullScreenConfig(true)}
                      className="btn-primary btn-sm"
                    >
                      <Maximize2 size={14} />
                      Full Screen
                    </button>
                    <button
                      onClick={addNewSlot}
                      className="btn-secondary btn-sm"
                    >
                      <Plus size={14} />
                      Add Slot
                    </button>
                  </div>
                </div>

                {/* Core Systems - Always Present */}
                <div className="mb-lg">
                  <h4 className="subsection-label">
                    Core Systems
                  </h4>
                  <div className="card-inner flex items-center gap-md border-lime-brand">
                    <div className="security-badge bg-primary-muted p-sm">
                      <Settings size={20} className="text-primary-brand" />
                    </div>
                    <div className="flex-1">
                      <div className="text-primary-brand text-sm font-semibold mb-xs">
                        TempestOS Core Platform
                      </div>
                      <div className="text-secondary text-xs">
                        Foundational operating system - Always installed
                      </div>
                    </div>
                    <div className="badge-status badge-active">
                      ACTIVE
                    </div>
                  </div>
                </div>

                {/* Security Assessment Panel */}
                <div className="mb-lg">
                  <h4 className="subsection-label">
                    Security Assessment
                  </h4>
                  <div className="card-inner">
                    {(() => {
                      const installedCapabilities = [
                        ...Object.values(vesselConfiguration[selectedHull.name] || {}),
                        ...availableSlots.filter(slot => vesselConfiguration[selectedHull.name]?.[slot.id]).map(slot => vesselConfiguration[selectedHull.name][slot.id])
                      ].filter(Boolean);

                      const securityFeatures = {
                        'NSA-Approved Crypto': installedCapabilities.some(cap => cap.securityLevel?.includes('NSA-Approved Crypto')),
                        'Zero Trust Architecture': installedCapabilities.some(cap => cap.securityLevel?.includes('Zero Trust Architecture')),
                        'DDIL Capable': installedCapabilities.some(cap => cap.securityLevel?.includes('DDIL Capable')),
                        'End-to-End Encrypted': installedCapabilities.some(cap => cap.securityLevel?.includes('End-to-End Encrypted'))
                      };

                      const securityScore = Object.values(securityFeatures).filter(Boolean).length;
                      const maxScore = 4;
                      const securityPercentage = Math.round((securityScore / maxScore) * 100);

                      // Security rating from centralized color constants
                      const securityLevel = getSecurityLevel(securityScore);
                      const rating = { label: securityLevel.label, color: securityLevel.hex };

                      return (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <div className="text-lime-brand text-sm font-semibold mb-1">
                                Security Posture: {rating.label}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {securityScore}/{maxScore} security features active ({securityPercentage}%)
                              </div>
                            </div>
                            <div
                              className="py-1 px-2 rounded text-[0.625rem] font-bold"
                              style={{
                                backgroundColor: `${rating.color}20`,
                                color: rating.color
                              }}
                            >
                              {securityPercentage}%
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(securityFeatures).map(([feature, active]) => (
                              <div
                                key={feature}
                                className={`flex items-center gap-2 p-2 rounded ${active ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-400/10 border border-gray-400/20'
                                  }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                />
                                <span
                                  className={`text-[0.6875rem] font-medium ${active ? 'text-green-500' : 'text-gray-400'
                                    }`}
                                >
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Mount Points Configuration */}
                <div>
                  <div className="flex justify-between items-center mb-md">
                    <h4 className="subsection-label mb-0">
                      Mount Points & Capabilities
                    </h4>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory ? null : 'all')}
                      className="btn-ghost btn-sm"
                    >
                      <Grid3X3 size={12} />
                      Categories
                    </button>
                  </div>

                  <div className="card-grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-md">
                    {/* Fixed Mount Points */}
                    {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                      const equipped = vesselConfiguration[selectedHull.name]?.[mountName];
                      const IconComponent = equipped?.icon;
                      return (
                        <div
                          key={mountName}
                          className={`${equipped ? 'mount-slot mount-slot-filled' : 'mount-slot'} flex-row items-center justify-start min-h-0 p-4`}
                        >
                          <div
                            className={`${equipped ? 'bg-lime-brand/20' : 'bg-gray-400/20'} p-2 rounded flex items-center justify-center`}
                          >
                            {equipped && IconComponent ? (
                              <IconComponent size={20} className="text-lime-brand" />
                            ) : (
                              <Settings size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mount-slot-label mb-1">{mountName}</div>
                            <div className={`text-xs ${equipped ? 'text-lime-brand' : 'text-gray-400'}`}>
                              {equipped ? equipped.name : 'Empty'}
                            </div>
                            <div className="mount-slot-sublabel mt-0.5">
                              {mount.category} • {mount.type}
                            </div>
                          </div>
                          {equipped ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => setMovingFromMount(mountName)}
                                className="bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded cursor-pointer p-1 hover:bg-blue-500/30"
                                title="Move to different mount"
                              >
                                <Move size={14} />
                              </button>
                              <button
                                onClick={() => unequipMountPoint(mountName)}
                                className="bg-transparent text-red-500 border-0 cursor-pointer p-1"
                                title="Remove"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedMountPoint(mountName)}
                              className="btn-primary btn-sm"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Custom Slots */}
                    {availableSlots.map((slot) => {
                      const equipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                      const IconComponent = equipped?.icon;
                      return (
                        <div
                          key={slot.id}
                          className={`mount-slot flex-row items-center justify-start min-h-0 p-4 ${slot.isCustom ? 'border-dashed border-lime-brand' : 'border-solid'
                            }`}
                        >
                          <div
                            className={`${equipped ? 'bg-lime-brand/20' : 'bg-gray-400/20'} p-2 rounded flex items-center justify-center`}
                          >
                            {equipped && IconComponent ? (
                              <IconComponent size={20} className="text-lime-brand" />
                            ) : (
                              <Plus size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mount-slot-label mb-1">{slot.name}</div>
                            <div className={`text-xs ${equipped ? 'text-lime-brand' : 'text-gray-400'}`}>
                              {equipped ? equipped.name : 'Empty'}
                            </div>
                            <div className="mount-slot-sublabel mt-0.5">
                              {slot.category} • Modular
                            </div>
                          </div>
                          <div className="flex gap-xs">
                            {equipped ? (
                              <>
                                <button
                                  onClick={() => setMovingFromMount(slot.id)}
                                  className="bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded cursor-pointer p-1 hover:bg-blue-500/30"
                                  title="Move to different mount"
                                >
                                  <Move size={14} />
                                </button>
                                <button
                                  onClick={() => unequipMountPoint(slot.id)}
                                  className="bg-transparent text-red-500 border-0 cursor-pointer p-1"
                                  title="Remove"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setSelectedMountPoint(slot.id)}
                                className="btn-primary btn-sm"
                              >
                                ADD
                              </button>
                            )}
                            <button
                              onClick={() => removeSlot(slot.id)}
                              className="bg-transparent text-gray-400 border-0 cursor-pointer p-1"
                              title="Remove slot"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                          {slot.isCustom && (
                            <div className="absolute top-2 right-2 bg-lime-brand/20 text-lime-brand py-0.5 px-1 rounded-sm text-[0.5rem] font-bold">
                              CUSTOM
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Platform Performance Stats */}
          <div className="w-[320px] flex-shrink-0">
            <div className="sticky top-6">
              {isAerialPlatform(selectedHull?.platformType) ? (
                <AerialStatsDisplay />
              ) : (
                <VesselStatsDisplay />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitterView;
