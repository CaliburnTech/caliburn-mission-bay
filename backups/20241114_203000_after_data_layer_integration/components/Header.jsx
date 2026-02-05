import { Ship } from 'lucide-react';
import caliburnLogotype from '../assets/Caliburn Logotype Dark Mode.png';

const Header = ({ 
  onLogoClick, 
  outfitterCart, 
  showCart, 
  onCartToggle 
}) => {
  return (
    <header style={{ 
      backgroundColor: '#1a2530', 
      borderBottom: '1px solid rgba(203, 253, 0, 0.2)', 
      padding: '1.5rem 0' 
    }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          onClick={onLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}
        >
          <img src={caliburnLogotype} alt="Caliburn" style={{ height: '40px', width: 'auto' }} />
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#cbfd00', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
              Mission Bay
            </h1>
            <p style={{ fontSize: '1rem', color: '#9ca3af', margin: 0, fontWeight: '400' }}>
              Pre-integrated capabilities ready for deployment on TempestOS
            </p>
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={onCartToggle}
            style={{ 
              backgroundColor: 'transparent', 
              color: '#cbfd00', 
              border: '1px solid #cbfd00', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(203, 253, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Ship size={20} />
            {outfitterCart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '-0.5rem',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '1.25rem',
                height: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
              >
                {outfitterCart.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;