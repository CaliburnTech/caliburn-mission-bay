import { Eye, ShoppingCart } from 'lucide-react';
import { SecurityBadge, TRLBadge } from './shared';

const CapabilitiesView = ({
  individualCapabilities,
  getFilteredItems,
  searchTerm,
  selectedFilters,
  addToCart,
  outfitterCart,
  setSelectedCapabilityDetails
}) => {
  const filteredItems = getFilteredItems(individualCapabilities);

  return (
    <div>
      <div className="section-subtitle">
        {filteredItems.length} of {individualCapabilities.length} individual capabilities
        {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
      </div>
      <div className="card-grid">
        {filteredItems.map((capability, idx) => {
          const IconComponent = capability.icon;
          const isInCart = outfitterCart.some(item => item.name === capability.name);

          return (
            <div
              key={idx}
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
    </div>
  );
};

export default CapabilitiesView;
