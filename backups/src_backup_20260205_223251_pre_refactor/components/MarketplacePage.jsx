import React, { useEffect } from 'react';
import { Ship } from 'lucide-react';
import { engineeringStacks, individualCapabilities, capabilityCategories } from '../data/marketplaceData';
import useNavigationStore from '../store/navigationStore';
import useFilterStore from '../store/filterStore';
import useOutfitterStore from '../store/outfitterStore';
import useUIStore from '../store/uiStore';
import useSquadronStore from '../store/squadronStore';
import caliburnLogotype from '../assets/Caliburn Logotype Dark Mode.png';
import ShipyardView from './ShipyardView';
import MissionPlanner from './MissionPlanner';
import GlobalSearch from './GlobalSearch';
import StacksView from './StacksView';
import CapabilitiesView from './CapabilitiesView';
import OutfitterView from './OutfitterView';
import LoadoutBuilder from './LoadoutBuilder';
import DeploymentModal from './DeploymentModal';
import SquadronManagementModal from './SquadronManagementModal';
import CapabilityDetailsModal from './CapabilityDetailsModal';
import FilterSidebar from './FilterSidebar';
import CartDropdown from './CartDropdown';

const MarketplacePage = () => {
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

  // Handle browser back/forward navigation
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
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <header className="bg-darker border-b border-lime-brand/20 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div
            onClick={() => {
              setSelectedView('stacks');
              setSelectedHull(null);
              setSelectedMountPoint(null);
              setSearchTerm('');
            }}
            className="flex items-center gap-6 cursor-pointer"
          >
            <img src={caliburnLogotype} alt="Caliburn" className="h-10 w-auto" />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-lime-brand mb-2 tracking-tight">
                Mission Bay
              </h1>
              <p className="text-base text-gray-400 m-0 font-normal">
                Pre-integrated capabilities ready for deployment on TempestOS
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-transparent text-lime-brand border border-lime-brand p-3 rounded-lg cursor-pointer flex items-center transition-all duration-200 hover:bg-lime-brand/10"
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
            {/* Navigation Tabs */}
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => setSelectedView('stacks')}
                className={`${selectedView === 'stacks' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Engineering Stacks
              </button>
              <button
                onClick={() => setSelectedView('capabilities')}
                className={`${selectedView === 'capabilities' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Individual Capabilities
              </button>
              <button
                onClick={() => {
                  setSelectedView('shipyard');
                  setSelectedHull(null);
                }}
                className={`${(selectedView === 'shipyard' || selectedView === 'outfitter') ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                My Squadrons
              </button>
              <button
                onClick={() => setSelectedView('squadron')}
                className={`${selectedView === 'squadron' ? 'bg-lime-brand text-black' : 'bg-transparent text-gray-200 border border-gray-600/40'} py-3 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap`}
              >
                Mission Planner
              </button>
            </div>

            {/* Global Search */}
            <GlobalSearch
              onNavigate={(view, data) => {
                setSelectedView(view);
                // Handle navigation to specific items
                if (view === 'capabilities' && data) {
                  setSelectedCapabilityDetails(data);
                } else if (view === 'stacks' && data) {
                  setExpandedStack(data.name);
                } else if (view === 'outfitter' && data) {
                  setSelectedHull(data);
                }
              }}
            />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Left Sidebar - Filters (for stacks and capabilities views) */}
          {(selectedView === 'stacks' || selectedView === 'capabilities') && (
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
          <div className="flex-1 min-w-0 overflow-hidden">
            {selectedView === 'stacks' && (
              <StacksView
                engineeringStacks={engineeringStacks}
                getFilteredItems={getFilteredItems}
                searchTerm={searchTerm}
                selectedFilters={selectedFilters}
                expandedStack={expandedStack}
                setExpandedStack={setExpandedStack}
                addToCart={addToOutfitterCart}
                outfitterCart={outfitterCart}
              />
            )}


            {selectedView === 'capabilities' && (
              <CapabilitiesView
                individualCapabilities={individualCapabilities}
                getFilteredItems={getFilteredItems}
                searchTerm={searchTerm}
                selectedFilters={selectedFilters}
                addToCart={addToOutfitterCart}
                outfitterCart={outfitterCart}
                setSelectedCapabilityDetails={setSelectedCapabilityDetails}
              />
            )}


            {selectedView === 'outfitter' && (
              <LoadoutBuilder onBackToShipyard={() => setSelectedView('shipyard')} />
            )}

            {selectedView === 'shipyard' && (
              <ShipyardView
                openSquadronManagement={openSquadronManagement}
                showSquadrons={showSquadrons}
                setShowSquadrons={setShowSquadrons}
                onSelectHull={(hull) => {
                  setSelectedView('outfitter');
                  setSelectedHull(hull);
                  setSelectedMountPoint(null);
                  setVesselConfiguration({});
                }}
              />
            )}
            
            {/* Mission Planner */}
            {selectedView === 'squadron' && (
              <MissionPlanner />
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

