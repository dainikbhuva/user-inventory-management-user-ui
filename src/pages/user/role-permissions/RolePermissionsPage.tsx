import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Shield } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PermissionToggle } from '../../../components/common/PermissionToggle';
import { roleService } from '../../../services/role.service';
import { permissionService } from '../../../services/permission.service';
import type { PermissionOption, PortalRole } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useMenu } from '../../../hooks/useMenu';
import { menuService } from '../../../services/menu.service';
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

export const RolePermissionsPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const M = PORTAL_PERMISSION_MODULES.permissions;
  const { canView, canEdit, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? M.moduleCode,
    itemCode ?? M.itemCode
  );

  const { reload: reloadMenu } = useMenu();
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [options, setOptions] = useState<PermissionOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadBase = useCallback(async () => {
    try {
      setIsLoading(true);
      const [roleList, permissionOptions] = await Promise.all([
        roleService.getRoles(),
        permissionService.getOptions(),
      ]);
      setRoles(roleList);
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
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (!selectedRoleId) return;
    const role = roles.find((item) => item.id === selectedRoleId);
    if (role) {
      setMatrix(keysToMatrix(role.permissions ?? []));
      return;
    }
    permissionService
      .getRolePermissions(selectedRoleId)
      .then((keys) => setMatrix(keysToMatrix(keys)))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load role permissions')));
  }, [selectedRoleId, roles]);

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
    if (!canEdit) return;
    setMatrix((prev) => setMatrixAction(prev, base, action, enabled));
  };

  const handleSave = async () => {
    if (!selectedRoleId || !canEdit) return;
    try {
      setIsSaving(true);
      await permissionService.updateRolePermissions(selectedRoleId, matrixToKeys(matrix));
      toast.success('Role permissions saved successfully.');
      const updatedRoles = await roleService.getRoles();
      setRoles(updatedRoles);
      menuService.clearCache();
      await reloadMenu();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save permissions'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Role to Permission" subtitle="Access restricted">
        <div className="flex h-48 items-center justify-center rounded-sm border border-base bg-surface text-muted">
          You do not have permission to manage role permissions.
        </div>
      </UserLayout>
    );
  }

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
              disabled={isLoading}
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
            Super Admin always has full access to all modules. Permissions cannot be restricted for this role.
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
            disabled={isLoading || options.length === 0}
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

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted">Loading permissions...</div>
        ) : options.length === 0 ? (
          <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-muted">
            No modules are available in your plan yet. Add module groups to your subscription plan in admin.
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted">
            No menu items match the selected module filter.
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block">
              <div className="theme-scrollbar overflow-x-auto">
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
              <p className="hidden border-t border-base px-4 py-2 text-xs text-muted md:block xl:hidden">
                Scroll horizontally to see all permission columns.
              </p>
            </div>

            {/* Mobile card layout */}
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
                        const checked = isSuperAdmin ? true : isActionEnabled(matrix, row.key, action);
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
