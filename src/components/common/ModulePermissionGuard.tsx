import type { ReactNode } from 'react';
import { useModulePermissions } from '../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from './AccessDeniedPanel';

interface ModulePermissionGuardProps {
  moduleCode: string;
  itemCode?: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  moduleLabel?: string;
  children: ReactNode;
}

export const ModulePermissionGuard = ({
  moduleCode,
  itemCode,
  action,
  moduleLabel,
  children,
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
    const label = moduleLabel ?? itemCode ?? moduleCode;
    const actionLabel =
      action === 'view' ? 'view' : action === 'create' ? 'create' : action === 'edit' ? 'edit' : 'delete';
    return (
      <AccessDeniedPanel
        moduleLabel={label}
        message={`You do not have permission to ${actionLabel} ${label}. Contact your company admin if you need access.`}
      />
    );
  }

  return <>{children}</>;
};
