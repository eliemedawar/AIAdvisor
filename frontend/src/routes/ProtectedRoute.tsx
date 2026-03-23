import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080B14' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(108,99,255,0.3)', borderTopColor: '#6C63FF' }} />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/sign-in" replace />;
}
