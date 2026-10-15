import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ShiftsPage from './pages/ShiftsPage';
import ZonesPage from './pages/ZonesPage';
import StaffPage from './pages/StaffPage';

// Protected Route Guard
function ProtectedRoute({ children, supervisorOnly = false }) {
  const { isAuthenticated, isSupervisor, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <i className="fa-solid fa-plane-departure fa-spin-pulse fa-3x" />
        <p>Initializing AeroOps Command Terminal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (supervisorOnly && !isSupervisor) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// App Layout with Navbar & Sidebar
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-main-content">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/shifts"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ShiftsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/zones"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ZonesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff"
              element={
                <ProtectedRoute supervisorOnly>
                  <AppLayout>
                    <StaffPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
