import { useState } from 'react';
import { Eye, ShoppingCart, ChevronDown, ChevronUp, Package, Layers } from 'lucide-react';
import { SecurityBadge, TRLBadge } from './shared';

const CapabilitiesView = ({
  individualCapabilities,
  engineeringStacks = [],
  getFilteredItems,
  searchTerm,
  selectedFilters,
  addToCart,
  outfitterCart,
  setSelectedCapabilityDetails,
  expandedStack,
  setExpandedStack
}) => {
  const [viewMode, setViewMode] = useState('items'); // 'items' or 'stacks'

  const filteredCapabilities = getFilteredItems(individualCapabilities);
  const filteredStacks = getFilteredItems(engineeringStacks);

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="toggle-group mb-4">
        <button
          onClick={() => setViewMode('items')}
          className={`toggle-btn ${viewMode === 'items' ? 'toggle-btn-active' : ''}`}
        >
          <Package size={16} />
          All Items
        </button>
        <button
          onClick={() => setViewMode('stacks')}
          className={`toggle-btn ${viewMode === 'stacks' ? 'toggle-btn-active' : ''}`}
        >
          <Layers size={16} />
          Saved Stacks
          {engineeringStacks.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${viewMode === 'stacks' ? 'bg-black/20' : 'bg-lime-brand/20 text-lime-brand'}`}>
              {engineeringStacks.length}
            </span>
          )}
        </button>
      </div>

      {/* Individual Capabilities View */}
      {viewMode === 'items' && (
        <>
          <div className="section-subtitle">
            {filteredCapabilities.length} of {individualCapabilities.length} individual capabilities
            {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
          </div>
          <div className="card-grid">
            {filteredCapabilities.map((capability) => {
              const IconComponent = capability.icon;
              const isInCart = outfitterCart.some(item => item.name === capability.name);

              return (
                <div
                  key={capability.name}
                  className="card card-interactive"
                >
                  <div className="flex items-start gap-md mb-md">
                    <div className="p-3 bg-lime-brand/10 rounded-lg flex-shrink-0">
                      <IconComponent size={24} className="text-primary-brand" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-sm text-lg">
                        {capability.name}
                      </h3>
                      <div className="flex gap-sm mb-sm flex-wrap items-center">
                        <div className="badge-category">
                          {capability.category}
                        </div>

                        {capability.securityLevel && capability.securityLevel.length > 0 && (
                          <div className="flex gap-xs items-center">
                            {capability.securityLevel.includes('NSA-Approved Crypto') && <SecurityBadge type="NSA-Approved Crypto" />}
                            {capability.securityLevel.includes('Zero Trust Architecture') && <SecurityBadge type="Zero Trust Architecture" />}
                            {capability.securityLevel.includes('DDIL Capable') && <SecurityBadge type="DDIL Capable" />}
                            {(capability.securityLevel.includes('End-to-End Encrypted') || capability.securityLevel.includes('Mesh Network')) && <SecurityBadge type="End-to-End Encrypted" />}
                          </div>
                        )}

                        <TRLBadge trl={capability.trl} />
                      </div>
                      <p className="text-secondary text-sm mb-md">
                        {capability.provider}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-lg">
                    {capability.description}
                  </p>

                  {capability.specs && (
                    <div className="mb-lg">
                      <h4 className="text-primary-brand font-bold mb-sm text-base">
                        Specifications
                      </h4>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-sm">
                        {Object.entries(capability.specs).map(([key, value]) => (
                          <div key={key} className="card-inner">
                            <div className="text-muted text-xs mb-xs">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                            <div className="text-white text-sm font-medium">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-sm items-stretch">
                    <button
                      onClick={() => setSelectedCapabilityDetails(capability)}
                      className="btn-secondary flex-1"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <button
                      onClick={() => addToCart(capability)}
                      disabled={isInCart}
                      className={`flex-1 ${
                        isInCart
                          ? 'btn-ghost'
                          : 'btn-primary'
                      }`}
                    >
                      <ShoppingCart size={16} />
                      {isInCart ? 'Added to Hull' : 'Add to Hull'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Saved Stacks View */}
      {viewMode === 'stacks' && (
        <>
          <div className="section-subtitle">
            {filteredStacks.length} of {engineeringStacks.length} saved capability packages
            {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
          </div>

          {filteredStacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 bg-darker rounded-xl border border-gray-700/50">
              <Layers size={48} className="text-gray-600 mb-4" />
              <h3 className="text-gray-300 text-lg font-semibold mb-2">No Saved Stacks</h3>
              <p className="text-gray-500 text-sm text-center max-w-md mb-4">
                Stacks are pre-configured capability bundles. Create them by saving a configuration from the Fleet tab, or they can be auto-generated from mission templates.
              </p>
              <button
                onClick={() => setViewMode('items')}
                className="text-lime-brand hover:underline text-sm"
              >
                Browse individual capabilities instead
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {filteredStacks.map((stack) => {
                const IconComponent = stack.icon;
                const isExpanded = expandedStack === stack.name;
                const isInCart = outfitterCart.some(item => item.name === stack.name);

                return (
                  <div
                    key={stack.name}
                    className="card-accent relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-md">
                      <div className="flex items-center gap-md">
                        <div className="bg-lime-brand/20 p-3 rounded-lg">
                          <IconComponent size={32} />
                        </div>
                        <div>
                          <h3 className="section-title mb-sm">
                            {stack.name}
                          </h3>
                          <p className="text-secondary text-sm">{stack.provider}</p>
                        </div>
                      </div>
                      <TRLBadge trl={stack.trl} />
                    </div>

                    <p className="text-gray-200 mb-md leading-relaxed">
                      {stack.description}
                    </p>

                    <div className="flex gap-lg items-start flex-wrap mb-md">
                      <div className="flex-1">
                        {/* Components List */}
                        {stack.components && (
                          <div className="mb-md">
                            <div className="text-primary-brand text-sm font-semibold mb-sm">
                              Components:
                            </div>
                            <ul className="list-none p-0 m-0">
                              {stack.components.map((component, compIdx) => (
                                <li key={compIdx} className="text-gray-300 text-sm mb-1">
                                  <span className="text-primary-brand mr-2">•</span>
                                  {component}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mission Tags */}
                        {stack.missionTags && (
                          <div className="flex gap-sm flex-wrap">
                            {stack.missionTags.map(tag => (
                              <span
                                key={tag}
                                className="bg-blue-500/80 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-sm">
                        <button
                          onClick={() => setExpandedStack(isExpanded ? null : stack.name)}
                          className="btn-secondary flex items-center gap-sm"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          onClick={() => addToCart({ ...stack, type: 'stack' })}
                          disabled={isInCart}
                          className={`btn-primary ${
                            isInCart
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <ShoppingCart size={16} />
                          {isInCart ? 'Added' : 'Add All'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && stack.specs && (
                      <div className="border-t border-gray-700/50 pt-md mt-md">
                        <h4 className="text-primary-brand font-bold mb-sm">
                          Stack Specifications
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-sm">
                          {Object.entries(stack.specs).map(([key, value]) => (
                            <div key={key} className="card-inner">
                              <div className="text-muted text-xs mb-xs">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </div>
                              <div className="text-white text-sm font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CapabilitiesView;
