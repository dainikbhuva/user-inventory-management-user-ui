import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Shield } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PermissionToggle } from '../../../components/common/PermissionToggle';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { roleService } from '../../../services/role.service';
import { permissionService } from '../../../services/permission.service';
import type { PermissionOption, PortalRole } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useMenu } from '../../../hooks/useMenu';
import {
  isActionEnabled,
  keysToMatrix,
  matrixToKeys,
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  setMatrixAction,
  type PermissionAction,
  type PermissionMatrix,
} from '../../../shared/utils/permissionMatrix';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useAuth } from '../../../shared/auth/useAuth';

const PERMISSIONS_MODULE = PORTAL_PERMISSION_MODULES.permissions;
const PERMISSIONS_PAGE_KEY = `${PERMISSIONS_MODULE.moduleCode}/${PERMISSIONS_MODULE.itemCode}`;

const LINK_TYPE_LABELS: Record<PermissionOption['linkType'], string> = {
  'module-direct': 'Direct',
  'module-dropdown': 'Dropdown',
  'dropdown-item': 'Menu item',
};

const MenuCell = ({ row }: { row: PermissionOption }) => (
  <div className="min-w-0 space-y-1.5">
    <p className="font-medium leading-snug text-body">{row.label}</p>
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <span className="truncate">{row.groupName}</span>
      <span aria-hidden>·</span>
      <span className="truncate">{row.moduleName}</span>
      <span className="shrink-0 rounded-sm border border-base bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        {LINK_TYPE_LABELS[row.linkType]}
      </span>
    </div>
  </div>
);

interface PermissionRowProps {
  row: PermissionOption;
  isSuperAdmin: boolean;
  matrix: PermissionMatrix;
  onToggle: (base: string, action: PermissionAction, enabled: boolean) => void;
  zebra?: boolean;
  readOnly?: boolean;
}

const PermissionRowCells = ({ row, isSuperAdmin, matrix, onToggle, zebra, readOnly }: PermissionRowProps) => {
  const viewEnabled = isSuperAdmin || isActionEnabled(matrix, row.key, 'view');
  const rowDisabled = isSuperAdmin || readOnly;

  return (
    <>
      <td
        className={`permission-menu-cell border-r border-base px-4 py-3 ${
          zebra ? 'bg-surface-2/40' : 'bg-surface'
        }`}
      >
        <MenuCell row={row} />
      </td>
      {PERMISSION_ACTIONS.map((action) => {
        const isView = action === 'view';
        const checked = isSuperAdmin ? true : isActionEnabled(matrix, row.key, action);
        const disabled = rowDisabled || (!isView && !viewEnabled);

        return (
          <td
            key={action}
            className={`permission-action-cell py-3 ${zebra ? 'bg-surface-2/40' : 'bg-surface'}`}
          >
            <div className="flex items-center justify-center">
              <PermissionToggle
                checked={checked}
                disabled={disabled}
                ariaLabel={`${row.label} ${PERMISSION_ACTION_LABELS[action]}`}
                onChange={(enabled) => onToggle(row.key, action, enabled)}
              />
            </div>
          </td>
        );
      })}
    </>
  );
};

const hasViewAccessToPage = (matrix: PermissionMatrix, routePageKey?: string) =>
  isActionEnabled(matrix, PERMISSIONS_PAGE_KEY, 'view') ||
  (routePageKey ? isActionEnabled(matrix, routePageKey, 'view') : false);

const RolePermissionsPageContent = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode: string; itemCode?: string }>();
  const routePageKey = itemCode ? `${moduleCode}/${itemCode}` : moduleCode;

  const { user } = useAuth();
  const routePerms = useModulePermissions(moduleCode, itemCode);
  const catalogPerms = useModulePermissions(
    PERMISSIONS_MODULE.moduleCode,
    PERMISSIONS_MODULE.itemCode
  );

  const viewerIsSuperAdmin = routePerms.isSuperAdmin || catalogPerms.isSuperAdmin;
  const permsLoading = routePerms.isLoading || catalogPerms.isLoading;
  const canView = routePerms.canView || catalogPerms.canView || viewerIsSuperAdmin;
  const canEdit = routePerms.canEdit || catalogPerms.canEdit || viewerIsSuperAdmin;

  const { reload: reloadMenu } = useMenu();
  const rolesRef = useRef<PortalRole[]>([]);
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [options, setOptions] = useState<PermissionOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  rolesRef.current = roles;

  const loadBase = useCallback(async () => {
    try {
      setIsLoading(true);
      const [roleList, permissionOptions] = await Promise.all([
        roleService.getRoles(),
        permissionService.getOptions(),
      ]);
      setRoles(roleList);
      rolesRef.current = roleList;
      setOptions(permissionOptions);
      if (roleList.length > 0) {
        setSelectedRoleId((prev) => prev || roleList[0].id);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (!selectedRoleId) return;

    let cancelled = false;

    const loadRoleMatrix = async () => {
      setIsRoleLoading(true);
      try {
        const role = rolesRef.current.find((item) => item.id === selectedRoleId);
        const keys =
          role?.permissions ??
          (await permissionService.getRolePermissions(selectedRoleId));

        if (!cancelled) {
          setMatrix(keysToMatrix(keys));
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Failed to load role permissions'));
        }
      } finally {
        if (!cancelled) {
          setIsRoleLoading(false);
        }
      }
    };

    void loadRoleMatrix();

    return () => {
      cancelled = true;
    };
  }, [selectedRoleId]);

  const moduleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of options) {
      if (!map.has(option.moduleCode)) {
        map.set(option.moduleCode, option.moduleName);
      }
    }
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [options]);

  const visibleRows = useMemo(() => {
    const rows = [...options].sort((a, b) => {
      const group = a.groupName.localeCompare(b.groupName);
      if (group !== 0) return group;
      const module = a.moduleName.localeCompare(b.moduleName);
      if (module !== 0) return module;
      return a.label.localeCompare(b.label);
    });
    if (moduleFilter === 'all') return rows;
    return rows.filter((row) => row.moduleCode === moduleFilter);
  }, [options, moduleFilter]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const isSuperAdmin = selectedRole?.code === 'super_admin';

  const handleToggle = (base: string, action: PermissionAction, enabled: boolean) => {
    if (!canEdit || !base) return;
    setMatrix((prev) => setMatrixAction(prev, base, action, enabled));
  };

  const handleSave = async () => {
    if (!selectedRoleId || !canEdit) return;

    const editingOwnRole = user?.role?.id === selectedRoleId;
    if (editingOwnRole && !viewerIsSuperAdmin && !hasViewAccessToPage(matrix, routePageKey)) {
      toast.error('You cannot remove view access to Role permissions from your own role.');
      return;
    }

    try {
      setIsSaving(true);
      await permissionService.updateRolePermissions(selectedRoleId, matrixToKeys(matrix));
      toast.success('Role permissions saved successfully.');
      const updatedRoles = await roleService.getRoles();
      setRoles(updatedRoles);
      rolesRef.current = updatedRoles;
      await reloadMenu(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save permissions'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Role to Permission" subtitle="Access restricted">
        <div className="flex min-h-[min(50vh,20rem)] flex-col items-center justify-center rounded-sm border border-base bg-surface px-6 py-12 text-center">
          <Shield className="mb-3 h-10 w-10 text-muted" />
          <p className="text-body font-medium">Access restricted</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            You do not have permission to manage role permissions. Contact your Super Admin if you
            need access.
          </p>
        </div>
      </UserLayout>
    );
  }

  const tableBusy = isLoading || isRoleLoading;

  return (
    <UserLayout title="Role to Permission" subtitle="Control module access and actions per role">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-body">Permissions matrix</h2>
          <p className="mt-1 text-sm text-muted">
            Select a role and configure view, create, edit, and other actions for each menu item.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
          <div className="w-full sm:min-w-[220px] sm:flex-1 lg:flex-none">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
              Role
            </label>
            <Select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={tableBusy}
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.code})
                </option>
              ))}
            </Select>
          </div>
          {!isSuperAdmin && visibleRows.length > 0 && canEdit && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedRoleId}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 inline h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save permissions'}
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="mb-4 flex items-start gap-3 rounded-sm border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-body">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Super Admin always has full access to all modules. Permissions cannot be restricted for
            this role.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Module filter
          </label>
          <Select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            disabled={tableBusy || options.length === 0}
          >
            <option value="all">All modules</option>
            {moduleOptions.map((module) => (
              <option key={module.code} value={module.code}>
                {module.name}
              </option>
            ))}
          </Select>
        </div>
        {selectedRole && (
          <p className="text-sm text-muted">
            Editing permissions for <span className="font-medium text-body">{selectedRole.name}</span>
          </p>
        )}
      </div>

      <div className="rounded-sm border border-base bg-surface shadow-sm">
        {tableBusy ? (
          <div className="flex min-h-[12rem] items-center justify-center text-muted">
            Loading permissions...
          </div>
        ) : options.length === 0 ? (
          <div className="flex min-h-[12rem] items-center justify-center px-6 text-center text-sm text-muted">
            No modules are available in your plan yet. Add module groups to your subscription plan in
            admin.
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex min-h-[12rem] items-center justify-center text-sm text-muted">
            No menu items match the selected module filter.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="permission-matrix text-sm">
                <colgroup>
                  <col style={{ width: '28%' }} />
                  {PERMISSION_ACTIONS.map((action) => (
                    <col key={action} style={{ width: '10.28%' }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b border-base bg-surface-2">
                    <th className="permission-menu-cell border-r border-base px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-body">
                      Menu
                    </th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="permission-action-cell py-3 text-center text-xs font-semibold uppercase tracking-wide text-body"
                      >
                        <span className="block leading-tight">{PERMISSION_ACTION_LABELS[action]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr key={row.key} className="border-b border-base last:border-b-0">
                      <PermissionRowCells
                        row={row}
                        isSuperAdmin={isSuperAdmin}
                        matrix={matrix}
                        onToggle={handleToggle}
                        zebra={index % 2 === 1}
                        readOnly={!canEdit}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {visibleRows.map((row) => {
                const viewEnabled = isSuperAdmin || isActionEnabled(matrix, row.key, 'view');
                const rowDisabled = isSuperAdmin || !canEdit;

                return (
                  <article
                    key={row.key}
                    className="rounded-sm border border-base bg-surface-2/30 p-4 shadow-sm"
                  >
                    <MenuCell row={row} />
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {PERMISSION_ACTIONS.map((action) => {
                        const isView = action === 'view';
                        const checked = isSuperAdmin
                          ? true
                          : isActionEnabled(matrix, row.key, action);
                        const disabled = rowDisabled || (!isView && !viewEnabled);

                        return (
                          <div
                            key={action}
                            className="flex items-center justify-between gap-2 rounded-sm border border-base bg-surface px-3 py-2"
                          >
                            <span className="text-xs font-medium text-body">
                              {PERMISSION_ACTION_LABELS[action]}
                            </span>
                            <PermissionToggle
                              checked={checked}
                              disabled={disabled}
                              ariaLabel={`${row.label} ${PERMISSION_ACTION_LABELS[action]}`}
                              onChange={(enabled) => handleToggle(row.key, action, enabled)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export const RolePermissionsPage = () => (
  <ErrorBoundary title="Role permissions failed to load">
    <RolePermissionsPageContent />
  </ErrorBoundary>
);
