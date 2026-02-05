import { ChevronDown, ChevronUp } from 'lucide-react';
import { TRLBadge } from './shared';

const StacksView = ({
  engineeringStacks,
  getFilteredItems,
  searchTerm,
  selectedFilters,
  expandedStack,
  setExpandedStack,
  addToCart,
  outfitterCart
}) => {
  const filteredItems = getFilteredItems(engineeringStacks);

  return (
    <div>
      <div className="section-subtitle">
        {filteredItems.length} of {engineeringStacks.length} pre-configured capability packages
        {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
      </div>
      <div className="flex flex-col gap-lg">
        {filteredItems.map((stack, idx) => {
          const IconComponent = stack.icon;
          const isExpanded = expandedStack === idx;
          const isInCart = outfitterCart.some(item => item.name === stack.name);

          return (
            <div
              key={idx}
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
                    onClick={() => setExpandedStack(isExpanded ? null : idx)}
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
                    {isInCart ? 'Added to Platforms' : 'Add to My Platforms'}
                  </button>
                </div>
              </div>

              {/* Expanded Details Section */}
              {isExpanded && stack.specs && (
                <div className="mt-lg p-lg bg-darkest rounded-lg border border-lime-brand/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    {/* Technical Specifications */}
                    <div>
                      <h4 className="text-primary-brand font-bold mb-md text-lg">
                        Technical Specifications
                      </h4>
                      <div className="flex flex-col gap-sm">
                        {Object.entries(stack.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-sm border-b border-lime-brand/10">
                            <span className="text-secondary text-sm capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="text-gray-300 text-sm font-medium">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integration Details */}
                    <div>
                      <h4 className="text-primary-brand font-bold mb-md text-lg">
                        System Integration
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed mb-md">
                        {stack.integration}
                      </p>
                      {stack.components && (
                        <div>
                          <h5 className="text-secondary font-semibold mb-sm text-sm">
                            Key Components:
                          </h5>
                          <div className="flex flex-col gap-1">
                            {stack.components.map((component, compIdx) => (
                              <div
                                key={compIdx}
                                className="text-blue-400 text-xs px-2 py-1 bg-blue-500/10 rounded"
                              >
                                • {component}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StacksView;
