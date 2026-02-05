import React from 'react';
import { Ship, Search, ShoppingCart, X, Target, Radio, Shield, Waves, Zap, Crosshair, Eye, Radar, Brain, MessageCircle, ShieldCheck, Settings, ChevronDown, ChevronUp, ChevronLeft, Plus, Minus, Maximize2, Grid3X3, Move, Network, Lock, Unlink, Key, Download, FileText, File, Compass } from 'lucide-react';
import { vesselHullComponents, vesselHullData } from '../data/vesselHullMappings';
import { individualCapabilities, capabilityCategories } from '../data/marketplaceData';

const OutfitterView = ({ 
  selectedHull, 
  setSelectedHull, 
  selectedMountPoint, 
  setSelectedMountPoint, 
  vesselConfiguration, 
  availableSlots, 
  setAvailableSlots,
  selectedCategory, 
  setSelectedCategory, 
  vesselMountPoints, 
  equipCapability, 
  unequipMountPoint, 
  removeSlot, 
  getCompatibleCapabilities, 
  slotPositions,
  setSlotPositions
}) => {
  return (
    <div>
      {/* Platform Selection - Show when no hull selected */}
      {!selectedHull && (
        <div style={{ 
          backgroundColor: '#1a2530', 
          backgroundImage: 'url("/src/assets/images/Caliburn - BG - Dark Mode - Bathymetric Map.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '0.75rem', 
          padding: '2rem', 
          border: '2px solid rgba(203, 253, 0, 0.3)',
          marginBottom: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(26, 37, 48, 0.8)',
            borderRadius: '0.75rem'
          }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '2rem' }}>
            <Ship style={{ color: '#cbfd00', margin: '0 auto 1rem' }} size={48} />
            <h2 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '2rem', marginBottom: '0.5rem' }}>
              SELECT YOUR PLATFORM
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Choose a vessel base to begin outfitting</p>
            </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {vesselHullData.map((vessel, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setSelectedHull(vessel);
                  setSelectedMountPoint(null);
                }}
                style={{ 
                  backgroundColor: '#0f1419',
                  border: '1px solid rgba(203, 253, 0, 0.2)',
                  borderRadius: '0.75rem', 
                  padding: '2rem', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#cbfd00';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(203, 253, 0, 0.2)';
                }}
              >
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  {vesselHullComponents[vessel.icon] && 
                    React.createElement(vesselHullComponents[vessel.icon], { size: 120 })
                  }
                </div>
                <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {vessel.name.toUpperCase()}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {vessel.type}
                </p>
                <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  {vessel.displacement}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', lineHeight: '1.4' }}>
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
              style={{ 
                backgroundColor: '#0f1419',
                border: '2px dashed rgba(203, 253, 0, 0.4)',
                borderRadius: '0.75rem', 
                padding: '2rem', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#cbfd00';
                e.target.style.backgroundColor = '#1a2530';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(203, 253, 0, 0.4)';
                e.target.style.backgroundColor = '#0f1419';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.8' }}>⚙️</div>
              <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                DESIGN FROM SCRATCH
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Custom Platform
              </p>
              <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginBottom: '1rem' }}>
                Variable Specifications
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', lineHeight: '1.4' }}>
                Create a custom platform with configurable mount points and specifications
              </p>
              <div style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                backgroundColor: 'rgba(203, 253, 0, 0.2)', 
                color: '#cbfd00', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem', 
                fontSize: '0.625rem', 
                fontWeight: 'bold' 
              }}
              >
                BETA
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Main Outfitter Interface - Show when hull selected */}
      {selectedHull && (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          
          {/* Enhanced Left Panel - Capability Selection */}
          {selectedMountPoint && (
            <div style={{ width: '400px', flexShrink: 0, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ 
                backgroundColor: '#1a2530', 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                border: '1px solid rgba(203, 253, 0, 0.2)',
                position: 'sticky',
                top: 0
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1rem' }}>{selectedMountPoint}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      {vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.category || availableSlots.find(s => s.id === selectedMountPoint)?.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMountPoint(null)}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#9ca3af', 
                      border: 'none', 
                      cursor: 'pointer' 
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#0f1419', borderRadius: '0.5rem' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Compatible Type:
                  </p>
                  <p style={{ color: '#cbfd00', fontSize: '0.75rem', fontWeight: '600' }}>
                    {vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.type || 'MODULAR'}
                  </p>
                </div>

                {/* Category Selector */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Browse by Category:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {Object.entries(capabilityCategories).map(([categoryName, category]) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategory === categoryName;
                      return (
                        <button
                          key={categoryName}
                          onClick={() => setSelectedCategory(isSelected ? null : categoryName)}
                          style={{
                            backgroundColor: isSelected ? 'rgba(203, 253, 0, 0.2)' : 'transparent',
                            color: isSelected ? '#cbfd00' : '#9ca3af',
                            border: `1px solid ${isSelected ? '#cbfd00' : 'rgba(156, 163, 175, 0.3)'}`,
                            borderRadius: '0.375rem',
                            padding: '0.5rem',
                            fontSize: '0.625rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Icon size={12} />
                          <span style={{ fontSize: '0.625rem', fontWeight: '500' }}>
                            {categoryName.replace(' & ', ' &\n')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Capabilities List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                  {(() => {
                    const mountPointType = vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.type;
                    let capabilities = mountPointType ? getCompatibleCapabilities(mountPointType) : individualCapabilities;
                    
                    // Filter by selected category if one is chosen
                    if (selectedCategory) {
                      const categoryTypes = capabilityCategories[selectedCategory]?.subcategories || [];
                      capabilities = capabilities.filter(cap => categoryTypes.includes(cap.category));
                    }
                    
                    return capabilities.map((cap, idx) => {
                      const IconComponent = cap.icon;
                      const currentConfig = vesselConfiguration[selectedHull?.name]?.[selectedMountPoint];
                      const isEquipped = currentConfig?.name === cap.name;
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => equipCapability(selectedMountPoint, cap)}
                          style={{ 
                            backgroundColor: isEquipped ? '#2a3844' : '#0f1419', 
                            border: isEquipped ? '2px solid #cbfd00' : '1px solid rgba(203, 253, 0, 0.1)', 
                            borderRadius: '0.375rem', 
                            padding: '0.75rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isEquipped) {
                              e.target.style.backgroundColor = '#1a2530';
                              e.target.style.borderColor = 'rgba(203, 253, 0, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isEquipped) {
                              e.target.style.backgroundColor = '#0f1419';
                              e.target.style.borderColor = 'rgba(203, 253, 0, 0.1)';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ backgroundColor: 'rgba(203, 253, 0, 0.2)', padding: '0.375rem', borderRadius: '0.375rem' }}>
                              <IconComponent size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontWeight: 'bold', color: isEquipped ? '#cbfd00' : '#d1d5db', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{cap.name}</h4>
                              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{cap.provider}</p>
                              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                {cap.capabilities.slice(0, 2).map((ability, abilityIdx) => (
                                  <span key={abilityIdx} style={{ 
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                                    color: '#60a5fa', 
                                    padding: '0.125rem 0.375rem', 
                                    borderRadius: '0.25rem', 
                                    fontSize: '0.625rem' 
                                  }}
                                  >
                                    {ability}
                                  </span>
                                ))}
                                {cap.capabilities.length > 2 && (
                                  <span style={{ 
                                    color: '#9ca3af', 
                                    fontSize: '0.625rem' 
                                  }}
                                  >
                                    +{cap.capabilities.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                            {isEquipped && (
                              <div style={{ 
                                backgroundColor: '#cbfd00', 
                                color: '#000', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '0.25rem', 
                                fontSize: '0.625rem', 
                                fontWeight: 'bold' 
                              }}
                              >
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
          <div style={{ flex: 1 }}>
            <div style={{ 
              backgroundColor: '#1a2530', 
              borderRadius: '0.75rem', 
              padding: '2rem', 
              border: '1px solid rgba(203, 253, 0, 0.2)',
              position: 'relative'
            }}
            >
              {/* Header with platform selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setSelectedHull(null);
                      setSelectedMountPoint(null);
                    }}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#cbfd00', 
                      border: '1px solid rgba(203, 253, 0, 0.3)', 
                      borderRadius: '0.375rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(203, 253, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back to Platforms
                  </button>
                  <div>
                    <h2 style={{ color: '#cbfd00', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {selectedHull.name.toUpperCase()}
                    </h2>
                    <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                      {selectedHull.type} • {selectedHull.displacement}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedHull(null);
                    setSelectedMountPoint(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Ship size={16} />
                  Change Platform
                </button>
              </div>

              {/* Enhanced Vessel Diagram */}
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '800px', 
                backgroundColor: '#0f1419', 
                borderRadius: '1rem',
                border: '1px solid rgba(203, 253, 0, 0.1)',
                overflow: 'hidden',
                marginBottom: '2rem'
              }}
              >
                {/* Technical drawing background grid */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `
                    linear-gradient(rgba(203, 253, 0, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(203, 253, 0, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                  opacity: 0.5
                }}
                />

                {/* Professional vessel hull outline */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {vesselHullComponents[selectedHull.icon] && 
                    React.createElement(vesselHullComponents[selectedHull.icon], { size: 650 })
                  }
                </div>

                {/* TempestOS Core Platform - Central Hub */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(203, 253, 0, 0.9)',
                    border: '3px solid #cbfd00',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#000',
                    transition: 'all 0.2s',
                    zIndex: 15,
                    boxShadow: '0 0 20px rgba(203, 253, 0, 0.6), inset 0 0 20px rgba(203, 253, 0, 0.3)'
                  }}
                  title="TempestOS Core Platform - Central Processing Hub"
                >
                  <Settings size={40} />
                </div>

                {/* TempestOS Label */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 'calc(50% + 60px)',
                    transform: 'translateX(-50%)',
                    fontSize: '1rem',
                    color: '#cbfd00',
                    fontWeight: '700',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    textShadow: '0 0 8px rgba(0,0,0,0.8)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                    border: '2px solid rgba(203, 253, 0, 0.6)',
                    boxShadow: '0 0 10px rgba(203, 253, 0, 0.3)'
                  }}
                >
                  TempestOS CORE
                </div>

                {/* Connection Lines from Mount Points to TempestOS */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                  {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                    const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                    return (
                      <line
                        key={`line-${mountName}`}
                        x1={`${mount.x}%`}
                        y1={`${mount.y}%`}
                        x2="50%"
                        y2="50%"
                        stroke={isEquipped ? '#4ade80' : 'rgba(203, 253, 0, 0.3)'}
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
                        stroke={isEquipped ? '#4ade80' : 'rgba(203, 253, 0, 0.3)'}
                        strokeWidth={isEquipped ? "3" : "1"}
                        strokeDasharray={slot.isCustom ? "3,3" : (isEquipped ? "none" : "5,5")}
                        opacity={isEquipped ? "0.8" : "0.4"}
                      />
                    );
                  })}
                </svg>

                {/* Instructions overlay when no mount point selected */}
                {!selectedMountPoint && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    textAlign: 'left',
                    color: '#9ca3af',
                    fontSize: '1rem',
                    pointerEvents: 'none',
                    backgroundColor: 'rgba(15, 20, 25, 0.95)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(203, 253, 0, 0.3)',
                    maxWidth: '300px',
                    zIndex: 20
                  }}
                  >
                    <Target style={{ marginRight: '0.5rem', color: '#cbfd00', display: 'inline' }} size={20} />
                    <span style={{ color: '#cbfd00', fontWeight: '600' }}>LOADOUT INTERFACE</span>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: '1.4' }}>
                      • Click mount points to add capabilities<br />
                      • TempestOS connects to all systems<br />
                      • Drag custom slots to reposition
                    </div>
                  </div>
                )}

                {/* Fixed Mount Points */}
                {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                  const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                  const isSelected = selectedMountPoint === mountName;
                  const EquippedIcon = isEquipped?.icon;
                  
                  return (
                    <React.Fragment key={mountName}>
                      <div
                        onClick={() => setSelectedMountPoint(mountName)}
                        style={{
                          position: 'absolute',
                          left: `${mount.x}%`,
                          top: `${mount.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: isEquipped ? '#4ade80' : isSelected ? '#cbfd00' : 'rgba(203, 253, 0, 0.3)',
                          border: isSelected ? '3px solid #cbfd00' : '2px solid rgba(203, 253, 0, 0.5)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          fontWeight: 'bold',
                          color: isEquipped || isSelected ? '#000' : '#cbfd00',
                          transition: 'all 0.2s',
                          zIndex: 10,
                          boxShadow: isSelected ? '0 0 0 4px rgba(203, 253, 0, 0.3)' : isEquipped ? '0 0 0 2px rgba(74, 222, 128, 0.5)' : 'none'
                        }}
                        title={mountName}
                      >
                        {isEquipped && EquippedIcon ? (
                          <EquippedIcon size={24} />
                        ) : (
                          '+'
                        )}
                      </div>
                      
                      {/* Mount Point Label */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${mount.x}%`,
                          top: `calc(${mount.y}% + 40px)`,
                          transform: 'translateX(-50%)',
                          fontSize: '0.75rem',
                          color: isEquipped ? '#4ade80' : '#cbfd00',
                          fontWeight: '600',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          whiteSpace: 'nowrap',
                          zIndex: 5,
                          border: isSelected ? '1px solid #cbfd00' : '1px solid rgba(203, 253, 0, 0.3)'
                        }}
                      >
                        {mountName}
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Custom Slots */}
                {availableSlots.map((slot) => {
                  const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                  const isEquipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                  const isSelected = selectedMountPoint === slot.id;
                  const EquippedIcon = isEquipped?.icon;
                  
                  return (
                    <React.Fragment key={slot.id}>
                      <div
                        onClick={() => setSelectedMountPoint(slot.id)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', slot.id);
                        }}
                        onDragEnd={(e) => {
                          const rect = e.target.closest('[data-vessel-diagram]').getBoundingClientRect();
                          const newX = ((e.clientX - rect.left) / rect.width) * 100;
                          const newY = ((e.clientY - rect.top) / rect.height) * 100;
                          
                          if (newX >= 5 && newX <= 95 && newY >= 5 && newY <= 95) {
                            setSlotPositions(prev => ({
                              ...prev,
                              [slot.id]: { x: newX, y: newY }
                            }));
                          }
                        }}
                        style={{
                          position: 'absolute',
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '45px',
                          height: '45px',
                          borderRadius: '6px',
                          backgroundColor: isEquipped ? '#4ade80' : isSelected ? '#cbfd00' : 'rgba(203, 253, 0, 0.4)',
                          border: isSelected ? '3px dashed #cbfd00' : '2px dashed rgba(203, 253, 0, 0.6)',
                          cursor: slot.isCustom ? 'move' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: isEquipped || isSelected ? '#000' : '#cbfd00',
                          transition: 'all 0.2s',
                          zIndex: 12,
                          boxShadow: isSelected ? '0 0 0 4px rgba(203, 253, 0, 0.3)' : isEquipped ? '0 0 0 2px rgba(74, 222, 128, 0.5)' : 'none'
                        }}
                        title={`${slot.category} - ${slot.isCustom ? 'Draggable' : 'Fixed'}`}
                      >
                        {isEquipped && EquippedIcon ? (
                          <EquippedIcon size={20} />
                        ) : slot.isCustom ? (
                          <Move size={16} />
                        ) : (
                          '+'
                        )}
                      </div>
                      
                      {/* Custom Slot Label */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${position.x}%`,
                          top: `calc(${position.y}% + 35px)`,
                          transform: 'translateX(-50%)',
                          fontSize: '0.625rem',
                          color: isEquipped ? '#4ade80' : '#cbfd00',
                          fontWeight: '600',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '0.125rem 0.25rem',
                          borderRadius: '0.125rem',
                          whiteSpace: 'nowrap',
                          zIndex: 5,
                          border: isSelected ? '1px dashed #cbfd00' : '1px dashed rgba(203, 253, 0, 0.3)'
                        }}
                      >
                        {slot.category}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Configuration Summary */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#cbfd00', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  CONFIGURATION SUMMARY
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {/* Fixed Mount Points */}
                  {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                    const equipped = vesselConfiguration[selectedHull.name]?.[mountName];
                    const IconComponent = equipped?.icon;
                    return (
                      <div key={mountName} style={{ 
                        backgroundColor: '#0f1419', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        border: equipped ? '1px solid rgba(203, 253, 0, 0.3)' : '1px solid rgba(203, 253, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                      >
                        <div style={{ 
                          backgroundColor: equipped ? 'rgba(203, 253, 0, 0.2)' : 'rgba(156, 163, 175, 0.2)', 
                          padding: '0.5rem', 
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        >
                          {IconComponent ? (
                            <IconComponent size={24} />
                          ) : (
                            <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(156, 163, 175, 0.3)', borderRadius: '2px' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: equipped ? '#cbfd00' : '#9ca3af', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {mountName}
                          </h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            {equipped ? equipped.name : 'No capability equipped'}
                          </p>
                          <p style={{ color: '#6b7280', fontSize: '0.625rem' }}>
                            {mount.category}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {equipped ? (
                            <button
                              onClick={() => unequipMountPoint(mountName)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem'
                              }}
                            >
                              <X size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedMountPoint(mountName)}
                              style={{
                                backgroundColor: '#cbfd00',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Slots */}
                  {availableSlots.map((slot) => {
                    const equipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                    const IconComponent = equipped?.icon;
                    return (
                      <div key={slot.id} style={{ 
                        backgroundColor: '#0f1419', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        border: equipped ? '1px solid rgba(203, 253, 0, 0.3)' : '1px solid rgba(203, 253, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        position: 'relative'
                      }}
                      >
                        <div style={{ 
                          backgroundColor: equipped ? 'rgba(203, 253, 0, 0.2)' : 'rgba(156, 163, 175, 0.2)', 
                          padding: '0.5rem', 
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        >
                          {IconComponent ? (
                            <IconComponent size={24} />
                          ) : (
                            <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(156, 163, 175, 0.3)', borderRadius: '2px' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: equipped ? '#cbfd00' : '#9ca3af', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {slot.category}
                          </h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            {equipped ? equipped.name : 'No capability equipped'}
                          </p>
                          <p style={{ color: '#6b7280', fontSize: '0.625rem' }}>
                            Custom Mount Point
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {equipped ? (
                            <button
                              onClick={() => unequipMountPoint(slot.id)}
                              style={{
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem'
                              }}
                            >
                              <X size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedMountPoint(slot.id)}
                              style={{
                                backgroundColor: '#cbfd00',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ADD
                            </button>
                          )}
                          <button
                            onClick={() => removeSlot(slot.id)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#9ca3af',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem'
                            }}
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                        {slot.isCustom && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '0.5rem', 
                            right: '0.5rem', 
                            backgroundColor: 'rgba(203, 253, 0, 0.2)', 
                            color: '#cbfd00', 
                            padding: '0.125rem 0.25rem', 
                            borderRadius: '0.125rem', 
                            fontSize: '0.5rem', 
                            fontWeight: 'bold' 
                          }}
                          >
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
      )}
    </div>
  );
};

export default OutfitterView;