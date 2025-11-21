import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-300">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
};


