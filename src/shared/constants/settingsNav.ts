import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Briefcase,
  CalendarDays,
  CalendarOff,
  Clock,
  CreditCard,
  Megaphone,
  Palette,
  Tag,
  Tags,
  Ruler,
  Warehouse,
  Truck,
  Receipt,
  UserSquare2,
  ClipboardCheck,
} from 'lucide-react';
import { PORTAL_PERMISSION_MODULES } from './portalPermissionModules';

export interface SettingsNavItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  /** When set, user needs view on this module (or any alt) to see the nav link. */
  permission?: { moduleCode: string; itemCode: string };
  altPermissions?: Array<{ moduleCode: string; itemCode: string }>;
}

export interface SettingsNavSection {
  id: string;
  label: string;
  items: SettingsNavItem[];
}

export const SETTINGS_NAV_SECTIONS: SettingsNavSection[] = [
  {
    id: 'general',
    label: 'General',
    items: [
      {
        id: 'appearance',
        label: 'Appearance',
        description: 'Theme, accent color, and display preferences',
        path: '/settings/general',
        icon: Palette,
      },
      {
        id: 'billing',
        label: 'Plan & billing',
        description: 'Current plan, renew, upgrade users, and seat usage',
        path: '/settings/billing',
        icon: CreditCard,
      },
      {
        id: 'attendance',
        label: 'Attendance & shifts',
        description: 'Office hours, working days, and shift templates',
        path: '/settings/attendance',
        icon: Clock,
        permission: PORTAL_PERMISSION_MODULES.attendance,
        altPermissions: [PORTAL_PERMISSION_MODULES.shifts],
      },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    items: [
      {
        id: 'departments',
        label: 'Departments',
        description: 'Organizational departments for employees',
        path: '/settings/departments',
        icon: Building2,
        permission: PORTAL_PERMISSION_MODULES.departments,
      },
      {
        id: 'designations',
        label: 'Designations',
        description: 'Job titles and roles within departments',
        path: '/settings/designations',
        icon: Briefcase,
        permission: PORTAL_PERMISSION_MODULES.designations,
      },
      {
        id: 'leave-types',
        label: 'Leave types',
        description: 'Leave categories and annual allocations',
        path: '/settings/leave-types',
        icon: CalendarDays,
        permission: PORTAL_PERMISSION_MODULES.leaveTypes,
      },
      {
        id: 'holidays',
        label: 'Holidays',
        description: 'Company holiday calendar and recurring public holidays',
        path: '/settings/holidays',
        icon: CalendarOff,
        permission: PORTAL_PERMISSION_MODULES.holidays,
      },
      {
        id: 'announcements',
        label: 'Announcements',
        description: 'Company-wide updates shown on the employee dashboard',
        path: '/settings/announcements',
        icon: Megaphone,
        permission: PORTAL_PERMISSION_MODULES.announcements,
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    items: [
      {
        id: 'inventory-categories',
        label: 'Categories',
        description: 'Product categories for organizing inventory items',
        path: '/settings/inventory-categories',
        icon: Tags,
        permission: PORTAL_PERMISSION_MODULES.inventoryCategories,
      },
      {
        id: 'inventory-units',
        label: 'Units',
        description: 'Measurement units such as pieces, kg, or boxes',
        path: '/settings/inventory-units',
        icon: Ruler,
        permission: PORTAL_PERMISSION_MODULES.inventoryUnits,
      },
      {
        id: 'inventory-brands',
        label: 'Brands',
        description: 'Product brands and manufacturers',
        path: '/settings/inventory-brands',
        icon: Tag,
        permission: PORTAL_PERMISSION_MODULES.inventoryBrands,
      },
      {
        id: 'inventory-warehouses',
        label: 'Warehouses / Locations',
        description: 'Storage locations and warehouse sites',
        path: '/settings/inventory-warehouses',
        icon: Warehouse,
        permission: PORTAL_PERMISSION_MODULES.inventoryWarehouses,
      },
      {
        id: 'inventory-suppliers',
        label: 'Suppliers',
        description: 'Vendors and suppliers for purchasing stock',
        path: '/settings/inventory-suppliers',
        icon: Truck,
        permission: PORTAL_PERMISSION_MODULES.inventorySuppliers,
      },
      {
        id: 'inventory-taxes',
        label: 'Tax / HSN',
        description: 'HSN codes and GST tax rates',
        path: '/settings/inventory-taxes',
        icon: Receipt,
        permission: PORTAL_PERMISSION_MODULES.inventoryTaxes,
      },
      {
        id: 'customers',
        label: 'Customers',
        description: 'Customer master — billing address, GST, credit limit',
        path: '/settings/customers',
        icon: UserSquare2,
        permission: PORTAL_PERMISSION_MODULES.customers,
      },
      {
        id: 'boms',
        label: 'Bill of Materials',
        description: 'Define production recipes for finished goods',
        path: '/settings/boms',
        icon: ClipboardCheck,
        permission: PORTAL_PERMISSION_MODULES.boms,
      },
    ],
  },
];

/** Menu item codes hidden from the main sidebar — managed under Settings instead. */
export const SETTINGS_SIDEBAR_HIDDEN_CODES = new Set([
  'departments',
  'department',
  'designations',
  'designation',
  'leave-types',
  'leave-type',
  'leave-types-master',
  'holidays',
  'holiday',
  'announcements',
  'announcement',
  'shifts',
  'shift',
  'shifts-master',
  'master',
  'masters',
  'inventory-categories',
  'inventory-category',
  'inventory-units',
  'inventory-unit',
  'inventory-brands',
  'inventory-brand',
  'inventory-warehouses',
  'inventory-warehouse',
  'warehouses',
  'warehouse',
  'inventory-suppliers',
  'inventory-supplier',
  'suppliers',
  'supplier',
  'inventory-taxes',
  'inventory-tax',
  'taxes',
  'tax',
  'hsn',
  'customers',
  'customer',
  'boms',
  'bom',
]);
