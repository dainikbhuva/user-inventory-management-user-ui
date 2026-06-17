import { useParams, Navigate } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { getModuleIcon } from '../../../shared/utils/moduleIcons';
import { RolesPage } from '../roles/RolesPage';
import { UsersPage } from '../users/UsersPage';
import { RolePermissionsPage } from '../role-permissions/RolePermissionsPage';
import { LeavePage } from '../leave/LeavePage';
import { AttendancePage } from '../attendance/AttendancePage';

const ROLE_CODES = new Set(['roles', 'role']);
const USER_CODES = new Set(['users', 'user']);
const PERMISSION_CODES = new Set(['role-permissions', 'role-to-permission', 'permissions', 'permission']);
const DEPARTMENT_CODES = new Set(['departments', 'department']);
const DESIGNATION_CODES = new Set(['designations', 'designation']);
const LEAVE_TYPE_CODES = new Set(['leave-types', 'leave-type', 'leave-types-master']);
const LEAVE_CODES = new Set(['leave', 'leaves', 'leave-requests', 'leave-request']);
const ATTENDANCE_CODES = new Set(['attendance', 'attendances']);

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
