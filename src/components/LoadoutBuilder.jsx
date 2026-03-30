import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, Eye, Crosshair, Shield, Navigation, Cpu,
  Wifi, Zap, Plus, X, Check, Ship,
  AlertCircle, CheckCircle2, Search, Layers, ChevronDown,
  FileText, GitBranch
} from 'lucide-react';
import useOutfitterStore from '../store/outfitterStore';
import useNavigationStore from '../store/navigationStore';
import useConfigurationStore, { getCapabilityByName, CATEGORY_KEYS } from '../store/configurationStore';
import { generateSBOMFromActiveConfig } from '../utils/sbomGenerator';
import useVersionStore from '../store/versionStore';
import useDataStore from '../providers/dataStore';
import SBOMDisplay from './shared/SBOMDisplay';
import SV2Editor from './shared/SV2Editor';
import CreateVersionModal from './shared/CreateVersionModal';
import VersionDetailPanel from './versions/VersionDetailPanel';
import { vesselHullComponents, VESSEL_SLOT_CAPACITY, DEFAULT_SLOT_CAPACITY, LOADOUT_CATEGORY_KEYS } from '../data/vesselData';
import { individualCapabilities, engineeringStacks } from '../data/marketplaceData';
import { CATEGORY_COLORS, BRAND_COLORS } from '../constants/colors';
import {
  CapabilityBrowser,
  DeploymentFlowModal,
  CategorySlotCard,
  LoadoutStatsDisplay,
  DeploymentStatus
} from './loadout';

// Category definitions with icons, colors, and compatible equipment types
// Colors reference centralized constants - see src/constants/colors.js
const LOADOUT_CATEGORIES = {
  SENSORS: {
    name: 'Sensors',
    icon: Eye,
    color: CATEGORY_COLORS.SENSORS.hex,
    types: ['EO/IR SENSORS', 'RADAR/RF', 'ACOUSTIC/SONAR', 'ELECTRONIC SUPPORT', 'ELECTRONIC ATTACK', 'ELECTRONIC PROTECTION'],
    description: 'Detection, surveillance & EW systems'
  },
  COMMS: {
    name: 'Communications',
    icon: Wifi,
    color: CATEGORY_COLORS.COMMS.hex,
    types: ['RF COMMUNICATIONS', 'SATCOM', 'UNDERWATER COMMS'],
    description: 'Data links & networking'
  },
  WEAPONS: {
    name: 'Weapons',
    icon: Crosshair,
    color: CATEGORY_COLORS.WEAPONS.hex,
    types: ['KINETIC WEAPONS', 'DIRECTED ENERGY'],
    description: 'Offensive capabilities'
  },
  C2: {
    name: 'C2 Systems',
    icon: Shield,
    color: CATEGORY_COLORS.C2.hex,
    types: ['C2 SYSTEMS', 'COMMAND & CONTROL'],
    description: 'Command & control systems'
  },
  NAV: {
    name: 'Navigation',
    icon: Navigation,
    color: CATEGORY_COLORS.NAV.hex,
    types: ['NAVIGATION'],
    description: 'Position & guidance'
  },
  AI: {
    name: 'AI & Autonomy',
    icon: Cpu,
    color: CATEGORY_COLORS.AI.hex,
    types: ['UNMANNED SYSTEMS', 'COMMAND & CONTROL'],
    description: 'Autonomous control systems',
    hasCore: true // TempestOS always present
  },
  UTILITY: {
    name: 'Utility',
    icon: Shield,
    color: CATEGORY_COLORS.UTILITY.hex,
    types: ['LOGISTICS', 'LOGISTICS & SUPPORT', 'MAINTENANCE', 'SUPPLY CHAIN', 'DATA PROCESSING', 'CYBER DEFENSE'],
    description: 'Support & utility systems'
  },
  OTHER: {
    name: 'Other',
    icon: Plus,
    color: CATEGORY_COLORS.OTHER.hex,
    types: null, // null means accepts any type
    description: 'Custom & miscellaneous'
  }
};

// Special "ALL" category for global search
const ALL_CATEGORY = {
  name: 'All Capabilities',
  icon: Search,
  color: BRAND_COLORS.lime.hex,
  types: null, // null means show all
  description: 'Search all capabilities'
};

// View name mapping for back button display
const VIEW_NAMES = {
  'matrix': 'Mission Matrix',
  'shipyard': 'Squadrons',
  'capabilities': 'Capabilities',
  'squadron': 'Mission Planner',
  'stacks': 'Stacks'
};

// Slot capacity and category keys imported from ../data/vesselData.js
// Main Loadout Builder Component
const LoadoutBuilder = () => {
  const _dataStore = useDataStore();
  const { selectedHull } = useOutfitterStore();
  const { goBack, getPreviousView } = useNavigationStore();

  // Configuration store - unified state management
  const {
    activeConfig,
    startNewConfiguration,
    setSlotCapability,
    addSlot,
    removeSlot,
    saveActiveConfiguration,
    closeActiveConfiguration
  } = useConfigurationStore();

  // Version tracking
  const versionCount = useVersionStore(s => {
    const configId = activeConfig?.id;
    return configId ? (s.versionHistory[configId] || []).length : 0;
  });

  // SBOM / Architecture diagram / Version modal state
  const [showSBOM, setShowSBOM] = useState(false);
  const [showArch, setShowArch] = useState(false);
  const [sbomData, setSbomData] = useState(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [lastSavedConfigId, setLastSavedConfigId] = useState(null);

  const handleGenerateSBOM = () => {
    const sbom = generateSBOMFromActiveConfig(activeConfig, selectedHull?.name || '');
    if (sbom) {
      setSbomData(sbom);
      setShowSBOM(true);
    }
  };

  // Derive loadout from activeConfig for display (convert names to objects)
  const loadout = useMemo(() => {
    if (!activeConfig?.slots) {
      return {
        SENSORS: [],
        COMMS: [],
        WEAPONS: [],
        C2: [],
        NAV: [],
        AI: [],
        UTILITY: [],
        OTHER: []
      };
    }

    const result = {};
    CATEGORY_KEYS.forEach(category => {
      const slotNames = activeConfig.slots[category] || [];
      result[category] = slotNames.map(name => name ? getCapabilityByName(name) : null);
    });
    return result;
  }, [activeConfig]);

  // Extra slots are now tracked in activeConfig.slots (length beyond base capacity)
  const extraSlots = useMemo(() => {
    if (!activeConfig?.slots) {
      return {
        SENSORS: 0,
        COMMS: 0,
        WEAPONS: 0,
        C2: 0,
        NAV: 0,
        AI: 0,
        UTILITY: 0,
        OTHER: 0
      };
    }

    const baseCapacity = VESSEL_SLOT_CAPACITY[activeConfig.hullName] || DEFAULT_SLOT_CAPACITY;
    const result = {};
    CATEGORY_KEYS.forEach(category => {
      const currentSlots = activeConfig.slots[category]?.length || 0;
      const baseSlots = baseCapacity[category] || 0;
      result[category] = Math.max(0, currentSlots - baseSlots);
    });
    return result;
  }, [activeConfig]);

  // Visible categories state (which categories are shown)
  const [visibleCategories, setVisibleCategories] = useState({
    SENSORS: true,
    COMMS: true,
    WEAPONS: true,
    C2: true,
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

  // Quick Apply dropdown state
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);

  // Deployment modal state
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

  // Navigation store for mission planner navigation
  const { setSelectedView } = useNavigationStore();

  // Get base slot capacity for current vessel
  const baseSlotCapacity = VESSEL_SLOT_CAPACITY[selectedHull?.name] || DEFAULT_SLOT_CAPACITY;

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

  // Add extra slot to a category - uses store action
  const handleAddSlot = (categoryKey) => {
    addSlot(categoryKey);
  };

  // Remove extra slot from a category - uses store action
  const handleRemoveSlot = (categoryKey) => {
    removeSlot(categoryKey);
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
  const hiddenCategories = LOADOUT_CATEGORY_KEYS.filter(key => !visibleCategories[key]);

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

  // Apply a stack's capabilities to the loadout
  const handleApplyStack = (stack) => {
    if (!stack.capabilityRefs) return;

    // Find the actual capability objects from the refs
    const stackCapabilities = stack.capabilityRefs
      .map(ref => individualCapabilities.find(cap => cap.name === ref))
      .filter(Boolean);

    // Place each capability in the appropriate category using store actions
    stackCapabilities.forEach(cap => {
      for (const [key, cat] of Object.entries(LOADOUT_CATEGORIES)) {
        if (cat.types && cat.types.includes(cap.category)) {
          const capacity = getTotalCapacity(key);
          const currentSlots = activeConfig?.slots?.[key] || [];
          // Find first empty slot
          const emptyIndex = currentSlots.findIndex(s => s === null);
          if (emptyIndex !== -1) {
            setSlotCapability(key, emptyIndex, cap.name);
            break;
          } else if (currentSlots.length < capacity) {
            setSlotCapability(key, currentSlots.length, cap.name);
            break;
          }
        }
      }
    });

    setQuickApplyOpen(false);
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
        const currentSlots = activeConfig?.slots?.[key] || [];
        const emptyIndex = currentSlots.findIndex(item => item === null);
        if (emptyIndex !== -1) return { category: key, index: emptyIndex };
        if (currentSlots.length < capacity) return { category: key, index: currentSlots.length };
      }
    }
    return null;
  };

  // Handle capability selection - stores capability NAME, not object
  const handleSelectCapability = (capability) => {
    // If in global search mode, find appropriate slot
    if (isGlobalSearchMode) {
      const slot = findSlotForCapability(capability);
      if (slot) {
        setSlotCapability(slot.category, slot.index, capability.name);
      }
    } else if (selectedSlotIndex) {
      const { category, index } = selectedSlotIndex;
      setSlotCapability(category, index, capability.name);
    }
    setBrowserOpen(false);
    setSelectedSlotIndex(null);
    setPreviewCapability(null);
  };

  // Handle remove capability - uses store action
  const handleRemove = (categoryKey, index) => {
    setSlotCapability(categoryKey, index, null);
  };

  // Close browser
  const handleCloseBrowser = () => {
    setBrowserOpen(false);
    setSelectedSlotIndex(null);
    setPreviewCapability(null);
    setIsGlobalSearchMode(false);
    setGlobalSearchTerm('');
  };

  // Handle save configuration — saves config, then shows version commit modal
  const handleSave = () => {
    const configId = saveActiveConfiguration();
    if (configId) {
      setLastSavedConfigId(configId);
      setShowVersionModal(true);
    }
  };

  // Handle back navigation - close active config and go to previous view
  const handleBack = () => {
    closeActiveConfiguration();
    goBack('shipyard');
  };

  // Get the display name for the back button
  const previousView = getPreviousView();
  const backButtonText = previousView ? `Back to ${VIEW_NAMES[previousView] || previousView}` : 'Back';

  // Get vessel hull component
  const VesselHull = selectedHull ? vesselHullComponents[selectedHull.icon] || vesselHullComponents[selectedHull.name] : null;

  // Initialize configuration when component mounts
  useEffect(() => {
    if (!selectedHull) {
      goBack('shipyard');
      return;
    }

    // Only start a new config if there's no active config at all
    // If activeConfig exists (e.g., loaded from "Edit Configuration"), keep it
    if (!activeConfig) {
      startNewConfiguration(selectedHull.name);
    }
  }, [selectedHull, goBack, activeConfig, startNewConfiguration]);

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
            onClick={handleBack}
            className="px-3 py-2 bg-transparent border border-lime-brand/50 text-lime-brand rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-lime-brand/10 transition-colors"
          >
            <ChevronLeft size={18} />
            {backButtonText}
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
          }`}
          >
            {deploymentStatus.isReady ? (
              <><CheckCircle2 size={14} /> Ready</>
            ) : (
              <><AlertCircle size={14} /> {deploymentStatus.equippedCount === 0 ? 'Empty' : 'Incomplete'}</>
            )}
          </div>
          <button
            onClick={handleGenerateSBOM}
            className="px-3 py-3 bg-transparent border border-cyan-500/40 text-cyan-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/10 transition-colors"
            title="Generate SBOM"
          >
            <FileText size={15} /> SBOM
          </button>
          <div style={{ position: 'relative', display: 'flex' }}>
            <button
              onClick={() => setShowArch(true)}
              className="px-3 py-3 bg-transparent border border-violet-500/40 text-violet-500 text-xs font-semibold flex items-center gap-1.5 hover:bg-violet-500/10 transition-colors"
              style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
              title="Architecture Diagram"
            >
              <GitBranch size={15} /> SV-2
            </button>
            <button
              onClick={() => setShowVersionDropdown(!showVersionDropdown)}
              className="px-2 py-3 bg-transparent border border-violet-500/40 text-violet-500 text-xs font-semibold flex items-center hover:bg-violet-500/10 transition-colors"
              style={{ borderRadius: '0 8px 8px 0' }}
              title={`${versionCount} version${versionCount !== 1 ? 's' : ''} — click for history`}
            >
              {versionCount > 0 && (
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#cbfd00', marginRight: '2px' }}>{versionCount}</span>
              )}
              ▾
            </button>
            {/* Version dropdown */}
            {showVersionDropdown && activeConfig?.id && (
              <VersionDropdown
                configId={activeConfig.id}
                onClose={() => setShowVersionDropdown(false)}
                onSelectVersion={(ver) => { setViewingVersion(ver); setShowVersionDropdown(false); }}
              />
            )}
          </div>
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${
              activeConfig?.isDirty
                ? 'bg-lime-brand hover:bg-lime-brand/90 text-black'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            <Check size={18} />
            {activeConfig?.isDirty ? 'Save Configuration' : 'Saved'}
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

          {/* Quick Apply Dropdown */}
          <div className="relative">
            <button
              onClick={() => setQuickApplyOpen(!quickApplyOpen)}
              className="px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold hover:bg-purple-500/20 transition-colors flex items-center gap-2"
            >
              <Layers size={16} />
              Quick Apply
              <ChevronDown size={14} className={`transition-transform ${quickApplyOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {quickApplyOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickApplyOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-darkest border border-gray-700/50 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-700/50 bg-purple-500/10">
                    <div className="text-purple-400 font-semibold text-sm flex items-center gap-2">
                      <Layers size={14} />
                      Apply Saved Stack
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Apply all capabilities from a pre-configured stack
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                    {engineeringStacks.length === 0 ? (
                      <div className="text-gray-500 text-sm text-center py-4">
                        No saved stacks available
                      </div>
                    ) : (
                      engineeringStacks.map((stack) => {
                        const IconComponent = stack.icon;
                        const capCount = stack.capabilityRefs?.length || 0;
                        return (
                          <button
                            key={stack.name}
                            onClick={() => handleApplyStack(stack)}
                            className="w-full p-3 bg-darker hover:bg-gray-700/50 rounded-lg text-left transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <IconComponent size={16} className="text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-gray-100 font-semibold text-sm truncate group-hover:text-lime-brand transition-colors">
                                  {stack.name}
                                </div>
                                <div className="text-gray-500 text-xs truncate">
                                  {stack.provider}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-purple-400 text-xs">
                                    {capCount} capabilities
                                  </span>
                                  <span className="text-gray-600">•</span>
                                  <span className="text-cyan-400 text-xs">{stack.trl}</span>
                                </div>
                              </div>
                              <Plus size={16} className="text-gray-600 group-hover:text-lime-brand transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-700/50 bg-gray-800/30">
                    <p className="text-gray-500 text-xs text-center">
                      Stacks apply to available slots only
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
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
            <LoadoutStatsDisplay
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

        {/* Right Column - C2, Nav, AI, Utility */}
        <div className="space-y-4">
          {['C2', 'NAV', 'AI', 'UTILITY'].filter(key => visibleCategories[key]).map(key => (
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

      {/* SBOM Modal */}
      {showSBOM && sbomData && (
        <SBOMDisplay sbom={sbomData} onClose={() => setShowSBOM(false)} />
      )}

      {/* Version Detail Modal */}
      {viewingVersion && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }}>
          <div className="card-accent" style={{ width: '500px', maxWidth: '90vw', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderColor: 'rgba(203, 253, 0, 0.3)' }}>
            <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(75, 85, 99, 0.3)', flexShrink: 0 }}>
              <h3 className="text-lime-brand text-sm font-bold m-0">Version Snapshot</h3>
              <button onClick={() => setViewingVersion(null)} className="btn-ghost" style={{ padding: '4px', minHeight: 'auto' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <VersionDetailPanel version={viewingVersion} />
            </div>
          </div>
        </div>
      )}

      {/* Version Commit Modal */}
      {showVersionModal && lastSavedConfigId && (
        <CreateVersionModal
          configId={lastSavedConfigId}
          activeConfig={activeConfig}
          hullName={selectedHull?.name || ''}
          onClose={() => setShowVersionModal(false)}
        />
      )}

      {/* SV-2 Editor (Mermaid + Monaco + AI Chat) */}
      {showArch && (
        <SV2Editor
          activeConfig={activeConfig}
          hullName={selectedHull?.name || ''}
          onClose={() => setShowArch(false)}
        />
      )}
    </div>
  );
};

// Version history dropdown — shows recent versions next to SV-2 button
// Uses local state snapshot to avoid Zustand selector infinite loop
const VersionDropdown = ({ configId, onClose, onSelectVersion }) => {
  const [versions] = useState(() => {
    const state = useVersionStore.getState();
    const ids = (state.versionHistory[configId] || []).slice(0, 8);
    return ids.map(id => state.versions[id]).filter(Boolean);
  });

  return (
    <>
      {/* Click-away overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      <div style={{
        position: 'absolute', top: '100%', right: 0, marginTop: '8px',
        width: '300px', backgroundColor: '#1a2530', border: '1px solid rgba(203, 253, 0, 0.2)',
        borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 100,
        overflow: 'hidden'
      }}
      >
        <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(75, 85, 99, 0.3)', fontSize: '10px', fontWeight: 700, color: '#cbfd00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Versions
        </div>
        <div style={{ maxHeight: '280px', overflow: 'auto' }}>
          {versions.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              No versions saved yet
            </div>
          ) : (
            versions.map((ver, idx) => {
              const date = new Date(ver.createdAt);
              const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={ver.id} onClick={() => onSelectVersion?.(ver)} style={{
                  padding: '8px 12px',
                  borderBottom: idx < versions.length - 1 ? '1px solid rgba(75, 85, 99, 0.15)' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  cursor: 'pointer', transition: 'background-color 0.1s'
                }} className="hover:bg-lime-brand/5"
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                    backgroundColor: idx === 0 ? '#cbfd00' : '#4b5563'
                  }}
                  />
                  <div style={{ flex: 1 }}>
                    {ver.tag && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700, color: '#cbfd00', fontFamily: 'monospace',
                        backgroundColor: 'rgba(203, 253, 0, 0.1)', padding: '0 4px', borderRadius: '2px',
                        marginRight: '4px'
                      }}
                      >
                        {ver.tag}
                      </span>
                    )}
                    <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.3' }}>{ver.message}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>
                      {timeStr} • {ver.snapshot?.equippedCount || 0} capabilities
                      {idx === 0 && <span style={{ color: '#cbfd00', marginLeft: '4px', fontWeight: 600 }}>LATEST</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div style={{ padding: '6px 12px', borderTop: '1px solid rgba(75, 85, 99, 0.3)', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#6b7280' }}>
            Full history available in Versions tab
          </span>
        </div>
      </div>
    </>
  );
};

export default LoadoutBuilder;
