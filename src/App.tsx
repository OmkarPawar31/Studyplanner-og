import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlannerProvider } from './contexts/PlannerContext';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Timetable } from './pages/dashboard/Timetable';
import { Quiz } from './pages/dashboard/Quiz';
import { Analysis } from './pages/dashboard/Analysis';
import { Profile } from './pages/dashboard/Profile';

// ─── Route Guards ──────────────────────────────────────────────────────────

/**
 * Redirects authenticated users away from public pages (login / register)
 * to the dashboard. Shows nothing while the auth state is resolving.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // avoid flash
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/**
 * Redirects unauthenticated users to the login page.
 * Shows nothing while auth state is resolving.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null; // avoid flash
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── App ───────────────────────────────────────────────────────────────────

export function App() {
  return (
    <AuthProvider>
      <PlannerProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Timetable />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PlannerProvider>
    </AuthProvider>
  );
}