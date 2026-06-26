import { X } from 'lucide-react';

const FilterSidebar = ({
  selectedFilters,
  selectedSecurityFilters,
  searchTerm,
  setSearchTerm,
  toggleFilter,
  setSelectedSecurityFilters,
  clearAllFilters,
  capabilityCategories,
  onClose
}) => {
  return (
    <div className="w-[300px] flex-shrink-0">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300 font-semibold text-sm uppercase tracking-wide">Filters</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700/60 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {/* Active Filters Summary */}
      {(selectedFilters.length > 0 || searchTerm.length >= 2) && (
        <div className="bg-darker rounded-lg p-4 border border-lime-brand/20 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lime-brand">Active Filters</span>
            <button
              onClick={clearAllFilters}
              className="bg-transparent text-red-500 border border-red-500 rounded py-1 px-2 text-xs cursor-pointer"
            >
              Clear All
            </button>
          </div>
          {searchTerm.length >= 2 && (
            <div className="bg-lime-brand/20 text-lime-brand py-1 px-2 rounded text-xs mb-1 flex justify-between items-center">
              Search: &ldquo;{searchTerm}&rdquo;
              <button
                onClick={() => setSearchTerm('')}
                className="bg-transparent border-0 text-lime-brand cursor-pointer p-0"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {selectedFilters.length > 0 && (
            <div className="text-xs text-gray-400">
              {selectedFilters.length} capability filter{selectedFilters.length > 1 ? 's' : ''} applied
            </div>
          )}
        </div>
      )}

      {/* Filter Categories */}
      <div className="bg-darker rounded-md p-3 border border-lime-brand/20 max-h-[70vh] overflow-y-auto">
        <h3 className="text-lime-brand mb-3 text-sm font-semibold uppercase tracking-wide">
          Capability Categories
        </h3>

        {Object.entries(capabilityCategories).map(([categoryName, category]) => {
          const Icon = category.icon;

          return (
            <div key={categoryName} className={`mb-1 ${categoryName === 'Sensors & Detection' ? 'mt-0' : 'mt-3'}`}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-0.5 text-lime-brand text-sm font-semibold">
                <Icon size={16} className="text-lime-brand" />
                {categoryName}
              </div>

              {/* Subcategories */}
              <div className="ml-0 flex flex-col gap-0.5">
                {category.subcategories.map(subcategory => (
                  <label
                    key={subcategory}
                    className={`flex items-center gap-2 cursor-pointer text-[0.6875rem] ${selectedFilters.includes(subcategory) ? 'text-lime-brand' : 'text-gray-400'} py-0.5 pl-5`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(subcategory)}
                      onChange={() => toggleFilter(subcategory)}
                      className="rounded-sm scale-75 accent-lime-brand"
                    />
                    <span>{subcategory}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Level Filters */}
      <div className="bg-darker rounded-md p-3 border border-lime-brand/20 mt-3">
        <h3 className="text-lime-brand mb-3 text-sm font-semibold uppercase tracking-wide">
          Security Level
        </h3>

        <div className="flex flex-col gap-0.5">
          {['NSA-Approved Crypto', 'Zero Trust Architecture', 'DDIL Capable', 'End-to-End Encrypted'].map(securityLevel => (
            <label
              key={securityLevel}
              className={`flex items-center gap-2 cursor-pointer text-[0.6875rem] py-0.5 transition-colors duration-150 hover:text-lime-brand ${selectedSecurityFilters.includes(securityLevel) ? 'text-lime-brand' : 'text-gray-400'}`}
            >
              <input
                type="checkbox"
                checked={selectedSecurityFilters.includes(securityLevel)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSecurityFilters([...selectedSecurityFilters, securityLevel]);
                  } else {
                    setSelectedSecurityFilters(selectedSecurityFilters.filter(f => f !== securityLevel));
                  }
                }}
                className={`appearance-none w-3 h-3 border border-lime-brand rounded-sm ${selectedSecurityFilters.includes(securityLevel) ? 'bg-lime-brand' : 'bg-transparent'} cursor-pointer relative flex-shrink-0 accent-lime-brand`}
              />
              <span>{securityLevel}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
