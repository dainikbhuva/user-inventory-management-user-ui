import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { ThemeProvider } from './shared/theme/ThemeContext';
import { AuthProvider } from './shared/auth/AuthContext';
import { PermissionProvider } from './shared/permissions/PermissionContext';
import { NotificationProvider } from './shared/notifications/NotificationContext';
import { SubscriptionProvider } from './shared/subscription/SubscriptionContext';
import { MenuProvider } from './shared/menu/MenuContext';
import { setupApiInterceptor } from './utils/interceptor';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ActiveSubscriptionRoute } from './components/common/ActiveSubscriptionRoute';
import { PageLoader } from './components/common/PageLoader';
import { Toaster } from './components/ui/Toaster';
import { PageMetaManager } from './components/common/PageMetaManager';
import * as P from './routes/lazyPages';

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
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<P.LoginPage />} />
            <Route path="/signup" element={<P.SignupPage />} />
            <Route path="/forgot-password" element={<P.ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<P.VerifyOTPPage />} />
            <Route path="/reset-password" element={<P.ResetPasswordPage />} />
            <Route
              path="/plan-expired"
              element={
                <ProtectedRoute>
                  <P.PlanExpiredPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ActiveSubscriptionRoute>
                  <P.DashboardPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ActiveSubscriptionRoute>
                  <P.NotificationsPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ActiveSubscriptionRoute>
                  <P.ProfilePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ActiveSubscriptionRoute>
                  <P.ChangePasswordPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ActiveSubscriptionRoute>
                  <P.SettingsLayout />
                </ActiveSubscriptionRoute>
              }
            >
              <Route index element={<P.SettingsIndexRedirect />} />
              <Route path="general" element={<P.SettingsGeneralPage />} />
              <Route path="billing" element={<P.SettingsBillingPage />} />
              <Route path="attendance" element={<P.SettingsAttendancePage />} />
              <Route path="departments" element={<P.DepartmentsSettingsPanel />} />
              <Route path="designations" element={<P.DesignationsSettingsPanel />} />
              <Route path="leave-types" element={<P.LeaveTypesPage embedded />} />
              <Route path="holidays" element={<P.HolidaysPage embedded />} />
              <Route path="announcements" element={<P.AnnouncementsSettingsPanel />} />
              <Route path="shifts" element={<P.SettingsAttendancePage />} />
              <Route path="inventory-categories" element={<P.InventoryCategoriesSettingsPanel />} />
              <Route path="inventory-units" element={<P.InventoryUnitsSettingsPanel />} />
              <Route path="inventory-brands" element={<P.InventoryBrandsSettingsPanel />} />
              <Route path="inventory-warehouses" element={<P.InventoryWarehousesSettingsPanel />} />
              <Route path="inventory-suppliers" element={<P.InventorySuppliersSettingsPanel />} />
              <Route path="inventory-taxes" element={<P.InventoryTaxesSettingsPanel />} />
              <Route path="customers" element={<P.CustomersSettingsPanel />} />
              <Route path="boms" element={<P.BOMsSettingsPanel />} />
            </Route>
            <Route
              path="/settings/inventory-suppliers/new"
              element={
                <ActiveSubscriptionRoute>
                  <P.SupplierCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/settings/inventory-suppliers/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <P.SupplierEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ActiveSubscriptionRoute>
                  <P.ProductCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <P.ProductEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-in/new"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockInCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-in/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockInEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-in/:id"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockInViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-out/new"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockOutCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-out/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockOutEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-out/:id"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockOutViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/current-stock"
              element={
                <ActiveSubscriptionRoute>
                  <P.CurrentStockPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-ledger"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockLedgerPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment/new"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockAdjustmentCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment/:id/edit"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockAdjustmentEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment/:id"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockAdjustmentViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/stock-adjustment"
              element={
                <ActiveSubscriptionRoute>
                  <P.StockAdjustmentPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route path="/settings/customers/new" element={<ActiveSubscriptionRoute><P.CustomerCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/settings/customers/:id/edit" element={<ActiveSubscriptionRoute><P.CustomerEditPage /></ActiveSubscriptionRoute>} />

            <Route path="/purchase/purchase-orders" element={<ActiveSubscriptionRoute><P.PurchaseOrdersPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-orders/new" element={<ActiveSubscriptionRoute><P.PurchaseOrderCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-orders/:id/edit" element={<ActiveSubscriptionRoute><P.PurchaseOrderEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-orders/:id" element={<ActiveSubscriptionRoute><P.PurchaseOrderViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/purchase/grns" element={<ActiveSubscriptionRoute><P.GRNsPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/grns/new" element={<ActiveSubscriptionRoute><P.GRNCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/grns/:id/edit" element={<ActiveSubscriptionRoute><P.GRNEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/grns/:id" element={<ActiveSubscriptionRoute><P.GRNViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/purchase/purchase-returns" element={<ActiveSubscriptionRoute><P.PurchaseReturnsPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-returns/new" element={<ActiveSubscriptionRoute><P.PurchaseReturnCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-returns/:id/edit" element={<ActiveSubscriptionRoute><P.PurchaseReturnEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/purchase/purchase-returns/:id" element={<ActiveSubscriptionRoute><P.PurchaseReturnViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/sales-orders" element={<ActiveSubscriptionRoute><P.SalesOrdersPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-orders/new" element={<ActiveSubscriptionRoute><P.SalesOrderCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-orders/:id/edit" element={<ActiveSubscriptionRoute><P.SalesOrderEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-orders/:id" element={<ActiveSubscriptionRoute><P.SalesOrderViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/delivery-challans" element={<ActiveSubscriptionRoute><P.DeliveryChallansPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/delivery-challans/new" element={<ActiveSubscriptionRoute><P.DeliveryChallanCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/delivery-challans/:id/edit" element={<ActiveSubscriptionRoute><P.DeliveryChallanEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/delivery-challans/:id" element={<ActiveSubscriptionRoute><P.DeliveryChallanViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/sales-invoices" element={<ActiveSubscriptionRoute><P.SalesInvoicesPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-invoices/new" element={<ActiveSubscriptionRoute><P.SalesInvoiceCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-invoices/:id/edit" element={<ActiveSubscriptionRoute><P.SalesInvoiceEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-invoices/:id" element={<ActiveSubscriptionRoute><P.SalesInvoiceViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/sales/sales-returns" element={<ActiveSubscriptionRoute><P.SalesReturnsPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-returns/new" element={<ActiveSubscriptionRoute><P.SalesReturnCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-returns/:id/edit" element={<ActiveSubscriptionRoute><P.SalesReturnEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/sales/sales-returns/:id" element={<ActiveSubscriptionRoute><P.SalesReturnViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/manufacturing/work-orders" element={<ActiveSubscriptionRoute><P.WorkOrdersPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/work-orders/new" element={<ActiveSubscriptionRoute><P.WorkOrderCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/work-orders/:id/edit" element={<ActiveSubscriptionRoute><P.WorkOrderEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/work-orders/:id" element={<ActiveSubscriptionRoute><P.WorkOrderViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/manufacturing/material-issues" element={<ActiveSubscriptionRoute><P.MaterialIssuesPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/material-issues/new" element={<ActiveSubscriptionRoute><P.MaterialIssueCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/material-issues/:id/edit" element={<ActiveSubscriptionRoute><P.MaterialIssueEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/material-issues/:id" element={<ActiveSubscriptionRoute><P.MaterialIssueViewPage /></ActiveSubscriptionRoute>} />

            <Route path="/manufacturing/production-entries" element={<ActiveSubscriptionRoute><P.ProductionEntriesPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/production-entries/new" element={<ActiveSubscriptionRoute><P.ProductionEntryCreatePage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/production-entries/:id/edit" element={<ActiveSubscriptionRoute><P.ProductionEntryEditPage /></ActiveSubscriptionRoute>} />
            <Route path="/manufacturing/production-entries/:id" element={<ActiveSubscriptionRoute><P.ProductionEntryViewPage /></ActiveSubscriptionRoute>} />

            <Route
              path="/:moduleCode/:itemCode/new"
              element={
                <ActiveSubscriptionRoute>
                  <P.UserCreatePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode/:userId/edit"
              element={
                <ActiveSubscriptionRoute>
                  <P.UserEditPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode/:userId"
              element={
                <ActiveSubscriptionRoute>
                  <P.UserViewPage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode/:itemCode"
              element={
                <ActiveSubscriptionRoute>
                  <P.ModulePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route
              path="/:moduleCode"
              element={
                <ActiveSubscriptionRoute>
                  <P.ModulePage />
                </ActiveSubscriptionRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
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
