import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useModulePermissions } from '../../shared/permissions/PermissionContext';

interface ModulePermissionGuardProps {
  moduleCode: string;
  itemCode?: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  children: ReactNode;
  fallbackTo?: string;
}

export const ModulePermissionGuard = ({
  moduleCode,
  itemCode,
  action,
  children,
  fallbackTo = '/dashboard',
}: ModulePermissionGuardProps) => {
  const perms = useModulePermissions(moduleCode, itemCode);

  if (perms.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted">Checking permissions...</div>
    );
  }

  const allowed =
    action === 'view'
      ? perms.canView
      : action === 'create'
        ? perms.canCreate
        : action === 'edit'
          ? perms.canEdit
          : perms.canDelete;

  if (!allowed) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
};
