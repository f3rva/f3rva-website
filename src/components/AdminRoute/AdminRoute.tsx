import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactElement;
}

/**
 * Route protection wrapper for administrative views.
 * Redirects unauthenticated users to the admin login page while preserving target path.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
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

  return children;
};

export default AdminRoute;
