import { Search } from 'lucide-react';

const NavigationTabs = ({ 
  selectedView, 
  setSelectedView, 
  setSelectedHull, 
  setSelectedMountPoint, 
  setVesselConfiguration,
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '2.5rem',
      padding: '1.5rem 0',
      backgroundColor: 'transparent',
      borderBottom: '1px solid rgba(55, 65, 81, 0.6)'
    }}
    >
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={() => setSelectedView('stacks')}
          style={{
            backgroundColor: selectedView === 'stacks' ? '#cbfd00' : 'transparent',
            color: selectedView === 'stacks' ? '#000' : '#e5e7eb',
            border: selectedView === 'stacks' ? 'none' : '1px solid rgba(75, 85, 99, 0.4)',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedView !== 'stacks') {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedView !== 'stacks') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Engineering Stacks
        </button>
        <button
          onClick={() => setSelectedView('capabilities')}
          style={{
            backgroundColor: selectedView === 'capabilities' ? '#cbfd00' : 'transparent',
            color: selectedView === 'capabilities' ? '#000' : '#e5e7eb',
            border: selectedView === 'capabilities' ? 'none' : '1px solid rgba(75, 85, 99, 0.4)',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedView !== 'capabilities') {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedView !== 'capabilities') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Individual Capabilities
        </button>
        <button 
          onClick={() => {
            setSelectedView('outfitter');
            setSelectedHull(null);
            setSelectedMountPoint(null);
            setVesselConfiguration({});
          }}
          style={{
            backgroundColor: selectedView === 'outfitter' ? '#cbfd00' : 'transparent',
            color: selectedView === 'outfitter' ? '#000' : '#e5e7eb',
            border: selectedView === 'outfitter' ? 'none' : '1px solid rgba(75, 85, 99, 0.4)',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedView !== 'outfitter') {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedView !== 'outfitter') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          Loadout Your RAS
        </button>
        <button 
          onClick={() => setSelectedView('shipyard')}
          style={{
            backgroundColor: selectedView === 'shipyard' ? '#cbfd00' : 'transparent',
            color: selectedView === 'shipyard' ? '#000' : '#e5e7eb',
            border: selectedView === 'shipyard' ? 'none' : '1px solid rgba(75, 85, 99, 0.4)',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedView !== 'shipyard') {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedView !== 'shipyard') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          My Shipyard
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search style={{ 
          position: 'absolute', 
          left: '1rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: '#6b7280',
          zIndex: 1
        }} size={18}
        />
        <input
          type="text"
          placeholder="Search capabilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '420px',
            padding: '0.875rem 1.25rem 0.875rem 3rem',
            backgroundColor: '#1f2937',
            border: '1px solid rgba(75, 85, 99, 0.4)',
            borderRadius: '0.5rem',
            color: '#f9fafb',
            fontSize: '0.9rem',
            outline: 'none',
            fontWeight: '400'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#cbfd00';
            e.target.style.backgroundColor = '#111827';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#374151';
            e.target.style.backgroundColor = '#1f2937';
          }}
        />
      </div>
    </div>
  );
};

export default NavigationTabs;