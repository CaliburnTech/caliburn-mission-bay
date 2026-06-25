import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, Eye, Crosshair, Shield, Navigation, Cpu,
  Wifi, Zap, Plus, X, Check, Ship,
  AlertCircle, CheckCircle2, Search, Layers, ChevronDown,
  FileText, GitBranch, Map
} from 'lucide-react';
import { getEligibleRolesByMission } from '../utils/roleUtils';
import { MISSION_ROLES } from '../data/missionRoles';
import { ALL_MISSIONS } from './mission-planner/constants';
import ReadinessChecklist from './mission-planner/ReadinessChecklist';
import useOutfitterStore from '../store/outfitterStore';
import useNavigationStore from '../store/navigationStore';
import useConfigurationStore, { getCapabilityByName, CATEGORY_KEYS } from '../store/configurationStore';
import useMissionStore from '../store/missionStore';
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
    types: [
      'EO/IR SENSORS', 'RADAR/RF', 'ACOUSTIC/SONAR', 'ELECTRONIC SUPPORT',
      'ELECTRONIC PROTECTION',
      // Variant category names used in marketplaceData
      'ACOUSTIC SENSORS', 'ACOUSTIC DECOY', 'RADAR SENSORS', 'SENSORS & DETECTION',
      'SIGNALS INTELLIGENCE', 'ISR', 'ISR & SURVEILLANCE', 'SAR',
      'MCM', 'MCM SYSTEMS', 'EW', 'ASW',
    ],
    description: 'Detection, surveillance & EW systems'
  },
  COMMS: {
    name: 'Communications',
    icon: Wifi,
    color: CATEGORY_COLORS.COMMS.hex,
    types: ['RF COMMUNICATIONS', 'SATCOM', 'UNDERWATER COMMS', 'COMMUNICATIONS'],
    description: 'Data links & networking'
  },
  WEAPONS: {
    name: 'Weapons',
    icon: Crosshair,
    color: CATEGORY_COLORS.WEAPONS.hex,
    types: ['KINETIC WEAPONS', 'DIRECTED ENERGY', 'WEAPONS', 'COMBAT', 'SEA_CONTROL', 'FORCE_PROTECTION', 'ELECTRONIC ATTACK'],
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
    types: [
      'LOGISTICS', 'LOGISTICS & SUPPORT', 'MAINTENANCE', 'SUPPLY CHAIN',
      'DATA PROCESSING', 'CYBER DEFENSE', 'DEFENSE', 'ESCORT',
    ],
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
// Port Security Mission Set — must match PortSecurityMissionView MISSION_SET_CAPS
const PORT_SECURITY_CAPS = ['Echodyne EchoGuard CR', 'OrbComm ST 6100', 'LOS Mesh Radio', 'OceanSonics icListen HF Smart Hydrophone Array', 'MOOS-IvP'];

const MISSION_SET_LABELS = {
  PORT_SECURITY:        'Port Security Mission Set',
  MCM:                  'Mine Clearance Mission Set',
  COUNTER_C5ISR:        'ISR Tethered Drone Mission Set',
  ISR:                  'Taiwan ISR Mission Set',
  ASW:                  'ASW Mission Set',
  NON_KINETIC_EW:       'Non-Kinetic EW Mission Set',
  MDA_ISR:              'MDA ISR Mission Set',
  PROTECTIONS:          'Protections Mission Set',
  CONTESTED_LOGISTICS:  'Contested Logistics Mission Set',
  KINETIC_EFFECTS:      'Kinetic Effects Mission Set',
};

// Main Loadout Builder Component
const LoadoutBuilder = () => {
  const _dataStore = useDataStore();
  const { selectedHull } = useOutfitterStore();
  const { goBack, getPreviousView, setSelectedView } = useNavigationStore();

  // Configuration store - unified state management
  const {
    activeConfig,
    startNewConfiguration,
    setSlotCapability,
    addSlot,
    removeSlot,
    saveActiveConfiguration,
    closeActiveConfiguration,
    pendingMissionSetKey,
    appliedMissionSetKey,
    setAppliedMissionSet,
    clearAppliedMissionSet,
    setPendingRoleKey,
    setPendingMissionSetKey,
  } = useConfigurationStore();

  // Effective mission set key/caps: prefer the pending (arrive-via-configure) value,
  // fall back to whatever was last applied (so the button persists on direct navigation)
  const effectiveMissionSetKey = pendingMissionSetKey || appliedMissionSetKey;

  // Mission store — for Port Security deep-link
  const { setSelectedMissionTemplate, setPendingMissionOpen, roleAssignments, assignVesselToRole, clearRoleAssignment } = useMissionStore();

  // Port Security Mission Set state
  const [_portSecApplied, setPortSecApplied] = useState(
    () => useConfigurationStore.getState().pendingMissionSetKey === 'PORT_SECURITY'
  );
  const [genericMissionSetApplied, setGenericMissionSetApplied] = useState(() => {
    const { pendingMissionSetKey: pk, appliedMissionSetKey: ak } = useConfigurationStore.getState();
    const key = pk || ak;
    return key !== null && key !== 'PORT_SECURITY';
  });

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

  // Configure for Mission dropdown state
  const [configMissionOpen, setConfigMissionOpen] = useState(false);

  // Deployment modal state
  const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

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

  // Apply the Port Security Mission Set capabilities to the loadout
  const handleApplyPortSecurity = () => {
    PORT_SECURITY_CAPS.forEach(capName => {
      const cap = individualCapabilities.find(c => c.name === capName);
      if (!cap) return;
      for (const [key, cat] of Object.entries(LOADOUT_CATEGORIES)) {
        if (cat.types && cat.types.includes(cap.category)) {
          const capacity = getTotalCapacity(key);
          // Read fresh store state each iteration so prior setSlotCapability calls are visible
          const freshSlots = useConfigurationStore.getState().activeConfig?.slots?.[key] || [];
          // Guard against StrictMode double-invoke: skip if already placed
          if (freshSlots.some(s => s === cap.name)) break;
          const emptyIndex = freshSlots.findIndex(s => s === null);
          if (emptyIndex !== -1) {
            setSlotCapability(key, emptyIndex, cap.name);
            break;
          } else if (freshSlots.length < capacity) {
            setSlotCapability(key, freshSlots.length, cap.name);
            break;
          }
        }
      }
    });
    setPortSecApplied(true);
  };

  const _handleRemovePortSecurity = () => {
    PORT_SECURITY_CAPS.forEach(capName => {
      const slots = useConfigurationStore.getState().activeConfig?.slots || {};
      for (const [key, slotArr] of Object.entries(slots)) {
        if (!slotArr) continue;
        const idx = slotArr.indexOf(capName);
        if (idx !== -1) {
          setSlotCapability(key, idx, null);
          break;
        }
      }
    });
    setPortSecApplied(false);
  };

  const handleApplyGenericMissionSet = () => {
    const { pendingMissionSetCaps, pendingMissionSetKey: pk, appliedMissionSetKey: ak } = useConfigurationStore.getState();
    const caps = pendingMissionSetCaps || useConfigurationStore.getState().appliedMissionSetCaps;
    const key = pk || ak;
    if (!caps) return;
    caps.forEach(capName => {
      const cap = individualCapabilities.find(c => c.name === capName);
      if (!cap) return;
      let placed = false;
      for (const [key, cat] of Object.entries(LOADOUT_CATEGORIES)) {
        if (cat.types && cat.types.includes(cap.category)) {
          const capacity = getTotalCapacity(key);
          const freshSlots = useConfigurationStore.getState().activeConfig?.slots?.[key] || [];
          // Skip if this cap is already in the slot (guards against StrictMode double-invoke)
          if (freshSlots.some(s => s === cap.name)) { placed = true; break; }
          const emptyIndex = freshSlots.findIndex(s => s === null);
          if (emptyIndex !== -1) {
            setSlotCapability(key, emptyIndex, cap.name);
            placed = true;
            break;
          } else if (freshSlots.length < capacity) {
            setSlotCapability(key, freshSlots.length, cap.name);
            placed = true;
            break;
          }
        }
      }
      if (!placed) {
        const otherSlots = useConfigurationStore.getState().activeConfig?.slots?.['OTHER'] || [];
        const otherEmpty = otherSlots.findIndex(s => s === null);
        if (otherEmpty !== -1 && !otherSlots.some(s => s === cap.name)) {
          setSlotCapability('OTHER', otherEmpty, cap.name);
        }
      }
    });
    setAppliedMissionSet(key, caps);
    setGenericMissionSetApplied(true);
  };

  const handleRemoveGenericMissionSet = () => {
    const caps = useConfigurationStore.getState().appliedMissionSetCaps;
    if (!caps) { setGenericMissionSetApplied(false); return; }
    caps.forEach(capName => {
      const slots = useConfigurationStore.getState().activeConfig?.slots || {};
      for (const [key, slotArr] of Object.entries(slots)) {
        if (!slotArr) continue;
        const idx = slotArr.indexOf(capName);
        if (idx !== -1) {
          setSlotCapability(key, idx, null);
          break;
        }
      }
    });
    clearAppliedMissionSet();
    setGenericMissionSetApplied(false);
  };

  // Track which role caps were last applied by the dynamic role system (separate from configurationStore)
  // so we can clear them on deselect without polluting appliedMissionSetKey.
  const [activeRoleCaps, setActiveRoleCaps] = useState(null);

  // Persists the "Configure for Mission" dropdown selection across useEffect clearing of pendingMissionSetKey.
  // Initialised from pendingMissionSetKey (set by mission-view configure buttons) so it survives the
  // one-time useEffect that clears pending keys after applying caps.
  const [configMission, setConfigMission] = useState(
    () => useConfigurationStore.getState().pendingMissionSetKey || null
  );

  // Captures the vessel's displayed label (e.g. 'M48-ALPHA (CAPTAS)') for the duration of this
  // configure session. pendingVesselLabel is set by the mission view before navigating here and
  // cleared by the mount useEffect — reading it here (at component creation) preserves it.
  const [sessionVesselLabel] = useState(
    () => useConfigurationStore.getState().pendingVesselLabel || ''
  );

  // Captures the specific role this session was opened for (e.g. 'ASW_BRAVO').
  // pendingRoleKey is cleared by the mount useEffect, so we snapshot it here.
  // Used by "Go to Mission" to assign back to the exact role, not just the first
  // role whose platformType matches (which always picks the first role for same-hull missions).
  const [sessionRoleKey] = useState(
    () => useConfigurationStore.getState().pendingRoleKey || ''
  );

  // Apply a mission role's capabilities to the loadout, then record the assignment.
  // vesselLabel overrides the default (selectedHull.name) — pass the displayed card name
  // so tactical callsigns like 'M48-ALPHA (CAPTAS)' survive configure round-trips.
  // skipAssignment=true: apply caps only, don't create a roleAssignment yet (used on first
  // open when no prior assignment exists — avoids "No configuration" message if user exits).
  const handleAssignRole = (missionKey, role, vesselLabel = null, skipAssignment = false) => {
    // Clear any previously applied dynamic role caps first
    if (activeRoleCaps) {
      activeRoleCaps.forEach(capName => {
        const slots = useConfigurationStore.getState().activeConfig?.slots || {};
        for (const [key, slotArr] of Object.entries(slots)) {
          if (!slotArr) continue;
          const idx = slotArr.indexOf(capName);
          if (idx !== -1) { setSlotCapability(key, idx, null); break; }
        }
      });
    }
    // Clear any pre-existing generic mission set assignment too
    const prevGenericCaps = useConfigurationStore.getState().appliedMissionSetCaps;
    if (prevGenericCaps) {
      prevGenericCaps.forEach(capName => {
        const slots = useConfigurationStore.getState().activeConfig?.slots || {};
        for (const [key, slotArr] of Object.entries(slots)) {
          if (!slotArr) continue;
          const idx = slotArr.indexOf(capName);
          if (idx !== -1) { setSlotCapability(key, idx, null); break; }
        }
      });
      clearAppliedMissionSet();
      setGenericMissionSetApplied(false);
    }
    // Apply new role caps
    role.capabilities.forEach(capName => {
      const cap = individualCapabilities.find(c => c.name === capName);
      if (!cap) return;
      let placed = false;
      for (const [catKey, cat] of Object.entries(LOADOUT_CATEGORIES)) {
        if (cat.types && cat.types.includes(cap.category)) {
          const capacity = getTotalCapacity(catKey);
          const freshSlots = useConfigurationStore.getState().activeConfig?.slots?.[catKey] || [];
          if (freshSlots.some(s => s === cap.name)) { placed = true; break; }
          const emptyIndex = freshSlots.findIndex(s => s === null);
          if (emptyIndex !== -1) {
            setSlotCapability(catKey, emptyIndex, cap.name);
            placed = true; break;
          } else if (freshSlots.length < capacity) {
            setSlotCapability(catKey, freshSlots.length, cap.name);
            placed = true; break;
          }
        }
      }
      if (!placed) {
        const otherSlots = useConfigurationStore.getState().activeConfig?.slots?.['OTHER'] || [];
        const otherEmpty = otherSlots.findIndex(s => s === null);
        if (otherEmpty !== -1 && !otherSlots.some(s => s === cap.name)) {
          setSlotCapability('OTHER', otherEmpty, cap.name);
        }
      }
    });
    // Record caps locally (NOT in configurationStore) to avoid triggering the generic block
    setActiveRoleCaps(role.capabilities);
    if (!skipAssignment) {
      assignVesselToRole(missionKey, role.roleKey, selectedHull.name, selectedHull.name, vesselLabel || selectedHull.name);
    }
  };

  // Remove a role assignment and clear its capabilities
  const handleRemoveRole = (missionKey, role) => {
    const caps = activeRoleCaps || role.capabilities;
    caps.forEach(capName => {
      const slots = useConfigurationStore.getState().activeConfig?.slots || {};
      for (const [key, slotArr] of Object.entries(slots)) {
        if (!slotArr) continue;
        const idx = slotArr.indexOf(capName);
        if (idx !== -1) { setSlotCapability(key, idx, null); break; }
      }
    });
    setActiveRoleCaps(null);
    clearRoleAssignment(missionKey, role.roleKey);
  };

  // Navigate to Port Security mission in Mission Planner
  const _handleGoToMission = () => {
    setSelectedMissionTemplate('PORT_SECURITY');
    setPendingMissionOpen(true);
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
      // Use setSelectedView with skipHistory to avoid double-popping the history
      // stack in React StrictMode (which runs effects twice on mount). goBack()
      // would pop a different entry each time, potentially landing on the wrong view.
      setSelectedView('shipyard', { skipHistory: true });
      return;
    }

    // Only start a new config if there's no active config at all
    // If activeConfig exists (e.g., loaded from "Edit Configuration"), keep it
    if (!activeConfig) {
      startNewConfiguration(selectedHull.name);
    }
  }, [selectedHull, setSelectedView, activeConfig, startNewConfiguration]);

  // Auto-apply mission set caps (or a specific role) when arriving via the configure button
  useEffect(() => {
    const key = useConfigurationStore.getState().pendingMissionSetKey;
    const roleKey = useConfigurationStore.getState().pendingRoleKey;
    const config = useConfigurationStore.getState().activeConfig;
    if (!key || !config) return;

    if (roleKey) {
      // Navigate came from a specific vessel card — update only this role's assignment.
      // Do NOT call clearMissionAssignments here: it would wipe swaps of other vessels
      // in the same mission that the user has already set up.
      const role = MISSION_ROLES[key]?.roles?.find(r => r.roleKey === roleKey);
      // Use the displayed vessel name set by the mission view (e.g. 'M48-ALPHA (CAPTAS)')
      // so tactical callsigns survive configure round-trips. Fall back to hull name if absent.
      const vesselLabel = useConfigurationStore.getState().pendingVesselLabel || selectedHull.name;
      if (role) {
        const existingCaps = Object.values(config.slots || {}).flat().filter(Boolean);
        if (existingCaps.length > 0) {
          // Re-entering after a previous customisation — register assignment, preserve their work.
          setActiveRoleCaps(role.capabilities); // keeps "Go to Mission" button visible
          assignVesselToRole(key, role.roleKey, selectedHull.name, selectedHull.name, vesselLabel);
        } else {
          // First-time open (empty config). Only auto-create the assignment if one already
          // exists (e.g. from a swap) — preserving it with the correct label.
          // If there's NO prior assignment, just apply the default caps to the loadout
          // without creating an assignment; the user choosing "Go to Mission" creates it.
          // This prevents "⚠ No configuration — assign a boat" if the user exits immediately.
          const existingAssignment = useMissionStore.getState().roleAssignments?.[key]?.[roleKey];
          handleAssignRole(key, role, vesselLabel, /* skipAssignment= */ !existingAssignment);
        }
      }
      // Keep the Feature 4 "Configure for Mission" dropdown showing the right mission
      // even after we clear the pending keys below.
      setConfigMission(key);
      // Clear the pending role AND mission-set keys so the generic "ASW Mission Set"
      // banner doesn't appear alongside the specific role assignment
      setPendingRoleKey(null);
      useConfigurationStore.getState().setPendingMissionSetKey(null);
      useConfigurationStore.getState().setPendingMissionSetCaps(null);
      useConfigurationStore.getState().setPendingVesselLabel(null);
    } else if (key === 'PORT_SECURITY') {
      handleApplyPortSecurity();
      // Clear pending so it doesn't bleed into subsequent outfitter opens
      useConfigurationStore.getState().setPendingMissionSetKey(null);
      useConfigurationStore.getState().setPendingMissionSetCaps(null);
    } else if (useConfigurationStore.getState().pendingMissionSetCaps) {
      handleApplyGenericMissionSet();
      // Clear pending so it doesn't bleed into subsequent outfitter opens (mirrors PORT_SECURITY path above)
      useConfigurationStore.getState().setPendingMissionSetKey(null);
      useConfigurationStore.getState().setPendingMissionSetCaps(null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="grid grid-cols-[1fr_260px_1fr_300px] gap-6">
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

        {/* Center - Vessel Preview + Stats */}
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

        {/* Mission Sets Column */}
        <div className="flex flex-col gap-4">
          {/* Port Security Mission Set button removed — HORUS roles appear in the dynamic role list below */}

          {/* Configure for Mission panel */}
          {(() => {
            const hullName = selectedHull?.name;
            const platformType = selectedHull?.platformType;

            // Returns the best role this hull can fill in a given role list.
            // Priority: allowedHullNames > suggestedHullNames > defaultHullName > platformType (only if no hull hard-filter).
            const getBestFitRole = (roles) => (
              roles.find(r => r.allowedHullNames?.includes(hullName)) ||
              roles.find(r => r.suggestedHullNames?.includes(hullName)) ||
              roles.find(r => r.defaultHullName === hullName) ||
              roles.find(r => !r.allowedHullNames?.length && platformType && r.allowedPlatformTypes?.includes(platformType)) ||
              null
            );

            // Filter to only missions where this hull has a valid role, then sort by fit quality.
            const sortedMissions = ALL_MISSIONS
              .filter(mission => {
                const roles = MISSION_ROLES[mission.key]?.roles || [];
                return getBestFitRole(roles) !== null;
              })
              .sort((a, b) => {
                const score = (mission) => {
                  const roles = MISSION_ROLES[mission.key]?.roles || [];
                  if (roles.some(r => r.defaultHullName === hullName)) return 0;
                  if (roles.some(r => r.allowedHullNames?.includes(hullName) || r.suggestedHullNames?.includes(hullName))) return 1;
                  return 2;
                };
                return score(a) - score(b);
              });

            // Use configMission (persisted local state) so the dropdown keeps its selection
            // after the useEffect clears pendingMissionSetKey.
            const activeMissionKey = configMission || pendingMissionSetKey;
            const selectedMissionEntry = activeMissionKey
              ? ALL_MISSIONS.find(m => m.key === activeMissionKey)
              : null;

            // Determine which role to show in the checklist / assign on "Go to Mission".
            // Prefer the exact role this session was opened for (sessionRoleKey), then
            // use getBestFitRole so the hull lands in its correct slot, not always slot 0.
            const selectedMissionRoles = activeMissionKey ? (MISSION_ROLES[activeMissionKey]?.roles || []) : [];
            const matchedRole = (sessionRoleKey && selectedMissionRoles.find(r => r.roleKey === sessionRoleKey))
              || getBestFitRole(selectedMissionRoles)
              || selectedMissionRoles[0]
              || null;

            return (
              <div className="w-full rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 flex flex-col gap-3">
                <p className="text-[0.65rem] uppercase tracking-widest text-gray-500">Configure for Mission</p>

                {/* Picker button */}
                <div className="relative">
                  <button
                    onClick={() => setConfigMissionOpen(prev => !prev)}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold border border-gray-600 text-gray-300 bg-transparent hover:border-lime-brand/60 hover:text-white transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      {selectedMissionEntry ? selectedMissionEntry.name : 'Configure for mission ▾'}
                    </span>
                    <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${configMissionOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {configMissionOpen && (
                    <>
                      {/* Click-away backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setConfigMissionOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-darkest border border-gray-700/50 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                        {sortedMissions.map(mission => {
                          const roles = MISSION_ROLES[mission.key]?.roles || [];
                          const isRecommended = roles.some(r => r.defaultHullName === hullName);
                          const isCompatible = !isRecommended;
                          return (
                            <button
                              key={mission.key}
                              onClick={() => {
                                const bestRole = getBestFitRole(roles);
                                setPendingMissionSetKey(mission.key);
                                setConfigMission(mission.key);
                                setPendingRoleKey(bestRole?.roleKey || null);
                                setConfigMissionOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700/50 transition-colors flex items-center gap-2 ${
                                activeMissionKey === mission.key ? 'text-lime-brand bg-lime-brand/10' : 'text-gray-300'
                              }`}
                            >
                              {isRecommended && (
                                <span className="text-yellow-400 text-xs flex-shrink-0">★</span>
                              )}
                              <span className="flex-1 truncate">{mission.name}</span>
                              {isRecommended && (
                                <span className="text-[0.58rem] text-yellow-400/70 flex-shrink-0">Recommended</span>
                              )}
                              {isCompatible && !isRecommended && (
                                <span className="text-[0.58rem] text-cyan-500/70 flex-shrink-0">Compatible</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Live requirements checklist */}
                {activeMissionKey && matchedRole && (
                  <ReadinessChecklist
                    config={activeConfig}
                    role={matchedRole}
                    isDefault={false}
                  />
                )}

                {/* Go to Mission button */}
                {activeMissionKey && (
                  <button
                    onClick={() => {
                      // Assign this hull to the best-matched role before navigating
                      // so the mission view shows the configured boat, not the default preset.
                      // Use sessionVesselLabel (the card's displayed name, e.g. 'M48-ALPHA (CAPTAS)')
                      // so tactical callsigns are preserved rather than reverting to hull name.
                      if (matchedRole && selectedHull) {
                        const labelToUse = sessionVesselLabel || selectedHull.name;
                        assignVesselToRole(activeMissionKey, matchedRole.roleKey, selectedHull.name, selectedHull.name, labelToUse);
                      }
                      setSelectedMissionTemplate(activeMissionKey);
                      setPendingMissionOpen(true);
                      setSelectedView('squadron');
                    }}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-lime-brand text-black hover:bg-lime-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Go to Mission →
                  </button>
                )}
              </div>
            );
          })()}

          {/* Generic mission set — for all non-Port-Security missions */}
          {effectiveMissionSetKey && effectiveMissionSetKey !== 'PORT_SECURITY' && MISSION_SET_LABELS[effectiveMissionSetKey] && (
            <div className="w-full rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 flex flex-col gap-3">
              <p className="text-[0.65rem] uppercase tracking-widest text-gray-500">Mission Set</p>
              <button
                onClick={genericMissionSetApplied ? handleRemoveGenericMissionSet : handleApplyGenericMissionSet}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all flex items-center gap-2 ${
                  genericMissionSetApplied
                    ? 'bg-lime-brand/10 border-lime-brand text-lime-brand hover:bg-red-900/20 hover:border-red-400 hover:text-red-300'
                    : 'bg-transparent border-gray-600 text-gray-300 hover:border-lime-brand/60 hover:text-white'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${genericMissionSetApplied ? 'bg-lime-brand border-lime-brand' : 'border-gray-500'}`}>
                  {genericMissionSetApplied && <Check size={10} className="text-black" />}
                </span>
                {MISSION_SET_LABELS[effectiveMissionSetKey]}
              </button>
              {genericMissionSetApplied && (
                <button
                  onClick={() => {
                    const roleKey = useConfigurationStore.getState().pendingRoleKey;
                    if (effectiveMissionSetKey && roleKey && selectedHull) {
                      assignVesselToRole(effectiveMissionSetKey, roleKey, selectedHull.name, selectedHull.name, selectedHull.name);
                    }
                    setSelectedMissionTemplate(effectiveMissionSetKey);
                    setPendingMissionOpen(true);
                    setSelectedView('squadron');
                  }}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-lime-brand text-black hover:bg-lime-400 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Mission →
                </button>
              )}
            </div>
          )}

          {/* Dynamic Mission Sets — SWaP-based eligibility */}
          {(() => {
            const eligibleByMission = getEligibleRolesByMission(selectedHull.name);
            const missionKeys = Object.keys(eligibleByMission);
            if (missionKeys.length === 0) return null;
            // True if any role is currently assigned to this hull
            const hasActiveAssignment = activeRoleCaps !== null;
            return (
              <div className="w-full rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Map size={12} className="text-gray-500" />
                  <p className="text-[0.65rem] uppercase tracking-widest text-gray-500">Preconfigured Mission Sets</p>
                </div>
                {missionKeys.map(missionKey => {
                  const { missionLabel, roles } = eligibleByMission[missionKey];
                  return (
                    <div key={missionKey} className="flex flex-col gap-1.5">
                      <p className="text-[0.6rem] text-gray-500 font-semibold uppercase tracking-wide">{missionLabel}</p>
                      {roles.map(role => {
                        const assignment = roleAssignments?.[missionKey]?.[role.roleKey];
                        const isAssigned = !!(assignment && assignment.hullName === selectedHull.name);
                        const isLocked = hasActiveAssignment && !isAssigned;
                        return (
                          <div key={role.roleKey} className="flex flex-col gap-1.5">
                            <button
                              disabled={isLocked}
                              onClick={() => isAssigned ? handleRemoveRole(missionKey, role) : handleAssignRole(missionKey, role)}
                              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold border-2 transition-all flex items-start gap-2 text-left ${
                                isAssigned
                                  ? 'bg-lime-brand/10 border-lime-brand text-lime-brand hover:bg-red-900/20 hover:border-red-400 hover:text-red-300'
                                  : isLocked
                                  ? 'bg-transparent border-gray-700/30 text-gray-600 cursor-not-allowed opacity-40'
                                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-lime-brand/60 hover:text-white'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isAssigned ? 'bg-lime-brand border-lime-brand' : 'border-gray-500'}`}>
                                {isAssigned && <Check size={10} className="text-black" />}
                              </span>
                              {role.roleLabel}
                            </button>
                            {isAssigned && (
                              <button
                                onClick={() => {
                                  if (selectedHull) {
                                    assignVesselToRole(missionKey, role.roleKey, selectedHull.name, selectedHull.name, selectedHull.name);
                                  }
                                  setSelectedMissionTemplate(missionKey);
                                  setPendingMissionOpen(true);
                                  setSelectedView('squadron');
                                }}
                                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-lime-brand text-black hover:bg-lime-400 transition-colors flex items-center justify-center gap-2"
                              >
                                Go to Mission →
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
