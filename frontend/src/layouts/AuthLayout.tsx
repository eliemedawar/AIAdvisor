import { Outlet } from 'react-router-dom';

// Thin wrapper — the auth pages own their full-screen layout
export function AuthLayout() {
  return <Outlet />;
}

// Named export alias for any legacy imports
export const AuthLayout$ = AuthLayout;
