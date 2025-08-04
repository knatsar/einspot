import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  // Removed debug logs for production

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin access for /admin routes
  if (requireAdmin || location.pathname.startsWith('/admin')) {
    if (userRole !== 'superadmin' && userRole !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Don't show access denied, just redirect non-admins
  if (location.pathname.startsWith('/admin') && userRole !== 'superadmin' && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;