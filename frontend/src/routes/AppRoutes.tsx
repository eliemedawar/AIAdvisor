import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PageShell, PageSection, SkeletonCard } from "../components";

// Lazy load pages for code splitting
const SignInPage = lazy(() => import("../pages/auth/SignInPage").then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("../pages/auth/SignUpPage").then(m => ({ default: m.SignUpPage })));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));
const ChatPage = lazy(() => import("../pages/chat/ChatPage").then(m => ({ default: m.ChatPage })));
const CalendarPage = lazy(() => import("../pages/calendar/CalendarPage").then(m => ({ default: m.CalendarPage })));
const PlannerPage = lazy(() => import("../pages/planner/PlannerPage").then(m => ({ default: m.PlannerPage })));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage").then(m => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import("../pages/errors/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

// Loading fallback component
const PageLoader = () => (
  <PageShell>
    <PageSection>
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </PageSection>
  </PageShell>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};


