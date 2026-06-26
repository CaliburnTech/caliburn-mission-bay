import React, { useEffect, useState } from 'react';
import { Ship, SlidersHorizontal } from 'lucide-react';
import { engineeringStacks, individualCapabilities, capabilityCategories } from '../data/marketplaceData';
import useDataStore from '../providers/dataStore';
import useNavigationStore from '../store/navigationStore';
import useFilterStore from '../store/filterStore';
import useOutfitterStore from '../store/outfitterStore';
import useUIStore from '../store/uiStore';
import useSquadronStore from '../store/squadronStore';
import caliburnLogotype from '../assets/Caliburn Logotype Dark Mode.png';
import ShipyardView from './ShipyardView';
import MissionPlanner from './MissionPlanner';
import MissionMatrix from './MissionMatrix';
import GlobalSearch from './GlobalSearch';
import StacksView from './StacksView';
import CapabilitiesView from './CapabilitiesView';
import OutfitterView from './OutfitterView';
import LoadoutBuilder from './LoadoutBuilder';
import DeploymentModal from './DeploymentModal';
import SquadronManagementModal from './SquadronManagementModal';
import CapabilityDetailsModal from './CapabilityDetailsModal';
import VersionControlView from './VersionControlView';
import AdminSubmissionsView from './AdminSubmissionsView';
import FilterSidebar from './FilterSidebar';
import CartDropdown from './CartDropdown';

const MarketplacePage = ({ onLogoClick }) => {
  const _dataStore = useDataStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Navigation store
  const { selectedView, setSelectedView } = useNavigationStore();

  // Filter store
  const {
    searchTerm, setSearchTerm,
    selectedFilters, toggleFilter, clearAllFilters, getFilteredItems,
    selectedSecurityFilters, setSelectedSecurityFilters
  } = useFilterStore();

  // Outfitter store
  const {
    setSelectedHull,
    setSelectedMountPoint,
    setVesselConfiguration,
    selectedCapabilityDetails, setSelectedCapabilityDetails
  } = useOutfitterStore();

  // UI store
  const {
    outfitterCart, addToOutfitterCart, removeFromOutfitterCart, clearCart,
    expandedStack, setExpandedStack,
    showCart, setShowCart,
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
              <div className="text-base md:text-2xl font-bold text-lime-brand tracking-tight leading-none whitespace-nowrap">
                Mission Bay
              </div>
              <p className="hidden md:block text-sm text-gray-400 mt-1">
                Pre-integrated capabilities ready for deployment on TempestOS
              </p>
            </div>
          </div>

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
          {/* Left Sidebar - Filters (desktop only) */}
          {selectedView === 'capabilities' && (
            <div className="hidden md:block">
              <FilterSidebar
                selectedFilters={selectedFilters}
                selectedSecurityFilters={selectedSecurityFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                toggleFilter={toggleFilter}
                setSelectedSecurityFilters={setSelectedSecurityFilters}
                clearAllFilters={clearAllFilters}
                capabilityCategories={capabilityCategories}
              />
            </div>
          )}

          {/* Mobile Filter bottom sheet */}
          {selectedView === 'capabilities' && showMobileFilters && (
            <div className="md:hidden fixed inset-0 z-[800] flex flex-col justify-end bg-black/60" onClick={() => setShowMobileFilters(false)}>
              <div
                className="bg-darkest rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <FilterSidebar
                  selectedFilters={selectedFilters}
                  selectedSecurityFilters={selectedSecurityFilters}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  toggleFilter={toggleFilter}
                  setSelectedSecurityFilters={setSelectedSecurityFilters}
                  clearAllFilters={clearAllFilters}
                  capabilityCategories={capabilityCategories}
                  onClose={() => setShowMobileFilters(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-x-clip">
            {/* Mobile Filter button — capabilities only */}
            {selectedView === 'capabilities' && (
              <div className="md:hidden mb-3">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600/50 bg-darker text-gray-300 text-sm font-semibold hover:border-lime-brand/50 hover:text-lime-brand transition-colors"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {(selectedFilters.length > 0 || selectedSecurityFilters.length > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-lime-brand text-black text-[0.6rem] font-bold">
                      {selectedFilters.length + selectedSecurityFilters.length}
                    </span>
                  )}
                </button>
              </div>
            )}
            {selectedView === 'capabilities' && (
              <CapabilitiesView
                individualCapabilities={individualCapabilities}
                engineeringStacks={engineeringStacks}
                getFilteredItems={getFilteredItems}
                searchTerm={searchTerm}
                selectedFilters={selectedFilters}
                addToCart={addToOutfitterCart}
                outfitterCart={outfitterCart}
                setSelectedCapabilityDetails={setSelectedCapabilityDetails}
                expandedStack={expandedStack}
                setExpandedStack={setExpandedStack}
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
              <div className="hidden md:block" style={{ height: 'calc(100vh - 260px)', overflow: 'hidden' }}>
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
        addToOutfitterCart={addToOutfitterCart}
      />
    </div>
  );
};

export default MarketplacePage;

