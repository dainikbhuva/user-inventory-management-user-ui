import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Save } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PermissionToggle } from '../../../components/common/PermissionToggle';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { roleService } from '../../../services/role.service';
import { permissionService } from '../../../services/permission.service';
import type { PortalRole } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useMenu } from '../../../hooks/useMenu';
import {
  areAllBasesActionEnabled,
  areSomeBasesActionEnabled,
  isActionEnabledForBase,
  keysToMatrix,
  matrixToKeys,
  normalizeMatrixToBases,
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTIONS,
  setMatrixActionForBase,
  setMatrixActionForBases,
  type PermissionAction,
  type PermissionMatrix,
} from '../../../shared/utils/permissionMatrix';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useAuth } from '../../../shared/auth/useAuth';
import {
  buildPermissionMenuTree,
  collectPermissionBasesFromGroup,
  collectPermissionBasesFromModule,
  collectPermissionBasesFromTree,
  type PermissionTreeChild,
  type PermissionTreeGroup,
  type PermissionTreeModule,
} from '../../../shared/utils/permissionMenuTree';

const PERMISSIONS_MODULE = PORTAL_PERMISSION_MODULES.permissions;
const PERMISSIONS_PAGE_KEY = `${PERMISSIONS_MODULE.moduleCode}/${PERMISSIONS_MODULE.itemCode}`;

interface BulkActionCellsProps {
  bases: string[];
  scopeLabel: string;
  isSuperAdmin: boolean;
  matrix: PermissionMatrix;
  onBulkToggle: (bases: string[], action: PermissionAction, enabled: boolean) => void;
  readOnly?: boolean;
  variant?: 'group' | 'module';
}

const PermissionBulkActionCells = ({
  bases,
  scopeLabel,
  isSuperAdmin,
  matrix,
  onBulkToggle,
  readOnly,
  variant = 'module',
}: BulkActionCellsProps) => {
  const rowDisabled = isSuperAdmin || readOnly || bases.length === 0;
  const cellClass =
    variant === 'group'
      ? 'permission-action-cell bg-surface-2/80 py-2'
      : 'permission-action-cell bg-surface-2/60 py-2';

  return (
    <>
      {PERMISSION_ACTIONS.map((action) => {
        const allChecked = areAllBasesActionEnabled(matrix, bases, action);
        const someChecked = areSomeBasesActionEnabled(matrix, bases, action);

        return (
          <td key={action} className={cellClass}>
            <div className="flex flex-col items-center justify-center gap-0.5">
              <PermissionToggle
                checked={isSuperAdmin ? true : allChecked}
                disabled={rowDisabled}
                ariaLabel={`${scopeLabel} all ${PERMISSION_ACTION_LABELS[action]}`}
                onChange={(enabled) => onBulkToggle(bases, action, enabled)}
                className={!isSuperAdmin && someChecked && !allChecked ? 'opacity-70' : undefined}
              />
              {variant === 'group' ? (
                <span className="text-[10px] text-muted">All</span>
              ) : null}
            </div>
          </td>
        );
      })}
    </>
  );
};

interface ActionCellsProps {
  permissionKey: string;
  label: string;
  isSuperAdmin: boolean;
  matrix: PermissionMatrix;
  onToggle: (base: string, action: PermissionAction, enabled: boolean) => void;
  readOnly?: boolean;
}

const PermissionActionCells = ({
  permissionKey,
  label,
  isSuperAdmin,
  matrix,
  onToggle,
  readOnly,
}: ActionCellsProps) => {
  const viewEnabled = isSuperAdmin || isActionEnabledForBase(matrix, permissionKey, 'view');
  const rowDisabled = isSuperAdmin || readOnly;

  return (
    <>
      {PERMISSION_ACTIONS.map((action) => {
        const isView = action === 'view';
        const checked = isSuperAdmin ? true : isActionEnabledForBase(matrix, permissionKey, action);
        const disabled = rowDisabled || (!isView && !viewEnabled);

        return (
          <td key={action} className="permission-action-cell bg-surface py-3">
            <div className="flex items-center justify-center">
              <PermissionToggle
                checked={checked}
                disabled={disabled}
                ariaLabel={`${label} ${PERMISSION_ACTION_LABELS[action]}`}
                onChange={(enabled) => onToggle(permissionKey, action, enabled)}
              />
            </div>
          </td>
        );
      })}
    </>
  );
};

const PermissionChildRow = ({
  child,
  isSuperAdmin,
  matrix,
  onToggle,
  readOnly,
}: {
  child: PermissionTreeChild;
  isSuperAdmin: boolean;
  matrix: PermissionMatrix;
  onToggle: (base: string, action: PermissionAction, enabled: boolean) => void;
  readOnly?: boolean;
}) => (
  <tr className="border-b border-base last:border-b-0 bg-surface-2/20">
    <td className="permission-menu-cell border-r border-base py-3 pl-10 pr-4">
      <p className="text-sm font-medium text-body">{child.label}</p>
      <p className="mt-0.5 text-xs text-muted">Dropdown item</p>
    </td>
    <PermissionActionCells
      permissionKey={child.key}
      label={child.label}
      isSuperAdmin={isSuperAdmin}
      matrix={matrix}
      onToggle={onToggle}
      readOnly={readOnly}
    />
  </tr>
);

const PermissionModuleRows = ({
  groupId,
  module,
  isSuperAdmin,
  matrix,
  onToggle,
  onBulkToggle,
  readOnly,
  expanded,
  onToggleExpand,
}: {
  groupId: string;
  module: PermissionTreeModule;
  isSuperAdmin: boolean;
  matrix: PermissionMatrix;
  onToggle: (base: string, action: PermissionAction, enabled: boolean) => void;
  onBulkToggle: (bases: string[], action: PermissionAction, enabled: boolean) => void;
  readOnly?: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) => {
  if (module.linkType === 'dropdown' && module.children?.length) {
    const childBases = collectPermissionBasesFromModule(module);

    return (
      <>
        <tr className="border-b border-base bg-surface-2/50">
          <td className="permission-menu-cell border-r border-base px-4 py-2">
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex w-full items-center gap-2 rounded-sm py-1.5 text-left text-sm font-semibold text-body hover:text-primary"
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
              <span>{module.label}</span>
            </button>
            <p className="mt-0.5 pl-6 text-xs text-muted">Toggle all items below</p>
          </td>
          <PermissionBulkActionCells
            bases={childBases}
            scopeLabel={module.label}
            isSuperAdmin={isSuperAdmin}
            matrix={matrix}
            onBulkToggle={onBulkToggle}
            readOnly={readOnly}
            variant="module"
          />
        </tr>
        {expanded
          ? module.children.map((child) => (
              <PermissionChildRow
                key={`${groupId}-${child.key}`}
                child={child}
                isSuperAdmin={isSuperAdmin}
                matrix={matrix}
                onToggle={onToggle}
                readOnly={readOnly}
              />
            ))
          : null}
      </>
    );
  }

  return (
    <tr className="border-b border-base last:border-b-0">
      <td className="permission-menu-cell border-r border-base px-4 py-3">
        <p className="font-medium text-body">{module.label}</p>
        <p className="mt-0.5 text-xs text-muted">Direct link</p>
      </td>
      <PermissionActionCells
        permissionKey={module.permissionKey}
        label={module.label}
        isSuperAdmin={isSuperAdmin}
        matrix={matrix}
        onToggle={onToggle}
        readOnly={readOnly}
      />
    </tr>
  );
};

const MobileBulkActions = ({
  title,
  subtitle,
  bases,
  scopeLabel,
  isSuperAdmin,
  matrix,
  onBulkToggle,
  readOnly,
}: {
  title: string;
  subtitle: string;
  bases: string[];
  scopeLabel: string;
  isSuperAdmin: boolean;
  matrix: PermissionMatrix;
  onBulkToggle: (bases: string[], action: PermissionAction, enabled: boolean) => void;
  readOnly?: boolean;
}) => (
  <div className="rounded-sm border border-dashed border-base bg-surface-2/60 p-4">
    <p className="text-sm font-semibold text-body">{title}</p>
    <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      {PERMISSION_ACTIONS.map((action) => {
        const allChecked = areAllBasesActionEnabled(matrix, bases, action);
        const someChecked = areSomeBasesActionEnabled(matrix, bases, action);

        return (
          <div
            key={action}
            className="flex items-center justify-between rounded-sm border border-base bg-surface px-3 py-2"
          >
            <span className="text-xs text-body">All {PERMISSION_ACTION_LABELS[action]}</span>
            <PermissionToggle
              checked={isSuperAdmin ? true : allChecked}
              disabled={isSuperAdmin || readOnly || bases.length === 0}
              ariaLabel={`${scopeLabel} all ${PERMISSION_ACTION_LABELS[action]}`}
              onChange={(enabled) => onBulkToggle(bases, action, enabled)}
              className={!isSuperAdmin && someChecked && !allChecked ? 'opacity-70' : undefined}
            />
          </div>
        );
      })}
    </div>
  </div>
);

const hasViewAccessToPage = (matrix: PermissionMatrix, routePageKey?: string) =>
  isActionEnabledForBase(matrix, PERMISSIONS_PAGE_KEY, 'view') ||
  (routePageKey ? isActionEnabledForBase(matrix, routePageKey, 'view') : false);

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

  const { groups: menuGroups, reload: reloadMenu } = useMenu();
  const rolesRef = useRef<PortalRole[]>([]);
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [options, setOptions] = useState<Awaited<ReturnType<typeof permissionService.getOptions>>>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
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

  const permissionTree = useMemo(
    () => buildPermissionMenuTree(options, menuGroups),
    [options, menuGroups]
  );

  const uiPermissionBases = useMemo(
    () => collectPermissionBasesFromTree(permissionTree),
    [permissionTree]
  );

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
          const raw = keysToMatrix(keys);
          setMatrix(
            uiPermissionBases.length > 0
              ? normalizeMatrixToBases(raw, uiPermissionBases)
              : raw
          );
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
  }, [selectedRoleId, uiPermissionBases]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of permissionTree) {
      for (const mod of group.modules) {
        if (mod.linkType === 'dropdown' && mod.children?.length) {
          next[`${group.id}:${mod.moduleCode}`] = true;
        }
      }
    }
    setExpandedModules((prev) => ({ ...next, ...prev }));
  }, [permissionTree]);

  const isSuperAdmin =
    roles.find((role) => role.id === selectedRoleId)?.code === 'super_admin';

  const handleToggle = (base: string, action: PermissionAction, enabled: boolean) => {
    if (!canEdit || !base) return;
    setMatrix((prev) => setMatrixActionForBase(prev, base, action, enabled));
  };

  const handleBulkToggle = (bases: string[], action: PermissionAction, enabled: boolean) => {
    if (!canEdit || bases.length === 0) return;
    setMatrix((prev) => setMatrixActionForBases(prev, bases, action, enabled));
  };

  const toggleModuleExpand = (groupId: string, moduleCode: string) => {
    const key = `${groupId}:${moduleCode}`;
    setExpandedModules((prev) => ({ ...prev, [key]: !prev[key] }));
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
      const normalized = normalizeMatrixToBases(matrix, uiPermissionBases);
      await permissionService.updateRolePermissions(selectedRoleId, matrixToKeys(normalized));
      toast.success('Role permissions saved successfully.');
      const updatedRoles = await roleService.getRoles();
      setRoles(updatedRoles);
      rolesRef.current = updatedRoles;
      setMatrix(normalized);
      await reloadMenu(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save permissions'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderDesktopTable = () => (
    <table className="permission-matrix w-full text-sm">
      <colgroup>
        <col className="permission-menu-col" />
        {PERMISSION_ACTIONS.map((action) => (
          <col key={action} className="permission-action-col" />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b border-base bg-surface-2">
          <th className="permission-menu-cell border-r border-base px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-body">
            Menu (like sidebar)
          </th>
          {PERMISSION_ACTIONS.map((action) => (
            <th
              key={action}
              className="permission-action-cell py-3 text-center text-xs font-semibold uppercase tracking-wide text-body"
            >
              {PERMISSION_ACTION_LABELS[action]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {permissionTree.map((group) => {
          const groupBases = collectPermissionBasesFromGroup(group);
          const showGroupBulk = groupBases.length > 1;

          return (
            <Fragment key={group.id}>
              {group.name ? (
                <tr className="border-b border-base bg-surface-2">
                  <td colSpan={1 + PERMISSION_ACTIONS.length} className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-2">
                      {group.name}
                    </p>
                  </td>
                </tr>
              ) : null}
              {showGroupBulk ? (
                <tr className="border-b border-base bg-surface-2/70">
                  <td className="permission-menu-cell border-r border-base px-4 py-2">
                    <p className="text-sm font-semibold text-body">
                      {group.name ? `All in ${group.name}` : 'All in section'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">Apply to every menu in this group</p>
                  </td>
                  <PermissionBulkActionCells
                    bases={groupBases}
                    scopeLabel={group.name || 'section'}
                    isSuperAdmin={isSuperAdmin}
                    matrix={matrix}
                    onBulkToggle={handleBulkToggle}
                    readOnly={!canEdit}
                    variant="group"
                  />
                </tr>
              ) : null}
              {group.modules.map((mod) => (
                <PermissionModuleRows
                  key={`${group.id}-${mod.moduleCode}`}
                  groupId={group.id}
                  module={mod}
                  isSuperAdmin={isSuperAdmin}
                  matrix={matrix}
                  onToggle={handleToggle}
                  onBulkToggle={handleBulkToggle}
                  readOnly={!canEdit}
                  expanded={expandedModules[`${group.id}:${mod.moduleCode}`] ?? true}
                  onToggleExpand={() => toggleModuleExpand(group.id, mod.moduleCode)}
                />
              ))}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );

  const renderMobileGroup = (group: PermissionTreeGroup) => {
    const groupBases = collectPermissionBasesFromGroup(group);
    const showGroupBulk = groupBases.length > 1;

    return (
    <section key={group.id} className="space-y-3">
      {group.name ? (
        <div className="rounded-sm border border-base bg-surface-2 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{group.name}</p>
        </div>
      ) : null}
      {showGroupBulk ? (
        <MobileBulkActions
          title={group.name ? `All in ${group.name}` : 'All in section'}
          subtitle="Apply to every menu in this group"
          bases={groupBases}
          scopeLabel={group.name || 'section'}
          isSuperAdmin={isSuperAdmin}
          matrix={matrix}
          onBulkToggle={handleBulkToggle}
          readOnly={!canEdit}
        />
      ) : null}
      {group.modules.map((mod) => {
        const expandKey = `${group.id}:${mod.moduleCode}`;
        const expanded = expandedModules[expandKey] ?? true;

        if (mod.linkType === 'dropdown' && mod.children?.length) {
          const childBases = collectPermissionBasesFromModule(mod);

          return (
            <div key={mod.moduleCode} className="overflow-hidden rounded-sm border border-base">
              <button
                type="button"
                onClick={() => toggleModuleExpand(group.id, mod.moduleCode)}
                className="flex w-full items-center justify-between gap-2 bg-surface-2 px-4 py-3 text-left"
              >
                <span className="font-semibold text-body">{mod.label}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
              {expanded ? (
                <div className="space-y-3 border-t border-base bg-surface p-4">
                  <MobileBulkActions
                    title={`All in ${mod.label}`}
                    subtitle="Apply to every item in this menu"
                    bases={childBases}
                    scopeLabel={mod.label}
                    isSuperAdmin={isSuperAdmin}
                    matrix={matrix}
                    onBulkToggle={handleBulkToggle}
                    readOnly={!canEdit}
                  />
                  {mod.children.map((child) => (
                    <article key={child.key} className="rounded-sm border border-base bg-surface-2/20 p-4">
                      <p className="pl-2 text-sm font-medium text-body">{child.label}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {PERMISSION_ACTIONS.map((action) => {
                          const viewEnabled =
                            isSuperAdmin || isActionEnabledForBase(matrix, child.key, 'view');
                          const checked = isSuperAdmin
                            ? true
                            : isActionEnabledForBase(matrix, child.key, action);
                          const disabled =
                            isSuperAdmin || !canEdit || (action !== 'view' && !viewEnabled);
                          return (
                            <div
                              key={action}
                              className="flex items-center justify-between rounded-sm border border-base px-3 py-2"
                            >
                              <span className="text-xs text-body">
                                {PERMISSION_ACTION_LABELS[action]}
                              </span>
                              <PermissionToggle
                                checked={checked}
                                disabled={disabled}
                                ariaLabel={`${child.label} ${PERMISSION_ACTION_LABELS[action]}`}
                                onChange={(enabled) => handleToggle(child.key, action, enabled)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <article
            key={mod.moduleCode}
            className="rounded-sm border border-base bg-surface p-4 shadow-sm"
          >
            <p className="font-medium text-body">{mod.label}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PERMISSION_ACTIONS.map((action) => {
                const viewEnabled =
                  isSuperAdmin || isActionEnabledForBase(matrix, mod.permissionKey, 'view');
                const checked = isSuperAdmin
                  ? true
                  : isActionEnabledForBase(matrix, mod.permissionKey, action);
                const disabled =
                  isSuperAdmin || !canEdit || (action !== 'view' && !viewEnabled);
                return (
                  <div
                    key={action}
                    className="flex items-center justify-between rounded-sm border border-base px-3 py-2"
                  >
                    <span className="text-xs text-body">{PERMISSION_ACTION_LABELS[action]}</span>
                    <PermissionToggle
                      checked={checked}
                      disabled={disabled}
                      ariaLabel={`${mod.label} ${PERMISSION_ACTION_LABELS[action]}`}
                      onChange={(enabled) => handleToggle(mod.permissionKey, action, enabled)}
                    />
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
    );
  };

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Role to Permission" subtitle="Access restricted">
        <AccessDeniedPanel moduleLabel="Role permissions" />
      </UserLayout>
    );
  }

  const tableBusy = isLoading || isRoleLoading;
  const hasContent = permissionTree.some((g) => g.modules.length > 0);

  return (
    <UserLayout title="Role to Permission" subtitle="Control sidebar access per role">
      <div className="mb-5 pb-16 md:pb-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-body">Sidebar permissions</h2>
            <p className="mt-1 hidden text-sm text-muted sm:block">
              Set sidebar access per menu — use &quot;All&quot; toggles per section or dropdown to
              apply View, Create, and other actions in bulk.
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[220px] md:shrink-0">
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
          {!isSuperAdmin && hasContent && canEdit && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedRoleId}
              className="hidden md:inline-flex md:shrink-0"
            >
              <Save className="mr-2 inline h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save permissions'}
            </Button>
          )}
        </div>
      </div>

      {!isSuperAdmin && hasContent && canEdit && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-base bg-surface p-4 md:hidden"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedRoleId}
            className="w-full"
          >
            <Save className="mr-2 inline h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save permissions'}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {tableBusy ? (
          <div className="flex min-h-[12rem] items-center justify-center text-muted">
            Loading permissions...
          </div>
        ) : options.length === 0 ? (
          <div className="flex min-h-[12rem] items-center justify-center px-6 text-center text-sm text-muted">
            No modules are available in your plan yet. Add module groups to your subscription plan
            in admin.
          </div>
        ) : !hasContent ? (
          <div className="flex min-h-[12rem] items-center justify-center text-sm text-muted">
            No menu items available.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">{renderDesktopTable()}</div>

            <div className="space-y-6 p-4 md:hidden">
              {permissionTree.map((group) => renderMobileGroup(group))}
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
