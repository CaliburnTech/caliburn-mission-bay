import { Shield, Lock, Unlink, Network, Eye, ShoppingCart } from 'lucide-react';

const CapabilitiesView = ({ 
  individualCapabilities, 
  getFilteredItems, 
  searchTerm, 
  selectedFilters, 
  addToCart, 
  outfitterCart, 
  setSelectedCapabilityDetails 
}) => {
  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
        {getFilteredItems(individualCapabilities).length} of {individualCapabilities.length} individual capabilities
        {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {getFilteredItems(individualCapabilities).map((capability, idx) => {
          const IconComponent = capability.icon;
          const isInCart = outfitterCart.some(item => item.name === capability.name);
          return (
            <div key={idx} style={{ 
              backgroundColor: '#1a2530',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cbfd00';
              e.currentTarget.style.backgroundColor = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.backgroundColor = '#1a2530';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: 'rgba(203, 253, 0, 0.1)', 
                  borderRadius: '0.5rem',
                  flexShrink: 0
                }}
                >
                  <IconComponent size={24} color="#cbfd00" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem',
                    fontSize: '1.125rem'
                  }}
                  >
                    {capability.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'rgba(203, 253, 0, 0.2)',
                      border: '1px solid #cbfd00',
                      borderRadius: '9999px',
                      color: '#cbfd00',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                    >
                      {capability.category}
                    </div>
                    
                    {capability.securityLevel && capability.securityLevel.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {capability.securityLevel.includes('NSA-Approved Crypto') && (
                          <div style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                            padding: '0.25rem', 
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                          }} title="NSA-Approved Cryptography"
                          >
                            <Shield size={12} style={{ color: '#ef4444' }} />
                          </div>
                        )}
                        {capability.securityLevel.includes('Zero Trust Architecture') && (
                          <div style={{ 
                            backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                            padding: '0.25rem', 
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                          }} title="Zero Trust Architecture"
                          >
                            <Lock size={12} style={{ color: '#10b981' }} />
                          </div>
                        )}
                        {capability.securityLevel.includes('DDIL Capable') && (
                          <div style={{ 
                            backgroundColor: 'rgba(251, 191, 36, 0.2)', 
                            padding: '0.25rem', 
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                          }} title="DDIL (Disconnected/Degraded/Intermittent/Limited) Capable"
                          >
                            <Unlink size={12} style={{ color: '#fbbf24' }} />
                          </div>
                        )}
                        {(capability.securityLevel.includes('End-to-End Encrypted') || capability.securityLevel.includes('Mesh Network')) && (
                          <div style={{ 
                            backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                            padding: '0.25rem', 
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                          }} title="Encrypted Mesh Network"
                          >
                            <Network size={12} style={{ color: '#3b82f6' }} />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <span style={{ 
                      backgroundColor: capability.trl === 'TRL 9' ? 'rgba(34, 197, 94, 0.2)' : 
                                      capability.trl === 'TRL 7' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: capability.trl === 'TRL 9' ? '#4ade80' : 
                             capability.trl === 'TRL 7' ? '#fbbf24' : '#60a5fa',
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600' 
                    }}
                    >
                      {capability.trl}
                    </span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {capability.provider}
                  </p>
                </div>
              </div>
              
              <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                {capability.description}
              </p>

              {capability.specs && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#cbfd00', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Specifications
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(capability.specs).map(([key, value]) => (
                      <div key={key} style={{ 
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'rgba(75, 85, 99, 0.3)',
                        borderRadius: '0.375rem',
                        border: '1px solid #4b5563'
                      }}
                      >
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                        <div style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '500' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                <button
                  onClick={() => setSelectedCapabilityDetails(capability)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#cbfd00',
                    border: '1px solid #cbfd00',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    flex: 1,
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#cbfd00';
                    e.target.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#cbfd00';
                  }}
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  onClick={() => addToCart(capability)}
                  disabled={isInCart}
                  style={{
                    backgroundColor: isInCart ? '#374151' : '#cbfd00',
                    color: isInCart ? '#9ca3af' : '#000',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isInCart ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    flex: 1,
                    minHeight: '44px'
                  }}
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