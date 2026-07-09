import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import JoinEventPage from './pages/JoinEventPage';
import FaceScanPage from './pages/FaceScanPage';
import MyPhotosPage from './pages/MyPhotosPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEventsListPage from './pages/admin/AdminEventsListPage';
import AdminCreateEventPage from './pages/admin/AdminCreateEventPage';
import AdminEventDetailPage from './pages/admin/AdminEventDetailPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public marketing site */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Attendee flow: QR scan -> join -> selfie -> my photos */}
            <Route path="/join/:slug" element={<JoinEventPage />} />
            <Route
              path="/face-scan/:eventId"
              element={
                <ProtectedRoute>
                  <FaceScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-photos/:eventId?"
              element={
                <ProtectedRoute>
                  <MyPhotosPage />
                </ProtectedRoute>
              }
            />

            {/* Shared account pages */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin / organizer dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="events" element={<AdminEventsListPage />} />
              <Route path="events/create" element={<AdminCreateEventPage />} />
              <Route path="events/:id" element={<AdminEventDetailPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
