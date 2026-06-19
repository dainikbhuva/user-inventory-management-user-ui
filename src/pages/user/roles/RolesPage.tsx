import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { RoleForm } from './RoleForm';
import { roleService } from '../../../services/role.service';
import type { PortalRole } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

type RoleSortField = 'name' | 'code' | 'type' | 'status' | 'createdAt';

const filterRoles = (items: PortalRole[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (role) => role.name,
    (role) => role.code,
  ]);

const getRoleSortValue = (role: PortalRole, sortKey: string): string | number => {
  switch (sortKey) {
    case 'code':
      return role.code;
    case 'type':
      return role.isSystem ? 'system' : 'custom';
    case 'status':
      return role.status;
    case 'createdAt':
      return role.createdAt ? new Date(role.createdAt).getTime() : 0;
    default:
      return role.name;
  }
};

export const RolesPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const permMod = moduleCode ?? PORTAL_PERMISSION_MODULES.roles.moduleCode;
  const permItem = itemCode ?? PORTAL_PERMISSION_MODULES.roles.itemCode;
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    permMod,
    permItem
  );

  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortalRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(filterRoles, []);
  const sortFn = useCallback(getRoleSortValue, []);

  const table = useClientDataTable({
    items: roles,
    filterFn,
    getSortValue: sortFn,
    defaultSortBy: 'name',
  });

  const loadRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setRoles(await roleService.getRoles());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load roles'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleCreate = async (data: { name: string; code: string; status: 'active' | 'inactive' }) => {
    await roleService.createRole({
      name: data.name.trim(),
      code: data.code.trim(),
      status: data.status,
    });
    setIsAddOpen(false);
    toast.success(`Role "${data.name.trim()}" created successfully.`);
    await loadRoles();
  };

  const handleUpdate = async (data: { name: string; code: string; status: 'active' | 'inactive' }) => {
    if (!editing) return;
    await roleService.updateRole(editing.id, {
      name: data.name.trim(),
      code: data.code.trim(),
      status: data.status,
    });
    setEditing(null);
    toast.success(`Role "${data.name.trim()}" updated successfully.`);
    await loadRoles();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await roleService.deleteRole(deleteTarget.id);
      toast.success(`Role "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadRoles();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete role'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalRole>[] = useMemo(
    () => [
      {
        header: '#',
        width: '6%',
        align: 'center',
        render: (_row, index) => (
          <span className="text-muted tabular-nums">{table.rowIndexOffset + index + 1}</span>
        ),
      },
      {
        header: 'Name',
        accessor: 'name',
        width: '22%',
        sortable: true,
        sortKey: 'name',
        render: (row) => <span className="font-medium text-body">{row.name}</span>,
      },
      {
        header: 'Code',
        accessor: 'code',
        width: '18%',
        sortable: true,
        sortKey: 'code',
        render: (row) => <span className="font-mono text-sm text-muted">{row.code}</span>,
      },
      {
        header: 'Type',
        width: '12%',
        sortable: true,
        sortKey: 'type',
        render: (row) => (
          <span className="text-xs font-medium text-muted">
            {row.code === 'super_admin' ? 'Protected' : 'Company'}
          </span>
        ),
      },
      {
        header: 'Status',
        accessor: 'status',
        width: '12%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: 'Created',
        accessor: 'createdAt',
        width: '14%',
        sortable: true,
        sortKey: 'createdAt',
        render: (row) => (
          <span className="text-muted tabular-nums text-sm">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        header: 'Actions',
        width: '12%',
        align: 'center',
        render: (row) => {
          const isSuperAdminRole = row.code === 'super_admin';
          if (isSuperAdminRole) {
            return <span className="text-xs text-muted">Locked</span>;
          }
          return (
            <div className="inline-flex items-center justify-center gap-2">
              {canEdit ? (
              <button
                type="button"
                title="Edit role"
                onClick={() => setEditing(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
              ) : null}
              {canDelete ? (
              <button
                type="button"
                title="Delete role"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              ) : null}
              {!canEdit && !canDelete ? <span className="text-xs text-muted">—</span> : null}
            </div>
          );
        },
      },
    ],
    [table.rowIndexOffset, canEdit, canDelete]
  );

  const isFormOpen = isAddOpen || Boolean(editing);

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Roles" subtitle="Access restricted">
        <AccessDeniedPanel moduleLabel="Roles" />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Roles" subtitle="Manage company roles">
      <TableListToolbar
        title="Roles"
        subtitle="All roles belong to your company. Super Admin is auto-created; add more roles with any code you need."
        addLabel="Add Role"
        onAdd={
          canCreate
            ? () => {
                setEditing(null);
                setIsAddOpen(true);
              }
            : undefined
        }
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((open) => !open)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
      >
        <SearchStatusFilters
          search={table.draftFilters.search}
          status={table.draftFilters.status}
          onSearchChange={(search) => table.setDraftFilters((prev) => ({ ...prev, search }))}
          onStatusChange={(status) =>
            table.setDraftFilters((prev) => ({
              ...prev,
              status: status as SearchStatusFilterValues['status'],
            }))
          }
          searchPlaceholder="Search by name or code"
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading roles...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as RoleSortField)}
              rowIndexOffset={table.rowIndexOffset}
            />
            <div className="border-t border-base px-5 py-4">
              <Pagination
                currentPage={table.currentPage}
                totalPages={table.totalPages}
                totalItems={table.totalItems}
                pageSize={table.pageSize}
                onPageChange={table.setCurrentPage}
                onPageSizeChange={table.setPageSize}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete role"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="OK"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />

      <SlideOver
        open={isFormOpen}
        title={editing ? 'Edit Role' : 'Add Role'}
        description={editing ? 'Update role details.' : 'Create a new role for your company.'}
        onClose={() => {
          setIsAddOpen(false);
          setEditing(null);
        }}
        footer={null}
      >
        <RoleForm
          key={editing?.id ?? 'create'}
          value={
            editing
              ? { name: editing.name, code: editing.code, status: editing.status }
              : undefined
          }
          isSystem={editing?.isSystem}
          onCancel={() => {
            setIsAddOpen(false);
            setEditing(null);
          }}
          onSubmit={editing ? handleUpdate : handleCreate}
          submitLabel={editing ? 'Update role' : 'Create role'}
        />
      </SlideOver>
    </UserLayout>
  );
};
