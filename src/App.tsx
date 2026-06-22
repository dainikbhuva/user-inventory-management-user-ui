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
import { SupplierCreatePage } from './pages/user/inventory-suppliers/SupplierCreatePage';
import { SupplierEditPage } from './pages/user/inventory-suppliers/SupplierEditPage';
import { ProductCreatePage } from './pages/user/inventory-products/ProductCreatePage';
import { ProductEditPage } from './pages/user/inventory-products/ProductEditPage';
import { StockInCreatePage, StockOutCreatePage } from './pages/user/stock-movements/StockMovementCreatePage';
import { StockInEditPage, StockOutEditPage } from './pages/user/stock-movements/StockMovementEditPage';
import { StockInViewPage, StockOutViewPage } from './pages/user/stock-movements/StockMovementViewPage';
import { CurrentStockPage } from './pages/user/inventory-stock/CurrentStockPage';
import { StockLedgerPage } from './pages/user/inventory-stock/StockLedgerPage';
import { StockAdjustmentPage } from './pages/user/inventory-stock/StockAdjustmentPage';
import { StockAdjustmentCreatePage } from './pages/user/inventory-stock/StockAdjustmentCreatePage';
import { StockAdjustmentEditPage } from './pages/user/inventory-stock/StockAdjustmentEditPage';
import { StockAdjustmentViewPage } from './pages/user/inventory-stock/StockAdjustmentViewPage';
import { Toaster } from './components/ui/Toaster';
import { NotificationsPage } from './pages/user/notifications/NotificationsPage';
import { PlanExpiredPage } from './pages/subscription/PlanExpiredPage';
import { PageMetaManager } from './components/common/PageMetaManager';
// Customers
import { CustomerCreatePage } from './pages/user/customers/CustomerCreatePage';
import { CustomerEditPage } from './pages/user/customers/CustomerEditPage';
// Purchase modules
import { PurchaseOrdersPage } from './pages/user/purchase/PurchaseOrdersPage';
import { PurchaseOrderCreatePage } from './pages/user/purchase/PurchaseOrderCreatePage';
import { PurchaseOrderEditPage } from './pages/user/purchase/PurchaseOrderEditPage';
import { PurchaseOrderViewPage } from './pages/user/purchase/PurchaseOrderViewPage';
import { GRNsPage } from './pages/user/purchase/GRNsPage';
import { GRNCreatePage } from './pages/user/purchase/GRNCreatePage';
import { GRNEditPage } from './pages/user/purchase/GRNEditPage';
import { GRNViewPage } from './pages/user/purchase/GRNViewPage';
import { PurchaseReturnsPage } from './pages/user/purchase/PurchaseReturnsPage';
import { PurchaseReturnCreatePage } from './pages/user/purchase/PurchaseReturnCreatePage';
import { PurchaseReturnEditPage } from './pages/user/purchase/PurchaseReturnEditPage';
import { PurchaseReturnViewPage } from './pages/user/purchase/PurchaseReturnViewPage';
// Sales modules
import { SalesOrdersPage } from './pages/user/sales/SalesOrdersPage';
import { SalesOrderCreatePage } from './pages/user/sales/SalesOrderCreatePage';
import { SalesOrderEditPage } from './pages/user/sales/SalesOrderEditPage';
import { SalesOrderViewPage } from './pages/user/sales/SalesOrderViewPage';
import { DeliveryChallansPage } from './pages/user/sales/DeliveryChallansPage';
import { DeliveryChallanCreatePage } from './pages/user/sales/DeliveryChallanCreatePage';
import { DeliveryChallanEditPage } from './pages/user/sales/DeliveryChallanEditPage';
import { DeliveryChallanViewPage } from './pages/user/sales/DeliveryChallanViewPage';
import { SalesInvoicesPage } from './pages/user/sales/SalesInvoicesPage';
import { SalesInvoiceCreatePage } from './pages/user/sales/SalesInvoiceCreatePage';
import { SalesInvoiceEditPage } from './pages/user/sales/SalesInvoiceEditPage';
import { SalesInvoiceViewPage } from './pages/user/sales/SalesInvoiceViewPage';
import { SalesReturnsPage } from './pages/user/sales/SalesReturnsPage';
import { SalesReturnCreatePage } from './pages/user/sales/SalesReturnCreatePage';
import { SalesReturnEditPage } from './pages/user/sales/SalesReturnEditPage';
import { SalesReturnViewPage } from './pages/user/sales/SalesReturnViewPage';
import { WorkOrdersPage } from './pages/user/work-orders/WorkOrdersPage';
import { WorkOrderCreatePage } from './pages/user/work-orders/WorkOrderCreatePage';
import { WorkOrderEditPage } from './pages/user/work-orders/WorkOrderEditPage';
import { WorkOrderViewPage } from './pages/user/work-orders/WorkOrderViewPage';
import { MaterialIssuesPage } from './pages/user/material-issues/MaterialIssuesPage';
import { MaterialIssueCreatePage } from './pages/user/material-issues/MaterialIssueCreatePage';
import { MaterialIssueEditPage } from './pages/user/material-issues/MaterialIssueEditPage';
import { MaterialIssueViewPage } from './pages/user/material-issues/MaterialIssueViewPage';
import { ProductionEntriesPage } from './pages/user/production-entries/ProductionEntriesPage';
import { ProductionEntryCreatePage } from './pages/user/production-entries/ProductionEntryCreatePage';
import { ProductionEntryEditPage } from './pages/user/production-entries/ProductionEntryEditPage';
import { ProductionEntryViewPage } from './pages/user/production-entries/ProductionEntryViewPage';

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
              <Route path="inventory-categories" element={<SettingsRoutes.InventoryCategories />} />
              <Route path="inventory-units" element={<SettingsRoutes.InventoryUnits />} />
              <Route path="inventory-brands" element={<SettingsRoutes.InventoryBrands />} />
              <Route path="inventory-warehouses" element={<SettingsRoutes.InventoryWarehouses />} />
              <Route path="inventory-suppliers" element={<SettingsRoutes.InventorySuppliers />} />
              <Route path="inventory-taxes" element={<SettingsRoutes.InventoryTaxes />} />
              <Route path="customers" element={<SettingsRoutes.Customers />} />
              <Route path="boms" element={<SettingsRoutes.BOMs />} />
            </Route>
            <Route
              path="/settings/inventory-suppliers/new"
              element={
                <ActiveSubscriptionRoute>
                  <SupplierCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/settings/inventory-suppliers/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <SupplierEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ActiveSubscriptionRoute>
                  <ProductCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <ProductEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-in/new"
              element={
                <ActiveSubscriptionRoute>
                  <StockInCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-in/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <StockInEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-in/:id"
              element={
                <ActiveSubscriptionRoute>
                  <StockInViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-out/new"
              element={
                <ActiveSubscriptionRoute>
                  <StockOutCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-out/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <StockOutEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-out/:id"
              element={
                <ActiveSubscriptionRoute>
                  <StockOutViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/current-stock"
              element={
                <ActiveSubscriptionRoute>
                  <CurrentStockPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-ledger"
              element={
                <ActiveSubscriptionRoute>
                  <StockLedgerPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment/new"
              element={
                <ActiveSubscriptionRoute>
                  <StockAdjustmentCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <StockAdjustmentEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment/:id"
              element={
                <ActiveSubscriptionRoute>
                  <StockAdjustmentViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment"
              element={
                <ActiveSubscriptionRoute>
                  <StockAdjustmentPage />
                </ActiveSubscriptionRoute>
              }
            />
            {/* ─── Customer Settings Routes ─────────────────────────────────────── */}
            <Route path="/settings/customers/new" element={<ActiveSubscriptionRoute><CustomerCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/settings/customers/:id/edit" element={<ActiveSubscriptionRoute><CustomerEditPage /></ActiveSubscriptionRoute>} />

            {/* ─── Purchase Module Routes ───────────────────────────────────────── */}
            <Route path="/purchase/purchase-orders" element={<ActiveSubscriptionRoute><PurchaseOrdersPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-orders/new" element={<ActiveSubscriptionRoute><PurchaseOrderCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-orders/:id/edit" element={<ActiveSubscriptionRoute><PurchaseOrderEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-orders/:id" element={<ActiveSubscriptionRoute><PurchaseOrderViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/purchase/grns" element={<ActiveSubscriptionRoute><GRNsPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/grns/new" element={<ActiveSubscriptionRoute><GRNCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/grns/:id/edit" element={<ActiveSubscriptionRoute><GRNEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/grns/:id" element={<ActiveSubscriptionRoute><GRNViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/purchase/purchase-returns" element={<ActiveSubscriptionRoute><PurchaseReturnsPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-returns/new" element={<ActiveSubscriptionRoute><PurchaseReturnCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-returns/:id/edit" element={<ActiveSubscriptionRoute><PurchaseReturnEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-returns/:id" element={<ActiveSubscriptionRoute><PurchaseReturnViewPage /></ActiveSubscriptionRoute>} />

            {/* ─── Sales Module Routes ──────────────────────────────────────────── */}
            <Route path="/sales/sales-orders" element={<ActiveSubscriptionRoute><SalesOrdersPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-orders/new" element={<ActiveSubscriptionRoute><SalesOrderCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-orders/:id/edit" element={<ActiveSubscriptionRoute><SalesOrderEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-orders/:id" element={<ActiveSubscriptionRoute><SalesOrderViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/delivery-challans" element={<ActiveSubscriptionRoute><DeliveryChallansPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/delivery-challans/new" element={<ActiveSubscriptionRoute><DeliveryChallanCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/delivery-challans/:id/edit" element={<ActiveSubscriptionRoute><DeliveryChallanEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/delivery-challans/:id" element={<ActiveSubscriptionRoute><DeliveryChallanViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/sales-invoices" element={<ActiveSubscriptionRoute><SalesInvoicesPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-invoices/new" element={<ActiveSubscriptionRoute><SalesInvoiceCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-invoices/:id/edit" element={<ActiveSubscriptionRoute><SalesInvoiceEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-invoices/:id" element={<ActiveSubscriptionRoute><SalesInvoiceViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/sales-returns" element={<ActiveSubscriptionRoute><SalesReturnsPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-returns/new" element={<ActiveSubscriptionRoute><SalesReturnCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-returns/:id/edit" element={<ActiveSubscriptionRoute><SalesReturnEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-returns/:id" element={<ActiveSubscriptionRoute><SalesReturnViewPage /></ActiveSubscriptionRoute>} />

            {/* ─── Manufacturing Module Routes ──────────────────────────────────── */}
            <Route path="/manufacturing/work-orders" element={<ActiveSubscriptionRoute><WorkOrdersPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/work-orders/new" element={<ActiveSubscriptionRoute><WorkOrderCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/work-orders/:id/edit" element={<ActiveSubscriptionRoute><WorkOrderEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/work-orders/:id" element={<ActiveSubscriptionRoute><WorkOrderViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/manufacturing/material-issues" element={<ActiveSubscriptionRoute><MaterialIssuesPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/material-issues/new" element={<ActiveSubscriptionRoute><MaterialIssueCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/material-issues/:id/edit" element={<ActiveSubscriptionRoute><MaterialIssueEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/material-issues/:id" element={<ActiveSubscriptionRoute><MaterialIssueViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/manufacturing/production-entries" element={<ActiveSubscriptionRoute><ProductionEntriesPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/production-entries/new" element={<ActiveSubscriptionRoute><ProductionEntryCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/production-entries/:id/edit" element={<ActiveSubscriptionRoute><ProductionEntryEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/production-entries/:id" element={<ActiveSubscriptionRoute><ProductionEntryViewPage /></ActiveSubscriptionRoute>} />

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
