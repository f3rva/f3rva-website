import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactElement;
  requireAdminOnly?: boolean;
}

/**
 * Route protection wrapper for administrative views.
 * Redirects unauthenticated users to the admin login page and verifies moderator/administrator role.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children, requireAdminOnly = false }) => {
  const { isAuthenticated, isAdmin, isModerator, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <LoadingSpinner message="Verifying admin credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/bigdata/admin/login" state={{ from: location }} replace />;
  }

  const canModerate = Boolean(
    isAdmin || isModerator || user?.role === 'moderator' || user?.roles?.includes('moderator')
  );
  const hasAccess = requireAdminOnly ? isAdmin : canModerate;

  if (!hasAccess) {
    return (
      <div
        style={{
          maxWidth: '560px',
          margin: '4rem auto',
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f8fafc',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>Administrator Access Required</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.75rem', lineHeight: '1.6' }}>
          You are currently signed in as <strong>{user?.f3Name || 'a member'}</strong>, which does not have the{' '}
          <code>admin</code> role assigned. Ask a regional administrator to grant your PAX account administrator access.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/bigdata"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#334155',
              color: '#f8fafc',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Back to Big Data
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
