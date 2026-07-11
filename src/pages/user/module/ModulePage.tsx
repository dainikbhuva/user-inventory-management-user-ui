import { useParams, Navigate } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { getModuleIcon } from '../../../shared/utils/moduleIcons';
import { RolesPage } from '../roles/RolesPage';
import { UsersPage } from '../users/UsersPage';
import { RolePermissionsPage } from '../role-permissions/RolePermissionsPage';
import { LeavePage } from '../leave/LeavePage';
import { AttendancePage } from '../attendance/AttendancePage';
import { ProductsPage } from '../inventory-products/ProductsPage';
import { StockInPage, StockOutPage } from '../stock-movements/StockMovementPage';
import { CurrentStockPage } from '../inventory-stock/CurrentStockPage';
import { StockLedgerPage } from '../inventory-stock/StockLedgerPage';
import { StockAdjustmentPage } from '../inventory-stock/StockAdjustmentPage';
import { WorkOrdersPage } from '../work-orders/WorkOrdersPage';
import { MaterialIssuesPage } from '../material-issues/MaterialIssuesPage';
import { ProductionEntriesPage } from '../production-entries/ProductionEntriesPage';
import { PurchaseOrdersPage } from '../purchase/PurchaseOrdersPage';
import { GRNsPage } from '../purchase/GRNsPage';
import { PurchaseReturnsPage } from '../purchase/PurchaseReturnsPage';
import { SalesOrdersPage } from '../sales/SalesOrdersPage';
import { DeliveryChallansPage } from '../sales/DeliveryChallansPage';
import { SalesInvoicesPage } from '../sales/SalesInvoicesPage';
import { SalesReturnsPage } from '../sales/SalesReturnsPage';
import { UserReportPage } from '../reports/UserReportPage';
import { AttendanceReportPage } from '../reports/AttendanceReportPage';
import { ProductReportPage } from '../reports/ProductReportPage';
import { StockInReportPage, StockOutReportPage } from '../reports/StockMovementReportPage';
import { CurrentStockReportPage } from '../reports/CurrentStockReportPage';
import { StockLedgerReportPage } from '../reports/StockLedgerReportPage';
import { StockAdjustmentReportPage } from '../reports/StockAdjustmentReportPage';

const ROLE_CODES = new Set(['roles', 'role']);
const USER_CODES = new Set(['users', 'user']);
const PERMISSION_CODES = new Set(['role-permissions', 'role-to-permission', 'permissions', 'permission']);
const DEPARTMENT_CODES = new Set(['departments', 'department']);
const DESIGNATION_CODES = new Set(['designations', 'designation']);
const LEAVE_TYPE_CODES = new Set(['leave-types', 'leave-type', 'leave-types-master']);
const LEAVE_CODES = new Set(['leave', 'leaves', 'leave-requests', 'leave-request']);
const ATTENDANCE_CODES = new Set(['attendance', 'attendances']);
const PRODUCT_CODES = new Set(['products', 'product', 'inventory-products', 'inventory-product']);
const STOCK_IN_CODES = new Set(['stock-in', 'stockin', 'stock-inward', 'stock_in']);
const STOCK_OUT_CODES = new Set(['stock-out', 'stockout', 'stock-outward', 'stock_out']);
const CURRENT_STOCK_CODES = new Set(['current-stock', 'current_stock', 'currentstock']);
const STOCK_LEDGER_CODES = new Set(['stock-ledger', 'stock_ledger', 'stockledger']);
const STOCK_ADJUSTMENT_CODES = new Set(['stock-adjustment', 'stock_adjustment', 'stockadjustment']);
const PURCHASE_ORDER_CODES = new Set(['purchase-orders', 'purchase-order', 'purchaseorders', 'po']);
const GRN_CODES = new Set(['grns', 'grn', 'goods-receipt-notes', 'goods-receipt-note']);
const PURCHASE_RETURN_CODES = new Set(['purchase-returns', 'purchase-return', 'purchasereturns']);
const SALES_ORDER_CODES = new Set(['sales-orders', 'sales-order', 'salesorders', 'so']);
const DELIVERY_CHALLAN_CODES = new Set(['delivery-challans', 'delivery-challan', 'deliverychallans', 'dc']);
const SALES_INVOICE_CODES = new Set(['sales-invoices', 'sales-invoice', 'salesinvoices', 'invoices', 'invoice']);
const SALES_RETURN_CODES = new Set(['sales-returns', 'sales-return', 'salesreturns']);
const WORK_ORDER_CODES = new Set(['work-orders', 'work-order', 'workorders', 'workorder', 'wo']);
const MATERIAL_ISSUE_CODES = new Set(['material-issues', 'material-issue', 'materialissues', 'materialissue', 'mi']);
const PRODUCTION_ENTRY_CODES = new Set(['production-entries', 'production-entry', 'productionentries', 'productionentry', 'pe']);
const USER_REPORT_CODES = new Set(['user-report', 'user_report', 'userreport']);
const ATTENDANCE_REPORT_CODES = new Set(['attendance-report', 'attendance_report', 'attendancereport']);
const PRODUCT_REPORT_CODES = new Set(['product-report', 'product_report', 'productreport']);
const STOCK_IN_REPORT_CODES = new Set(['stock-in-report', 'stock_in_report', 'stockinreport']);
const STOCK_OUT_REPORT_CODES = new Set(['stock-out-report', 'stock_out_report', 'stockoutreport']);
const CURRENT_STOCK_REPORT_CODES = new Set([
  'current-stock-report',
  'current_stock_report',
  'currentstockreport',
  'inventory-report',
]);
const STOCK_LEDGER_REPORT_CODES = new Set([
  'stock-ledger-report',
  'stock_ledger_report',
  'stockledgerreport',
]);
const STOCK_ADJUSTMENT_REPORT_CODES = new Set([
  'stock-adjustment-report',
  'stock_adjustment_report',
  'stockadjustmentreport',
]);

const SETTINGS_REDIRECTS: Record<string, string> = {
  departments: '/settings/departments',
  department: '/settings/departments',
  designations: '/settings/designations',
  designation: '/settings/designations',
  'leave-types': '/settings/leave-types',
  'leave-type': '/settings/leave-types',
  'leave-types-master': '/settings/leave-types',
  holidays: '/settings/holidays',
  holiday: '/settings/holidays',
  announcements: '/settings/announcements',
  announcement: '/settings/announcements',
  customers: '/settings/customers',
  customer: '/settings/customers',
  boms: '/settings/boms',
  bom: '/settings/boms',
  'inventory-categories': '/settings/inventory-categories',
  'inventory-category': '/settings/inventory-categories',
  categories: '/settings/inventory-categories',
  'inventory-units': '/settings/inventory-units',
  'inventory-unit': '/settings/inventory-units',
  units: '/settings/inventory-units',
  'inventory-brands': '/settings/inventory-brands',
  'inventory-brand': '/settings/inventory-brands',
  brands: '/settings/inventory-brands',
  'inventory-warehouses': '/settings/inventory-warehouses',
  'inventory-warehouse': '/settings/inventory-warehouses',
  warehouses: '/settings/inventory-warehouses',
  warehouse: '/settings/inventory-warehouses',
  'inventory-suppliers': '/settings/inventory-suppliers',
  'inventory-supplier': '/settings/inventory-suppliers',
  suppliers: '/settings/inventory-suppliers',
  supplier: '/settings/inventory-suppliers',
  'inventory-taxes': '/settings/inventory-taxes',
  'inventory-tax': '/settings/inventory-taxes',
  taxes: '/settings/inventory-taxes',
  tax: '/settings/inventory-taxes',
  hsn: '/settings/inventory-taxes',
  shifts: '/settings/attendance',
  shift: '/settings/attendance',
};

const resolvePage = (moduleCode?: string, itemCode?: string) => {
  const primary = (itemCode ?? moduleCode ?? '').toLowerCase();
  const settingsPath = SETTINGS_REDIRECTS[primary];
  if (settingsPath) {
    return <Navigate to={settingsPath} replace />;
  }
  if (ROLE_CODES.has(primary)) return <RolesPage />;
  if (USER_CODES.has(primary)) return <UsersPage />;
  if (PERMISSION_CODES.has(primary)) return <RolePermissionsPage />;
  if (DEPARTMENT_CODES.has(primary)) return <Navigate to="/settings/departments" replace />;
  if (DESIGNATION_CODES.has(primary)) return <Navigate to="/settings/designations" replace />;
  if (LEAVE_TYPE_CODES.has(primary)) return <Navigate to="/settings/leave-types" replace />;
  if (LEAVE_CODES.has(primary)) return <LeavePage />;
  if (ATTENDANCE_CODES.has(primary)) return <AttendancePage />;
  if (PRODUCT_CODES.has(primary)) return <ProductsPage />;
  if (STOCK_IN_CODES.has(primary)) return <StockInPage />;
  if (STOCK_OUT_CODES.has(primary)) return <StockOutPage />;
  if (CURRENT_STOCK_CODES.has(primary)) return <CurrentStockPage />;
  if (STOCK_LEDGER_CODES.has(primary)) return <StockLedgerPage />;
  if (STOCK_ADJUSTMENT_CODES.has(primary)) return <StockAdjustmentPage />;
  if (PURCHASE_ORDER_CODES.has(primary)) return <PurchaseOrdersPage />;
  if (GRN_CODES.has(primary)) return <GRNsPage />;
  if (PURCHASE_RETURN_CODES.has(primary)) return <PurchaseReturnsPage />;
  if (SALES_ORDER_CODES.has(primary)) return <SalesOrdersPage />;
  if (DELIVERY_CHALLAN_CODES.has(primary)) return <DeliveryChallansPage />;
  if (SALES_INVOICE_CODES.has(primary)) return <SalesInvoicesPage />;
  if (SALES_RETURN_CODES.has(primary)) return <SalesReturnsPage />;
  if (WORK_ORDER_CODES.has(primary)) return <WorkOrdersPage />;
  if (MATERIAL_ISSUE_CODES.has(primary)) return <MaterialIssuesPage />;
  if (PRODUCTION_ENTRY_CODES.has(primary)) return <ProductionEntriesPage />;
  if (USER_REPORT_CODES.has(primary)) return <UserReportPage />;
  if (ATTENDANCE_REPORT_CODES.has(primary)) return <AttendanceReportPage />;
  if (PRODUCT_REPORT_CODES.has(primary)) return <ProductReportPage />;
  if (STOCK_IN_REPORT_CODES.has(primary)) return <StockInReportPage />;
  if (STOCK_OUT_REPORT_CODES.has(primary)) return <StockOutReportPage />;
  if (CURRENT_STOCK_REPORT_CODES.has(primary)) return <CurrentStockReportPage />;
  if (STOCK_LEDGER_REPORT_CODES.has(primary)) return <StockLedgerReportPage />;
  if (STOCK_ADJUSTMENT_REPORT_CODES.has(primary)) return <StockAdjustmentReportPage />;
  return null;
};

export const ModulePage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode: string; itemCode?: string }>();
  const page = resolvePage(moduleCode, itemCode);

  if (page) return page;

  const title = itemCode
    ? itemCode.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : (moduleCode ?? 'Module').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const Icon = getModuleIcon(moduleCode ?? '');

  return (
    <UserLayout title={title} subtitle="Module workspace">
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        className="rounded-sm p-8 text-center"
      >
        <div
          style={{ backgroundColor: 'var(--color-primary-soft)' }}
          className="w-14 h-14 rounded-sm flex items-center justify-center mx-auto mb-4"
        >
          <Icon style={{ color: 'var(--color-primary)' }} className="w-7 h-7" />
        </div>
        <h2 style={{ color: 'var(--color-text)' }} className="text-xl font-bold mb-2">{title}</h2>
        <p style={{ color: 'var(--color-muted)' }} className="text-sm max-w-md mx-auto">
          This module is enabled for your company. Full functionality will be added here soon.
        </p>
      </div>
    </UserLayout>
  );
};
