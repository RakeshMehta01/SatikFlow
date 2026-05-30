import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { ToastContainer } from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import UploadLeadsPage from './pages/UploadLeadsPage';
import AssignLeadsPage from './pages/AssignLeadsPage';
import LeadListPage from './pages/LeadListPage';
import LeadDetailPage from './pages/LeadDetailPage';
import CallingWorkspace from './pages/CallingWorkspace';
import FollowUpsPage from './pages/FollowUpsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <ManagerDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/upload-leads"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <UploadLeadsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/assign-leads"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <AssignLeadsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/leads"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <LeadListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/follow-ups"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <FollowUpsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/reports"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/users"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <AppLayout>
                  <UsersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Authenticated Agent Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRole="AGENT">
                <AppLayout>
                  <AgentDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/calling-workspace"
            element={
              <ProtectedRoute allowedRole="AGENT">
                <AppLayout>
                  <CallingWorkspace />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/leads"
            element={
              <ProtectedRoute allowedRole="AGENT">
                <AppLayout>
                  <LeadListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/follow-ups"
            element={
              <ProtectedRoute allowedRole="AGENT">
                <AppLayout>
                  <FollowUpsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/reports"
            element={
              <ProtectedRoute allowedRole="AGENT">
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Reusable Authenticated Details Route (Shared by both roles) */}
          <Route
            path="/leads/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LeadDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
