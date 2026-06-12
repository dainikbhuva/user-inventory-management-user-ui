import { useParams } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { getModuleIcon } from '../../../shared/utils/moduleIcons';
import { RolesPage } from '../roles/RolesPage';
import { UsersPage } from '../users/UsersPage';
import { RolePermissionsPage } from '../role-permissions/RolePermissionsPage';

const ROLE_CODES = new Set(['roles', 'role']);
const USER_CODES = new Set(['users', 'user']);
const PERMISSION_CODES = new Set(['role-permissions', 'role-to-permission', 'permissions', 'permission']);

const resolvePage = (moduleCode?: string, itemCode?: string) => {
  const primary = (itemCode ?? moduleCode ?? '').toLowerCase();
  if (ROLE_CODES.has(primary)) return <RolesPage />;
  if (USER_CODES.has(primary)) return <UsersPage />;
  if (PERMISSION_CODES.has(primary)) return <RolePermissionsPage />;
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
