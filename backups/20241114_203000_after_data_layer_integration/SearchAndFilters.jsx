import { X } from 'lucide-react';

const SearchAndFilters = ({ 
  selectedView,
  selectedFilters,
  selectedSecurityFilters,
  searchTerm,
  setSearchTerm,
  toggleFilter,
  setSelectedSecurityFilters,
  clearAllFilters,
  capabilityCategories
}) => {
  if (selectedView !== 'stacks' && selectedView !== 'capabilities') {
    return null;
  }

  return (
    <div style={{ width: '300px', flexShrink: 0 }}>
      {/* Active Filters Summary */}
      {(selectedFilters.length > 0 || searchTerm.length >= 2) && (
        <div style={{ 
          backgroundColor: '#1a2530', 
          borderRadius: '0.5rem', 
          padding: '1rem', 
          border: '1px solid rgba(203, 253, 0, 0.2)',
          marginBottom: '1rem'
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', color: '#cbfd00' }}>Active Filters</span>
            <button
              onClick={clearAllFilters}
              style={{
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '0.25rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
          {searchTerm.length >= 2 && (
            <div style={{ 
              backgroundColor: 'rgba(203, 253, 0, 0.2)', 
              color: '#cbfd00', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem', 
              fontSize: '0.75rem',
              marginBottom: '0.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            >
              Search: &ldquo;{searchTerm}&rdquo;
              <button 
                onClick={() => setSearchTerm('')}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  color: '#cbfd00', 
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          {selectedFilters.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {selectedFilters.length} capability filter{selectedFilters.length > 1 ? 's' : ''} applied
            </div>
          )}
        </div>
      )}

      {/* Filter Categories */}
      <div style={{ 
        backgroundColor: '#1a2530', 
        borderRadius: '0.375rem', 
        padding: '0.75rem', 
        border: '1px solid rgba(203, 253, 0, 0.2)',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}
      >
        <h3 style={{ color: '#cbfd00', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Capability Categories
        </h3>
        
        {Object.entries(capabilityCategories).map(([categoryName, category]) => {
          const Icon = category.icon;
          
          return (
            <div key={categoryName} style={{ marginBottom: '0.25rem', marginTop: categoryName === 'Sensors & Detection' ? '0' : '0.75rem' }}>
              {/* Category Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.125rem',
                color: '#cbfd00',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              >
                <Icon size={16} style={{ color: '#cbfd00' }} />
                {categoryName}
              </div>
              
              {/* Subcategories */}
              <div style={{ marginLeft: '0', display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                {category.subcategories.map(subcategory => (
                  <label
                    key={subcategory}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.6875rem',
                      color: selectedFilters.includes(subcategory) ? '#cbfd00' : '#9ca3af',
                      padding: '0.0625rem 0',
                      paddingLeft: '1.25rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(subcategory)}
                      onChange={() => toggleFilter(subcategory)}
                      style={{ 
                        borderRadius: '0.125rem',
                        transform: 'scale(0.8)',
                        accentColor: '#cbfd00'
                      }}
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
      <div style={{ 
        backgroundColor: '#1a2530', 
        borderRadius: '0.375rem', 
        padding: '0.75rem', 
        border: '1px solid rgba(203, 253, 0, 0.2)',
        marginTop: '0.75rem'
      }}
      >
        <h3 style={{ color: '#cbfd00', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Security Level
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
          {['NSA-Approved Crypto', 'Zero Trust Architecture', 'DDIL Capable', 'End-to-End Encrypted'].map(securityLevel => (
            <label
              key={securityLevel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                color: selectedSecurityFilters.includes(securityLevel) ? '#cbfd00' : '#9ca3af',
                padding: '0.0625rem 0',
                transition: 'color 0.15s ease-in-out'
              }}
              onMouseEnter={(e) => e.target.style.color = '#cbfd00'}
              onMouseLeave={(e) => e.target.style.color = selectedSecurityFilters.includes(securityLevel) ? '#cbfd00' : '#9ca3af'}
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
                style={{
                  appearance: 'none',
                  width: '12px',
                  height: '12px',
                  border: '1px solid #cbfd00',
                  borderRadius: '2px',
                  backgroundColor: selectedSecurityFilters.includes(securityLevel) ? '#cbfd00' : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  accentColor: '#cbfd00'
                }}
              />
              <span>{securityLevel}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;