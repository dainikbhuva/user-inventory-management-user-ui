import { lazy, type ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyNamed = (factory: () => Promise<Record<string, ComponentType<any>>>, name: string) =>
  lazy(() => factory().then((module) => ({ default: module[name] })));

// Auth — small, loaded on first visit
export const LoginPage = lazyNamed(() => import('../pages/auth/LoginPage'), 'LoginPage');
export const SignupPage = lazyNamed(() => import('../pages/auth/SignupPage'), 'SignupPage');
export const ForgotPasswordPage = lazyNamed(() => import('../pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
export const VerifyOTPPage = lazyNamed(() => import('../pages/auth/VerifyOTPPage'), 'VerifyOTPPage');
export const ResetPasswordPage = lazyNamed(() => import('../pages/auth/ResetPasswordPage'), 'ResetPasswordPage');

// Core
export const DashboardPage = lazyNamed(() => import('../pages/user/dashboard/Dashboard'), 'DashboardPage');
export const ModulePage = lazyNamed(() => import('../pages/user/module/ModulePage'), 'ModulePage');
export const ProfilePage = lazyNamed(() => import('../pages/user/profile/Profile'), 'ProfilePage');
export const ChangePasswordPage = lazyNamed(() => import('../pages/user/profile/ChangePassword'), 'ChangePasswordPage');
export const NotificationsPage = lazyNamed(() => import('../pages/user/notifications/NotificationsPage'), 'NotificationsPage');
export const PlanExpiredPage = lazyNamed(() => import('../pages/subscription/PlanExpiredPage'), 'PlanExpiredPage');

// Settings
export const SettingsLayout = lazyNamed(() => import('../pages/user/settings/SettingsLayout'), 'SettingsLayout');
export const SettingsIndexRedirect = lazy(() =>
  import('../pages/user/settings/Settings').then((m) => ({ default: m.SettingsIndexRedirect }))
);
export const SettingsGeneralPage = lazyNamed(() => import('../pages/user/settings/SettingsGeneralPage'), 'SettingsGeneralPage');
export const SettingsAttendancePage = lazyNamed(() => import('../pages/user/settings/SettingsAttendancePage'), 'SettingsAttendancePage');
export const SettingsBillingPage = lazyNamed(() => import('../pages/user/settings/SettingsBillingPage'), 'SettingsBillingPage');
export const DepartmentsSettingsPanel = lazyNamed(() => import('../pages/user/departments/DepartmentsPage'), 'DepartmentsSettingsPanel');
export const DesignationsSettingsPanel = lazyNamed(() => import('../pages/user/designations/DesignationsPage'), 'DesignationsSettingsPanel');
export const LeaveTypesPage = lazyNamed(() => import('../pages/user/leave-types/LeaveTypesPage'), 'LeaveTypesPage');
export const HolidaysPage = lazyNamed(() => import('../pages/user/holidays/HolidaysPage'), 'HolidaysPage');
export const AnnouncementsSettingsPanel = lazyNamed(() => import('../pages/user/announcements/AnnouncementsPage'), 'AnnouncementsSettingsPanel');
export const InventoryCategoriesSettingsPanel = lazyNamed(() => import('../pages/user/inventory-categories/InventoryCategoriesPage'), 'InventoryCategoriesSettingsPanel');
export const InventoryUnitsSettingsPanel = lazyNamed(() => import('../pages/user/inventory-units/InventoryUnitsPage'), 'InventoryUnitsSettingsPanel');
export const InventoryBrandsSettingsPanel = lazyNamed(() => import('../pages/user/inventory-brands/InventoryBrandsPage'), 'InventoryBrandsSettingsPanel');
export const InventoryWarehousesSettingsPanel = lazyNamed(() => import('../pages/user/inventory-warehouses/InventoryWarehousesPage'), 'InventoryWarehousesSettingsPanel');
export const InventorySuppliersSettingsPanel = lazyNamed(() => import('../pages/user/inventory-suppliers/InventorySuppliersPage'), 'InventorySuppliersSettingsPanel');
export const InventoryTaxesSettingsPanel = lazyNamed(() => import('../pages/user/inventory-taxes/InventoryTaxesPage'), 'InventoryTaxesSettingsPanel');
export const CustomersSettingsPanel = lazyNamed(() => import('../pages/user/customers/CustomersPage'), 'CustomersSettingsPanel');
export const BOMsSettingsPanel = lazyNamed(() => import('../pages/user/boms/BOMsPage'), 'BOMsSettingsPanel');

// Users
export const UserCreatePage = lazyNamed(() => import('../pages/user/users/UserCreatePage'), 'UserCreatePage');
export const UserEditPage = lazyNamed(() => import('../pages/user/users/UserEditPage'), 'UserEditPage');
export const UserViewPage = lazyNamed(() => import('../pages/user/users/UserViewPage'), 'UserViewPage');

// Masters & inventory
export const SupplierCreatePage = lazyNamed(() => import('../pages/user/inventory-suppliers/SupplierCreatePage'), 'SupplierCreatePage');
export const SupplierEditPage = lazyNamed(() => import('../pages/user/inventory-suppliers/SupplierEditPage'), 'SupplierEditPage');
export const SupplierViewPage = lazyNamed(() => import('../pages/user/inventory-suppliers/SupplierViewPage'), 'SupplierViewPage');
export const ProductCreatePage = lazyNamed(() => import('../pages/user/inventory-products/ProductCreatePage'), 'ProductCreatePage');
export const ProductViewPage = lazyNamed(() => import('../pages/user/inventory-products/ProductViewPage'), 'ProductViewPage');
export const ProductEditPage = lazyNamed(() => import('../pages/user/inventory-products/ProductEditPage'), 'ProductEditPage');
export const CustomerCreatePage = lazyNamed(() => import('../pages/user/customers/CustomerCreatePage'), 'CustomerCreatePage');
export const CustomerEditPage = lazyNamed(() => import('../pages/user/customers/CustomerEditPage'), 'CustomerEditPage');
export const CustomerViewPage = lazyNamed(() => import('../pages/user/customers/CustomerViewPage'), 'CustomerViewPage');

// Stock
export const StockInCreatePage = lazyNamed(() => import('../pages/user/stock-movements/StockMovementCreatePage'), 'StockInCreatePage');
export const StockOutCreatePage = lazyNamed(() => import('../pages/user/stock-movements/StockMovementCreatePage'), 'StockOutCreatePage');
export const StockInEditPage = lazyNamed(() => import('../pages/user/stock-movements/StockMovementEditPage'), 'StockInEditPage');
export const StockOutEditPage = lazyNamed(() => import('../pages/user/stock-movements/StockMovementEditPage'), 'StockOutEditPage');
export const StockInViewPage = lazyNamed(() => import('../pages/user/stock-movements/StockMovementViewPage'), 'StockInViewPage');
export const StockOutViewPage = lazyNamed(() => import('../pages/user/stock-movements/StockMovementViewPage'), 'StockOutViewPage');
export const CurrentStockPage = lazyNamed(() => import('../pages/user/inventory-stock/CurrentStockPage'), 'CurrentStockPage');
export const StockLedgerPage = lazyNamed(() => import('../pages/user/inventory-stock/StockLedgerPage'), 'StockLedgerPage');
export const StockAdjustmentPage = lazyNamed(() => import('../pages/user/inventory-stock/StockAdjustmentPage'), 'StockAdjustmentPage');
export const StockAdjustmentCreatePage = lazyNamed(() => import('../pages/user/inventory-stock/StockAdjustmentCreatePage'), 'StockAdjustmentCreatePage');
export const StockAdjustmentEditPage = lazyNamed(() => import('../pages/user/inventory-stock/StockAdjustmentEditPage'), 'StockAdjustmentEditPage');
export const StockAdjustmentViewPage = lazyNamed(() => import('../pages/user/inventory-stock/StockAdjustmentViewPage'), 'StockAdjustmentViewPage');

// Purchase
export const PurchaseOrdersPage = lazyNamed(() => import('../pages/user/purchase/PurchaseOrdersPage'), 'PurchaseOrdersPage');
export const PurchaseOrderCreatePage = lazyNamed(() => import('../pages/user/purchase/PurchaseOrderCreatePage'), 'PurchaseOrderCreatePage');
export const PurchaseOrderEditPage = lazyNamed(() => import('../pages/user/purchase/PurchaseOrderEditPage'), 'PurchaseOrderEditPage');
export const PurchaseOrderViewPage = lazyNamed(() => import('../pages/user/purchase/PurchaseOrderViewPage'), 'PurchaseOrderViewPage');
export const GRNsPage = lazyNamed(() => import('../pages/user/purchase/GRNsPage'), 'GRNsPage');
export const GRNCreatePage = lazyNamed(() => import('../pages/user/purchase/GRNCreatePage'), 'GRNCreatePage');
export const GRNEditPage = lazyNamed(() => import('../pages/user/purchase/GRNEditPage'), 'GRNEditPage');
export const GRNViewPage = lazyNamed(() => import('../pages/user/purchase/GRNViewPage'), 'GRNViewPage');
export const PurchaseReturnsPage = lazyNamed(() => import('../pages/user/purchase/PurchaseReturnsPage'), 'PurchaseReturnsPage');
export const PurchaseReturnCreatePage = lazyNamed(() => import('../pages/user/purchase/PurchaseReturnCreatePage'), 'PurchaseReturnCreatePage');
export const PurchaseReturnEditPage = lazyNamed(() => import('../pages/user/purchase/PurchaseReturnEditPage'), 'PurchaseReturnEditPage');
export const PurchaseReturnViewPage = lazyNamed(() => import('../pages/user/purchase/PurchaseReturnViewPage'), 'PurchaseReturnViewPage');

// Sales
export const SalesOrdersPage = lazyNamed(() => import('../pages/user/sales/SalesOrdersPage'), 'SalesOrdersPage');
export const SalesOrderCreatePage = lazyNamed(() => import('../pages/user/sales/SalesOrderCreatePage'), 'SalesOrderCreatePage');
export const SalesOrderEditPage = lazyNamed(() => import('../pages/user/sales/SalesOrderEditPage'), 'SalesOrderEditPage');
export const SalesOrderViewPage = lazyNamed(() => import('../pages/user/sales/SalesOrderViewPage'), 'SalesOrderViewPage');
export const DeliveryChallansPage = lazyNamed(() => import('../pages/user/sales/DeliveryChallansPage'), 'DeliveryChallansPage');
export const DeliveryChallanCreatePage = lazyNamed(() => import('../pages/user/sales/DeliveryChallanCreatePage'), 'DeliveryChallanCreatePage');
export const DeliveryChallanEditPage = lazyNamed(() => import('../pages/user/sales/DeliveryChallanEditPage'), 'DeliveryChallanEditPage');
export const DeliveryChallanViewPage = lazyNamed(() => import('../pages/user/sales/DeliveryChallanViewPage'), 'DeliveryChallanViewPage');
export const SalesInvoicesPage = lazyNamed(() => import('../pages/user/sales/SalesInvoicesPage'), 'SalesInvoicesPage');
export const SalesInvoiceCreatePage = lazyNamed(() => import('../pages/user/sales/SalesInvoiceCreatePage'), 'SalesInvoiceCreatePage');
export const SalesInvoiceEditPage = lazyNamed(() => import('../pages/user/sales/SalesInvoiceEditPage'), 'SalesInvoiceEditPage');
export const SalesInvoiceViewPage = lazyNamed(() => import('../pages/user/sales/SalesInvoiceViewPage'), 'SalesInvoiceViewPage');
export const SalesReturnsPage = lazyNamed(() => import('../pages/user/sales/SalesReturnsPage'), 'SalesReturnsPage');
export const SalesReturnCreatePage = lazyNamed(() => import('../pages/user/sales/SalesReturnCreatePage'), 'SalesReturnCreatePage');
export const SalesReturnEditPage = lazyNamed(() => import('../pages/user/sales/SalesReturnEditPage'), 'SalesReturnEditPage');
export const SalesReturnViewPage = lazyNamed(() => import('../pages/user/sales/SalesReturnViewPage'), 'SalesReturnViewPage');

// Manufacturing
export const WorkOrdersPage = lazyNamed(() => import('../pages/user/work-orders/WorkOrdersPage'), 'WorkOrdersPage');
export const WorkOrderCreatePage = lazyNamed(() => import('../pages/user/work-orders/WorkOrderCreatePage'), 'WorkOrderCreatePage');
export const WorkOrderEditPage = lazyNamed(() => import('../pages/user/work-orders/WorkOrderEditPage'), 'WorkOrderEditPage');
export const WorkOrderViewPage = lazyNamed(() => import('../pages/user/work-orders/WorkOrderViewPage'), 'WorkOrderViewPage');
export const MaterialIssuesPage = lazyNamed(() => import('../pages/user/material-issues/MaterialIssuesPage'), 'MaterialIssuesPage');
export const MaterialIssueCreatePage = lazyNamed(() => import('../pages/user/material-issues/MaterialIssueCreatePage'), 'MaterialIssueCreatePage');
export const MaterialIssueEditPage = lazyNamed(() => import('../pages/user/material-issues/MaterialIssueEditPage'), 'MaterialIssueEditPage');
export const MaterialIssueViewPage = lazyNamed(() => import('../pages/user/material-issues/MaterialIssueViewPage'), 'MaterialIssueViewPage');
export const ProductionEntriesPage = lazyNamed(() => import('../pages/user/production-entries/ProductionEntriesPage'), 'ProductionEntriesPage');
export const ProductionEntryCreatePage = lazyNamed(() => import('../pages/user/production-entries/ProductionEntryCreatePage'), 'ProductionEntryCreatePage');
export const ProductionEntryEditPage = lazyNamed(() => import('../pages/user/production-entries/ProductionEntryEditPage'), 'ProductionEntryEditPage');
export const ProductionEntryViewPage = lazyNamed(() => import('../pages/user/production-entries/ProductionEntryViewPage'), 'ProductionEntryViewPage');
