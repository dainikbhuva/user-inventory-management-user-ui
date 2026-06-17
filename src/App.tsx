import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './shared/theme/ThemeContext';
import { AuthProvider } from './shared/auth/AuthContext';
import { PermissionProvider } from './shared/permissions/PermissionContext';
import { NotificationProvider } from './shared/notifications/NotificationContext';
import { SubscriptionProvider } from './shared/subscription/SubscriptionContext';
import { MenuProvider } from './shared/menu/MenuContext';
import { setupApiInterceptor } from './utils/interceptor';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyOTPPage } from './pages/auth/VerifyOTPPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ActiveSubscriptionRoute } from './components/common/ActiveSubscriptionRoute';
import { DashboardPage } from './pages/user/dashboard/Dashboard';
import { ModulePage } from './pages/user/module/ModulePage';
import { ProfilePage } from './pages/user/profile/Profile';
import { ChangePasswordPage } from './pages/user/profile/ChangePassword';
import { SettingsLayout, SettingsIndexRedirect, SettingsRoutes } from './pages/user/settings/Settings';
import { UserCreatePage } from './pages/user/users/UserCreatePage';
import { UserEditPage } from './pages/user/users/UserEditPage';
import { UserViewPage } from './pages/user/users/UserViewPage';
import { Toaster } from './components/ui/Toaster';
import { NotificationsPage } from './pages/user/notifications/NotificationsPage';
import { PlanExpiredPage } from './pages/subscription/PlanExpiredPage';
import { PageMetaManager } from './components/common/PageMetaManager';

function App() {
  useEffect(() => {
    setupApiInterceptor();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
          <NotificationProvider>
          <SubscriptionProvider>
          <MenuProvider>
          <Toaster />
          <PageMetaManager />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/plan-expired"
              element={
                <ProtectedRoute>
                  <PlanExpiredPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ActiveSubscriptionRoute>
                  <DashboardPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ActiveSubscriptionRoute>
                  <NotificationsPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ActiveSubscriptionRoute>
                  <ProfilePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ActiveSubscriptionRoute>
                  <ChangePasswordPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ActiveSubscriptionRoute>
                  <SettingsLayout />
                </ActiveSubscriptionRoute>
              }
            >
              <Route index element={<SettingsIndexRedirect />} />
              <Route path="general" element={<SettingsRoutes.General />} />
              <Route path="billing" element={<SettingsRoutes.Billing />} />
              <Route path="attendance" element={<SettingsRoutes.Attendance />} />
              <Route path="departments" element={<SettingsRoutes.Departments />} />
              <Route path="designations" element={<SettingsRoutes.Designations />} />
              <Route path="leave-types" element={<SettingsRoutes.LeaveTypes />} />
              <Route path="holidays" element={<SettingsRoutes.Holidays />} />
              <Route path="announcements" element={<SettingsRoutes.Announcements />} />
              <Route path="shifts" element={<SettingsRoutes.Shifts />} />
            </Route>
            <Route
              path="/:moduleCode/:itemCode/new"
              element={
                <ActiveSubscriptionRoute>
                  <UserCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode/:userId/edit"
              element={
                <ActiveSubscriptionRoute>
                  <UserEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode/:userId"
              element={
                <ActiveSubscriptionRoute>
                  <UserViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode"
              element={
                <ActiveSubscriptionRoute>
                  <ModulePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode"
              element={
                <ActiveSubscriptionRoute>
                  <ModulePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </MenuProvider>
          </SubscriptionProvider>
          </NotificationProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
