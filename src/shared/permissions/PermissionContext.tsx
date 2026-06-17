import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { permissionService } from '../../services/permission.service';
import { canPerformAction, type PermissionAction } from '../utils/permissionMatrix';

interface PermissionState {
  permissions: string[];
  isSuperAdmin: boolean;
  roleCode: string;
  isLoading: boolean;
}

interface PermissionContextValue extends PermissionState {
  can: (moduleCode: string, action: PermissionAction, itemCode?: string) => boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

const emptyState: PermissionState = {
  permissions: [],
  isSuperAdmin: false,
  roleCode: '',
  isLoading: false,
};

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<PermissionState>({ ...emptyState, isLoading: true });

  const clear = useCallback(() => {
    setState({ ...emptyState, isLoading: false });
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      clear();
      return;
    }
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = await permissionService.getMyPermissions();
      setState({
        permissions: data.permissions,
        isSuperAdmin: data.isSuperAdmin,
        roleCode: data.roleCode,
        isLoading: false,
      });
    } catch {
      setState({ ...emptyState, isLoading: false });
    }
  }, [isAuthenticated, clear]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const can = useCallback(
    (moduleCode: string, action: PermissionAction, itemCode?: string) =>
      canPerformAction(state.permissions, state.isSuperAdmin, moduleCode, itemCode, action),
    [state.permissions, state.isSuperAdmin]
  );

  const value = useMemo(
    () => ({
      ...state,
      can,
      refresh,
      clear,
    }),
    [state, can, refresh, clear]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

export const useModulePermissions = (moduleCode?: string, itemCode?: string) => {
  const { can, isLoading, isSuperAdmin } = usePermissions();
  const mod = moduleCode ?? '';
  const item = itemCode;

  return useMemo(
    () => ({
      isLoading,
      isSuperAdmin,
      canView: can(mod, 'view', item),
      canCreate: can(mod, 'create', item),
      canEdit: can(mod, 'edit', item),
      canDelete: can(mod, 'delete', item),
      canImport: can(mod, 'import', item),
      canExport: can(mod, 'export', item),
    }),
    [can, mod, item, isLoading, isSuperAdmin]
  );
};
