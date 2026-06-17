import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { portalUserService } from '../../../services/user.service';
import type { PortalUserRecord } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import { getEmployeeTypeLabel } from '../../../shared/constants/employeeType';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useAuth } from '../../../shared/auth/useAuth';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';

type UserSortField =
  | 'name'
  | 'employeeCode'
  | 'email'
  | 'role'
  | 'department'
  | 'employeeType'
  | 'reportingManager'
  | 'status'
  | 'createdAt';

const filterUsers = (items: PortalUserRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (user) => user.name,
    (user) => user.firstName,
    (user) => user.lastName,
    (user) => user.employeeCode,
    (user) => user.email,
    (user) => user.phone ?? '',
    (user) => user.role.name,
    (user) => user.department ?? '',
    (user) => user.designation ?? '',
    (user) => getEmployeeTypeLabel(user.employeeType),
    (user) => user.reportingManager?.name ?? '',
  ]);

const getUserSortValue = (user: PortalUserRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'employeeCode':
      return user.employeeCode;
    case 'phone':
      return user.phone ?? '';
    case 'email':
      return user.email;
    case 'role':
      return user.role.name;
    case 'department':
      return user.department ?? '';
    case 'employeeType':
      return getEmployeeTypeLabel(user.employeeType);
    case 'reportingManager':
      return user.reportingManager?.name ?? '';
    case 'status':
      return user.status;
    case 'createdAt':
      return user.createdAt ? new Date(user.createdAt).getTime() : 0;
    default:
      return user.name;
  }
};

export const UsersPage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode } = useParams<{ moduleCode: string; itemCode: string }>();
  const basePath = `/${moduleCode}/${itemCode}`;
  const { user: authUser } = useAuth();
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    moduleCode,
    itemCode
  );

  const [users, setUsers] = useState<PortalUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PortalUserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(filterUsers, []);
  const sortFn = useCallback(getUserSortValue, []);

  const table = useClientDataTable({
    items: users,
    filterFn,
    getSortValue: sortFn,
    defaultSortBy: 'name',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setUsers(await portalUserService.getUsers());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await portalUserService.deleteUser(deleteTarget.id);
      toast.success(`User "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete user'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalUserRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '5%',
        align: 'center',
        render: (_row, index) => (
          <span className="text-muted tabular-nums">{table.rowIndexOffset + index + 1}</span>
        ),
      },
      {
        header: 'Emp. code',
        width: '10%',
        sortable: true,
        sortKey: 'employeeCode',
        render: (row) => <span className="font-mono text-xs text-muted">{row.employeeCode}</span>,
      },
      {
        header: 'Name',
        width: '13%',
        sortable: true,
        sortKey: 'name',
        render: (row) => <span className="font-medium text-body">{row.name}</span>,
      },
      {
        header: 'Email',
        width: '14%',
        sortable: true,
        sortKey: 'email',
        render: (row) => <span className="text-sm text-muted">{row.email}</span>,
      },
      {
        header: 'Role',
        width: '9%',
        sortable: true,
        sortKey: 'role',
        render: (row) => <span className="text-sm text-body">{row.role.name}</span>,
      },
      {
        header: 'Emp. type',
        width: '9%',
        sortable: true,
        sortKey: 'employeeType',
        render: (row) => (
          <span className="text-sm text-muted">{getEmployeeTypeLabel(row.employeeType)}</span>
        ),
      },
      {
        header: 'Reporting manager',
        width: '12%',
        sortable: true,
        sortKey: 'reportingManager',
        render: (row) => (
          <span className="text-sm text-muted">{row.reportingManager?.name ?? '—'}</span>
        ),
      },
      {
        header: 'Department',
        width: '10%',
        sortable: true,
        sortKey: 'department',
        render: (row) => <span className="text-sm text-muted">{row.department || '—'}</span>,
      },
      {
        header: 'Status',
        width: '8%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        width: '10rem',
        align: 'center',
        render: (row) => (
          <div className="inline-flex flex-nowrap items-center justify-center gap-2">
            {canView ? (
              <button
                type="button"
                title="View user"
                onClick={() => navigate(`${basePath}/${row.id}`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Eye className="h-4 w-4" />
              </button>
            ) : null}
            {canEdit ? (
              <button
                type="button"
                title="Edit user"
                onClick={() => navigate(`${basePath}/${row.id}/edit`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete && row.id !== authUser?.id ? (
              <button
                type="button"
                title="Delete user"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [table.rowIndexOffset, navigate, basePath, canView, canEdit, canDelete, authUser?.id]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Users" subtitle="Access restricted">
        <div className="flex h-48 items-center justify-center rounded-sm border border-base bg-surface text-muted">
          You do not have permission to view users.
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Users" subtitle="Manage company portal users">
      <TableListToolbar
        title="Users"
        subtitle="Add employees with auto-generated passwords emailed on create."
        addLabel="Add User"
        onAdd={canCreate ? () => navigate(`${basePath}/new`) : undefined}
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
          searchPlaceholder="Search by name, email, employee code, role..."
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading users...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as UserSortField)}
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
        title="Delete user"
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
    </UserLayout>
  );
};
