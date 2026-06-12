import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserLayout } from '../../../components/layout/Layout';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { roleService } from '../../../services/role.service';
import { permissionService } from '../../../services/permission.service';
import type { PermissionOption, PortalRole } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useTableFilters } from '../../../hooks/useTableFilters';
import { countActiveFilters } from '../../../shared/utils/countActiveFilters';

const DEFAULT_PERMISSION_FILTERS = { search: '' };

export const RolePermissionsPage = () => {
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [options, setOptions] = useState<PermissionOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState('');

  const {
    filterOpen,
    setFilterOpen,
    draftFilters,
    setDraftFilters,
    handleApply,
    handleReset,
  } = useTableFilters(
    { search: appliedSearch },
    DEFAULT_PERMISSION_FILTERS,
    (partial) => setAppliedSearch(String(partial.search ?? '').trim()),
    () => setAppliedSearch('')
  );

  const activeFilterCount = countActiveFilters({ search: appliedSearch }, DEFAULT_PERMISSION_FILTERS);

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
      setSelectedKeys(role.permissions ?? []);
      return;
    }
    permissionService
      .getRolePermissions(selectedRoleId)
      .then(setSelectedKeys)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load role permissions')));
  }, [selectedRoleId, roles]);

  const groupedOptions = useMemo(() => {
    const query = appliedSearch.toLowerCase();
    const filtered = query
      ? options.filter(
          (option) =>
            option.label.toLowerCase().includes(query) ||
            option.key.toLowerCase().includes(query) ||
            option.groupName.toLowerCase().includes(query)
        )
      : options;

    const map = new Map<string, PermissionOption[]>();
    for (const option of filtered) {
      const list = map.get(option.groupName) ?? [];
      list.push(option);
      map.set(option.groupName, list);
    }
    return Array.from(map.entries());
  }, [options, appliedSearch]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const isSuperAdmin = selectedRole?.code === 'super_admin';

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    try {
      setIsSaving(true);
      await permissionService.updateRolePermissions(selectedRoleId, selectedKeys);
      toast.success('Role permissions saved successfully.');
      const updatedRoles = await roleService.getRoles();
      setRoles(updatedRoles);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save permissions'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserLayout title="Role to Permission" subtitle="Control what each role can see in the portal">
      <TableListToolbar
        title="Role to Permission"
        subtitle="Assign module visibility per role. Super Admin always sees everything."
        addLabel="Save"
        showAdd={false}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen((open) => !open)}
        activeFilterCount={activeFilterCount}
        onApply={handleApply}
        onReset={handleReset}
        isApplying={isLoading}
        extraActions={
          !isSuperAdmin && groupedOptions.length > 0 ? (
            <Button type="button" onClick={handleSave} disabled={isSaving || !selectedRoleId}>
              {isSaving ? 'Saving...' : 'Save permissions'}
            </Button>
          ) : undefined
        }
      >
        <FormField label="Search permissions">
          <Input
            value={draftFilters.search}
            onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search by module or permission key"
          />
        </FormField>
      </TableListToolbar>

      <div className="max-w-3xl">
        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft">
          <FormField label="Select role" required>
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
          </FormField>

          {isSuperAdmin && (
            <p className="mt-3 text-sm text-muted">
              Super Admin always has access to all modules in your plan. Permissions cannot be restricted for this role.
            </p>
          )}

          {isLoading && (
            <p className="mt-4 text-sm text-muted">Loading permissions...</p>
          )}

          {!isLoading && options.length === 0 && (
            <p className="mt-4 text-sm text-muted">
              No modules are available in your plan yet. Add module groups to your subscription plan in admin.
            </p>
          )}

          {!isSuperAdmin && groupedOptions.length > 0 && (
            <div className="mt-6 space-y-6">
              {groupedOptions.map(([groupName, items]) => (
                <div key={groupName}>
                  <h3 className="text-sm font-semibold text-body mb-3">{groupName}</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <label
                        key={item.key}
                        className="flex items-start gap-3 rounded-sm border border-base bg-surface px-4 py-3 cursor-pointer transition hover:bg-surface-2"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedKeys.includes(item.key)}
                          onChange={() => toggleKey(item.key)}
                        />
                        <span>
                          <span className="block text-sm font-medium text-body">{item.label}</span>
                          <span className="block text-xs text-muted font-mono">{item.key}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !isSuperAdmin && options.length > 0 && groupedOptions.length === 0 && (
            <p className="mt-4 text-sm text-muted">No permissions match your search.</p>
          )}
        </section>
      </div>
    </UserLayout>
  );
};
