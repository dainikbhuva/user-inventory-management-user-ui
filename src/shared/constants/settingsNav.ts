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
]);
