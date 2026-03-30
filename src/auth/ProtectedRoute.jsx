/**
 * Protected Route
 *
 * Gates content behind authentication in production mode.
 * In demo mode, always renders children (no gate).
 */

import { useAuth } from './useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, mode, role } = useAuth();

  // Demo mode — always accessible
  if (mode === 'demo') return children;

  // Loading
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f1419' }}>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f1419' }}>
        <h2 style={{ color: '#e5e7eb', fontSize: '24px', marginBottom: '8px' }}>Sign In Required</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Please sign in to access Mission Bay.</p>
      </div>
    );
  }

  // Role check
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f1419' }}>
        <h2 style={{ color: '#e5e7eb', fontSize: '24px', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
