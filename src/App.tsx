import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './shared/theme/ThemeContext';
import { AuthProvider } from './shared/auth/AuthContext';
import { setupApiInterceptor } from './utils/interceptor';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyOTPPage } from './pages/auth/VerifyOTPPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardPage } from './pages/user/dashboard/Dashboard';
import { ModulePage } from './pages/user/module/ModulePage';
import { ProfilePage } from './pages/user/profile/Profile';
import { ChangePasswordPage } from './pages/user/profile/ChangePassword';
import { SettingsPage } from './pages/user/settings/Settings';
import { UserCreatePage } from './pages/user/users/UserCreatePage';
import { UserEditPage } from './pages/user/users/UserEditPage';
import { Toaster } from './components/ui/Toaster';

function App() {
  useEffect(() => {
    setupApiInterceptor();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
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
            <Route
              path="/:moduleCode/:itemCode/new"
              element={
                <ProtectedRoute>
                  <UserCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode/:userId/edit"
              element={
                <ProtectedRoute>
                  <UserEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode"
              element={
                <ProtectedRoute>
                  <ModulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:moduleCode"
              element={
                <ProtectedRoute>
                  <ModulePage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
