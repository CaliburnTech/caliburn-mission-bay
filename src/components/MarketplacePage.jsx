import React, { useEffect } from 'react';
import { Ship } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
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
            className="flex items-center gap-8 cursor-pointer group"
            title="Return to Home"
          >
            <img
              src={caliburnLogotype}
              alt="Caliburn"
              className="h-12 w-auto transition-transform group-hover:scale-105"
            />
            <div className="border-l border-gray-600/50 pl-8">
              <h1 className="text-2xl font-bold text-lime-brand tracking-tight leading-none">
                Mission Bay
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Pre-integrated capabilities ready for deployment on TempestOS
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-transparent text-lime-brand border border-lime-brand/50 p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200 hover:bg-lime-brand/10 hover:border-lime-brand"
            >
              <Ship size={20} />
              {outfitterCart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {outfitterCart.length}
                </span>
              )}
            </button>
            <CartDropdown
              isOpen={showCart}
              onClose={() => setShowCart(false)}
              items={outfitterCart}
              onRemoveItem={(name) => removeFromOutfitterCart(name)}
              onClearCart={clearCart}
              onNavigateToOutfitter={() => setSelectedView('shipyard')}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Bar */}
        <div className="mb-10 py-6 bg-transparent border-b border-gray-700/60">
          {/* Navigation Tabs and Search in flex container */}
          <div className="flex justify-between items-center gap-4 flex-wrap">
            {/* Navigation Tabs - Squadrons first */}
            <div className="flex gap-2 items-center flex-wrap">
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

            {/* Global Search */}
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

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Left Sidebar - Filters (for capabilities view) */}
          {selectedView === 'capabilities' && (
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
          )}

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 overflow-x-clip">
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
              <div style={{ height: 'calc(100vh - 260px)', overflow: 'hidden' }}>
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

