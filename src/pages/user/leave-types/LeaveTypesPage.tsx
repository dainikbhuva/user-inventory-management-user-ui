import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { LeaveTypeForm, type LeaveTypeFormData } from './LeaveTypeForm';
import { leaveTypeService } from '../../../services/leaveType.service';
import type { PortalLeaveTypeRecord } from '../../../shared/types/leave.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';

type LeaveTypeSortField = 'name' | 'code' | 'maxDaysPerYear' | 'sortOrder' | 'status';

const toFormValue = (item: PortalLeaveTypeRecord): LeaveTypeFormData => ({
  name: item.name,
  code: item.code,
  description: item.description ?? '',
  maxDaysPerYear: String(item.annualAllocation ?? item.maxDaysPerYear ?? 0),
  status: item.status,
  sortOrder: String(item.sortOrder ?? 0),
});

const filterItems = (items: PortalLeaveTypeRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (item) => item.name,
    (item) => item.code,
    (item) => item.description ?? '',
  ]);

const getSortValue = (item: PortalLeaveTypeRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'code':
      return item.code;
    case 'maxDaysPerYear':
      return item.annualAllocation ?? item.maxDaysPerYear ?? 0;
    case 'sortOrder':
      return item.sortOrder ?? 0;
    case 'status':
      return item.status;
    default:
      return item.name;
  }
};

const toPayload = (data: LeaveTypeFormData) => ({
  name: data.name.trim(),
  code: data.code.trim(),
  description: data.description.trim() || undefined,
  maxDaysPerYear: Number(data.maxDaysPerYear) || 0,
  status: data.status,
  sortOrder: Number(data.sortOrder) || 0,
});

export const LeaveTypesPage = ({ embedded = false }: { embedded?: boolean }) => {
  const M = PORTAL_PERMISSION_MODULES.leaveTypes;
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    M.moduleCode,
    M.itemCode
  );

  const [items, setItems] = useState<PortalLeaveTypeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortalLeaveTypeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalLeaveTypeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const table = useClientDataTable({
    items,
    filterFn: useCallback(filterItems, []),
    getSortValue: useCallback(getSortValue, []),
    defaultSortBy: 'name',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await leaveTypeService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load leave types'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (data: LeaveTypeFormData) => {
    await leaveTypeService.create(toPayload(data));
    setIsAddOpen(false);
    toast.success(`Leave type "${data.name.trim()}" created successfully.`);
    await loadData();
  };

  const handleUpdate = async (data: LeaveTypeFormData) => {
    if (!editing) return;
    await leaveTypeService.update(editing.id, toPayload(data));
    setEditing(null);
    toast.success(`Leave type "${data.name.trim()}" updated successfully.`);
    await loadData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await leaveTypeService.delete(deleteTarget.id);
      toast.success(`Leave type "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete leave type'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalLeaveTypeRecord>[] = useMemo(
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
        header: 'Name',
        sortable: true,
        sortKey: 'name',
        render: (row) => <span className="font-medium text-body">{row.name}</span>,
      },
      {
        header: 'Code',
        sortable: true,
        sortKey: 'code',
        render: (row) => <span className="font-mono text-xs text-muted">{row.code}</span>,
      },
      {
        header: 'Annual allocation',
        sortable: true,
        sortKey: 'maxDaysPerYear',
        render: (row) => {
          const days = row.annualAllocation ?? row.maxDaysPerYear ?? 0;
          return <span className="text-sm text-muted">{days > 0 ? days : 'Unlimited'}</span>;
        },
      },
      {
        header: 'Sort',
        sortable: true,
        sortKey: 'sortOrder',
        render: (row) => <span className="text-sm text-muted">{row.sortOrder}</span>,
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        width: '10%',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center justify-center gap-2">
            {canEdit ? (
            <button
              type="button"
              title="Edit"
              onClick={() => setEditing(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
            </button>
            ) : null}
            {canDelete ? (
            <button
              type="button"
              title="Delete"
              onClick={() => setDeleteTarget(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            ) : null}
            {!canEdit && !canDelete ? <span className="text-xs text-muted">—</span> : null}
          </div>
        ),
      },
    ],
    [table.rowIndexOffset, canEdit, canDelete]
  );

  const accessDenied = !permsLoading && !canView;

  const pageContent = accessDenied ? (
    <AccessDeniedPanel moduleLabel="Leave types" />
  ) : (
    <>
      <TableListToolbar
        title="Leave Types"
        subtitle="Define annual, sick, casual, and other leave categories."
        addLabel="Add Leave Type"
        onAdd={canCreate ? () => setIsAddOpen(true) : undefined}
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
          searchPlaceholder="Search by name or code..."
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading leave types...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as LeaveTypeSortField)}
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

      <SlideOver open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Leave Type">
        <LeaveTypeForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} submitLabel="Create" />
      </SlideOver>

      <SlideOver open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Leave Type">
        {editing ? (
          <LeaveTypeForm
            value={toFormValue(editing)}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Update"
          />
        ) : null}
      </SlideOver>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete leave type"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </>
  );

  if (embedded) {
    return (
      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        <div className="border-b border-base px-6 py-4">
          <h2 className="text-lg font-semibold text-body">Leave types</h2>
          <p className="mt-1 text-sm text-muted">Configure leave categories and annual allocations.</p>
        </div>
        <div className="p-6">{pageContent}</div>
      </div>
    );
  }

  return (
    <UserLayout title="Leave Types" subtitle="Configure leave categories and annual limits">
      {pageContent}
    </UserLayout>
  );
};
