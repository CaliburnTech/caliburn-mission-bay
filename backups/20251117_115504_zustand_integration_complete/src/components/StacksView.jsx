import { Shield, Lock, Unlink, Network } from 'lucide-react';

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
  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
        {getFilteredItems(engineeringStacks).length} of {engineeringStacks.length} pre-configured capability packages
        {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {getFilteredItems(engineeringStacks).map((stack, idx) => {
          const IconComponent = stack.icon;
          const isExpanded = expandedStack === idx;
          return (
            <div key={idx} style={{ 
              backgroundColor: '#1a2530', 
              borderRadius: '0.75rem', 
              padding: '2rem', 
              border: '1px solid rgba(203, 253, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgba(203, 253, 0, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <IconComponent size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#cbfd00', marginBottom: '0.5rem' }}>
                      {stack.name}
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{stack.provider}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Security Indicators */}
                  {stack.securityLevel && stack.securityLevel.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      {stack.securityLevel.includes('NSA-Approved Crypto') && (
                        <div style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                          padding: '0.25rem', 
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }} title="NSA-Approved Cryptography"
                        >
                          <Shield size={14} style={{ color: '#ef4444' }} />
                        </div>
                      )}
                      {stack.securityLevel.includes('Zero Trust Architecture') && (
                        <div style={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                          padding: '0.25rem', 
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }} title="Zero Trust Architecture"
                        >
                          <Lock size={14} style={{ color: '#10b981' }} />
                        </div>
                      )}
                      {stack.securityLevel.includes('DDIL Capable') && (
                        <div style={{ 
                          backgroundColor: 'rgba(251, 191, 36, 0.2)', 
                          padding: '0.25rem', 
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }} title="DDIL (Disconnected/Degraded/Intermittent/Limited) Capable"
                        >
                          <Unlink size={14} style={{ color: '#fbbf24' }} />
                        </div>
                      )}
                      {(stack.securityLevel.includes('End-to-End Encrypted') || stack.securityLevel.includes('Mesh Network')) && (
                        <div style={{ 
                          backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                          padding: '0.25rem', 
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }} title="Encrypted Mesh Network"
                        >
                          <Network size={14} style={{ color: '#3b82f6' }} />
                        </div>
                      )}
                    </div>
                  )}
                  <span style={{ 
                    backgroundColor: stack.trl === 'TRL 9' ? 'rgba(34, 197, 94, 0.2)' : 
                                    stack.trl === 'TRL 7' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: stack.trl === 'TRL 9' ? '#4ade80' : 
                           stack.trl === 'TRL 7' ? '#fbbf24' : '#60a5fa',
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontWeight: '600' 
                  }}
                  >
                    {stack.trl}
                  </span>
                </div>
              </div>

              <p style={{ color: '#e5e7eb', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {stack.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {stack.capabilities && stack.capabilities.slice(0, isExpanded ? stack.capabilities.length : 6).map((capability, capIdx) => (
                  <span key={capIdx} style={{ 
                    backgroundColor: 'rgba(203, 253, 0, 0.1)', 
                    color: '#cbfd00', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem' 
                  }}
                  >
                    {capability}
                  </span>
                ))}
                {stack.capabilities && stack.capabilities.length > 6 && !isExpanded && (
                  <button
                    onClick={() => setExpandedStack(idx)}
                    style={{
                      backgroundColor: 'rgba(156, 163, 175, 0.1)',
                      color: '#9ca3af',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    +{stack.capabilities.length - 6} more
                  </button>
                )}
                {isExpanded && stack.capabilities && stack.capabilities.length > 6 && (
                  <button
                    onClick={() => setExpandedStack(null)}
                    style={{
                      backgroundColor: 'rgba(156, 163, 175, 0.1)',
                      color: '#9ca3af',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Show less
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#cbfd00' }}>
                    {stack.pricing}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    {stack.pricingPeriod}
                  </div>
                </div>
                <button
                  onClick={() => addToCart({ ...stack, type: 'stack' })}
                  disabled={outfitterCart.some(item => item.name === stack.name)}
                  style={{
                    backgroundColor: outfitterCart.some(item => item.name === stack.name) ? '#374151' : '#cbfd00',
                    color: outfitterCart.some(item => item.name === stack.name) ? '#9ca3af' : '#000',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: '600',
                    cursor: outfitterCart.some(item => item.name === stack.name) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!outfitterCart.some(item => item.name === stack.name)) {
                      e.target.style.backgroundColor = '#b8e600';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!outfitterCart.some(item => item.name === stack.name)) {
                      e.target.style.backgroundColor = '#cbfd00';
                    }
                  }}
                >
                  {outfitterCart.some(item => item.name === stack.name) ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StacksView;