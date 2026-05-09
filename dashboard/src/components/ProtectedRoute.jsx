import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RouteFallback() {
  return (
    <div className="screen-center">
      <div className="loading-spinner" />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
