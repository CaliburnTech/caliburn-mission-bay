import React, { useEffect } from 'react';
import { Ship } from 'lucide-react';
import { individualCapabilities } from '../data/marketplaceData';
import { vesselHullData } from '../data/vesselData';
import useDataStore from '../providers/dataStore';
import useNavigationStore from '../store/navigationStore';
import useFilterStore from '../store/filterStore';
import useOutfitterStore from '../store/outfitterStore';
import useConfigurationStore from '../store/configurationStore';
import useUIStore from '../store/uiStore';
import useSquadronStore from '../store/squadronStore';
import caliburnLogotype from '../assets/Caliburn Logotype Dark Mode.png';
import missionBayLogotype from '../assets/Mission Bay Logotype.png';
import ShipyardView from './ShipyardView';
import MissionPlanner from './MissionPlanner';
import MissionMatrix from './MissionMatrix';
import GlobalSearch from './GlobalSearch';
import StacksView from './StacksView';
import CapabilityCatalogView from './CapabilityCatalogView';
import OutfitterView from './OutfitterView';
import LoadoutBuilder from './LoadoutBuilder';
import DeploymentModal from './DeploymentModal';
import SquadronManagementModal from './SquadronManagementModal';
import CapabilityDetailsModal from './CapabilityDetailsModal';
import VersionControlView from './VersionControlView';
import AdminSubmissionsView from './AdminSubmissionsView';
import CartDropdown from './CartDropdown';
import { isProduction } from '../providers/dataInterface';
import HeaderAuth from '../auth/HeaderAuth';
import SignInModal from '../auth/SignInModal';
import OnboardingModal from '../auth/OnboardingModal';

const MarketplacePage = ({ onLogoClick }) => {
  const _dataStore = useDataStore();
  // Prefer the data store's capabilities (static + published DB products, merged
  // by the adapter) so vendor products appear alongside the static catalog.
  // Falls back to the static import before the store has loaded.
  const mergedCapabilities = _dataStore.capabilities?.length
    ? _dataStore.capabilities
    : individualCapabilities;
  // Platforms for the "Will it fit?" picker — the store merges static hulls
  // (demo) with vendor platform products (production); fall back to the
  // static hull list before the store has loaded.
  const mergedPlatforms = _dataStore.vessels?.length
    ? _dataStore.vessels
    : vesselHullData;

  // Navigation store
  const { selectedView, setSelectedView } = useNavigationStore();

  // Filter store (the redesigned capability catalog filters locally; the
  // global search term is still cleared on logo click)
  const { setSearchTerm } = useFilterStore();

  // Outfitter store
  const {
    setSelectedHull,
    setSelectedMountPoint,
    setVesselConfiguration,
    selectedCapabilityDetails, setSelectedCapabilityDetails
  } = useOutfitterStore();

  // UI store
  const {
    setExpandedStack,
    showSquadrons, setShowSquadrons
  } = useUIStore();

  // Squadron store for opening squadron management modal
  const { openSquadronManagement } = useSquadronStore();

  // Persist view state and update URL
  useEffect(() => {
    try {
      localStorage.setItem('caliburn-marketplace-view', selectedView);
    } catch {
      // Silently fail in private browsing mode
    }
    window.history.replaceState(null, '', `#${selectedView}`);
  }, [selectedView]);

  // Handle browser back/forward navigation (setSelectedView validates the view)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== selectedView) {
        setSelectedView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedView, setSelectedView]);


  // Navigate back to marketplace and highlight capability







  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="bg-darker border-b-2 border-lime-brand/30">
        <div className="max-w-7xl mx-auto px-3 py-2 md:px-6 md:py-5 flex items-center justify-between gap-2">
          <div
            onClick={() => {
              if (onLogoClick) {
                onLogoClick();
              } else {
                setSelectedView('stacks');
              }
              setSelectedHull(null);
              setSelectedMountPoint(null);
              setSearchTerm('');
            }}
            className="flex items-center gap-2 md:gap-8 cursor-pointer group min-w-0"
            title="Return to Home"
          >
            <img
              src={caliburnLogotype}
              alt="Caliburn"
              className="h-7 md:h-12 w-auto flex-shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="border-l border-gray-600/50 pl-2 md:pl-8 min-w-0">
              <img
                src={missionBayLogotype}
                alt="Mission Bay"
                className="h-5 md:h-8 w-auto"
              />
              <p className="hidden md:block text-sm text-gray-400 mt-1">
                Pre-integrated capabilities ready for deployment on TempestOS
              </p>
            </div>
          </div>

          {/* Production-only auth controls — demo mode renders nothing here */}
          {isProduction && <HeaderAuth />}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Navigation Bar */}
        <div className="mb-10 py-6 bg-transparent border-b border-gray-700/60">
          {/* Navigation Tabs and Search in flex container */}
          <div className="flex justify-between items-center gap-4 flex-wrap">
            {/* Navigation Tabs - Squadrons first */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 md:flex-wrap scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedView('shipyard');
                  setSelectedHull(null);
                }}
                className={`${(selectedView === 'shipyard' || selectedView === 'outfitter') ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Squadrons
              </button>
              <button
                onClick={() => setSelectedView('capabilities')}
                className={`${selectedView === 'capabilities' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Capabilities
              </button>
              {/* Mission Matrix nav hidden — keep for future use
              <button
                onClick={() => setSelectedView('matrix')}
                className={`${selectedView === 'matrix' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Mission Matrix
              </button>
              */}
              <button
                onClick={() => setSelectedView('squadron')}
                className={`${selectedView === 'squadron' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Mission Planner
              </button>
              <button
                onClick={() => setSelectedView('versions')}
                className={`${selectedView === 'versions' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Versions
              </button>
            </div>

            {/* Global Search — desktop only */}
            <div className="hidden md:block">
            <GlobalSearch
              onNavigate={(view, data) => {
                // Redirect stacks to capabilities
                const targetView = view === 'stacks' ? 'capabilities' : view;
                // Set item-specific state before changing view so the target component
                // never mounts with null data (avoids the goBack() guard firing)
                if (view === 'capabilities' && data) {
                  setSelectedCapabilityDetails(data);
                } else if (view === 'stacks' && data) {
                  setExpandedStack(data.name);
                } else if (view === 'outfitter' && data) {
                  setSelectedHull(data);
                }
                setSelectedView(targetView);
              }}
            />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-x-clip">
            {selectedView === 'capabilities' && (
              <CapabilityCatalogView
                capabilities={mergedCapabilities}
                platforms={mergedPlatforms}
                onConfigure={() => {
                  setSelectedHull(null);
                  setSelectedView('shipyard');
                }}
              />
            )}


            {selectedView === 'outfitter' && (
              <LoadoutBuilder />
            )}

            {selectedView === 'shipyard' && (
              <ShipyardView
                openSquadronManagement={openSquadronManagement}
                showSquadrons={showSquadrons}
                setShowSquadrons={setShowSquadrons}
                onSelectHull={(hull) => {
                  setSelectedHull(hull);
                  setSelectedMountPoint(null);
                  setVesselConfiguration({});
                  // Configuring a hull from the Squadrons page always starts a
                  // brand-new configuration (separate config, not a new version of
                  // the last one). Editing from the Versions page keeps the config
                  // id and produces a new version instead.
                  useConfigurationStore.getState().startNewConfiguration(hull.name);
                  setSelectedView('outfitter');
                }}
              />
            )}
            
            {/* Mission Matrix — hidden, keep for future use
            {selectedView === 'matrix' && (
              <MissionMatrix />
            )}
            */}

            {/* Mission Planner */}
            {selectedView === 'squadron' && (
              <div className="hidden md:block">
                <MissionPlanner />
              </div>
            )}
            {selectedView === 'squadron' && (
              <div className="md:hidden overflow-y-auto">
                <MissionPlanner />
              </div>
            )}

            {/* Versions */}
            {selectedView === 'versions' && (
              <VersionControlView />
            )}

            {/* Admin Submissions */}
            {selectedView === 'submissions' && (
              <AdminSubmissionsView />
            )}

          </div>
        </div>
      </div>

      {/* Deployment Modal - uses deploymentStore internally */}
      <DeploymentModal />

      {/* Squadron Management Modal - uses squadronStore internally */}
      <SquadronManagementModal />

      {/* Capability Details Modal */}
      <CapabilityDetailsModal
        selectedCapabilityDetails={selectedCapabilityDetails}
        setSelectedCapabilityDetails={setSelectedCapabilityDetails}
      />

      {/* Production-only auth modals (sign-in prompt + post-sign-in onboarding).
          Never mounted in demo mode — demo behavior is unchanged. */}
      {isProduction && (
        <>
          <SignInModal />
          <OnboardingModal />
        </>
      )}
    </div>
  );
};

export default MarketplacePage;

