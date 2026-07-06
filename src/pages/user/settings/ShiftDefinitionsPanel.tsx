import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { ShiftForm } from '../shifts/ShiftForm';
import { shiftService } from '../../../services/shift.service';
import type { PortalShiftRecord, ShiftFormData } from '../../../shared/types/shift.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useListTableExport } from '../../../hooks/useListTableExport';

type ShiftSortField = 'name' | 'code' | 'startTime' | 'status';

const toShiftForm = (item: PortalShiftRecord): ShiftFormData => ({
  name: item.name,
  code: item.code,
  startTime: item.startTime,
  endTime: item.endTime,
  breakMinutes: String(item.breakMinutes),
  lateAfterMinutes: String(item.lateAfterMinutes),
  halfDayHours: String(item.halfDayHours),
  description: item.description ?? '',
  status: item.status,
  sortOrder: String(item.sortOrder ?? 0),
});

const toShiftPayload = (data: ShiftFormData) => ({
  name: data.name.trim(),
  code: data.code.trim(),
  startTime: data.startTime,
  endTime: data.endTime,
  breakMinutes: Number(data.breakMinutes) || 0,
  lateAfterMinutes: Number(data.lateAfterMinutes) || 0,
  halfDayHours: Number(data.halfDayHours) || 0,
  description: data.description.trim() || undefined,
  status: data.status,
  sortOrder: Number(data.sortOrder) || 0,
});

const filterShifts = (items: PortalShiftRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (item) => item.name,
    (item) => item.code,
    (item) => item.description ?? '',
  ]);

const getShiftSortValue = (item: PortalShiftRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'code':
      return item.code;
    case 'startTime':
      return item.startTime;
    case 'status':
      return item.status;
    default:
      return item.name;
  }
};

export const ShiftDefinitionsPanel = () => {
  const M = PORTAL_PERMISSION_MODULES.shifts;
  const { canView, canCreate, canEdit, canDelete, canExport } = useModulePermissions(M.moduleCode, M.itemCode);

  const [shifts, setShifts] = useState<PortalShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortalShiftRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalShiftRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const table = useClientDataTable({
    items: shifts,
    filterFn: useCallback(filterShifts, []),
    getSortValue: useCallback(getShiftSortValue, []),
    defaultSortBy: 'name',
  });

  const loadShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      setShifts(await shiftService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load shifts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShifts();
  }, [loadShifts]);

  const handleCreate = async (data: ShiftFormData) => {
    await shiftService.create(toShiftPayload(data));
    setIsAddOpen(false);
    toast.success(`Shift "${data.name.trim()}" created.`);
    await loadShifts();
  };

  const handleUpdate = async (data: ShiftFormData) => {
    if (!editing) return;
    await shiftService.update(editing.id, toShiftPayload(data));
    setEditing(null);
    toast.success(`Shift "${data.name.trim()}" updated.`);
    await loadShifts();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await shiftService.delete(deleteTarget.id);
      toast.success(`Shift "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await loadShifts();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete shift'));
    } finally {
      setIsDeleting(false);
    }
  };

  const shiftColumns: DataTableColumn<PortalShiftRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
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
        csvValue: (row) => row.name,
      },
      {
        header: 'Code',
        sortable: true,
        sortKey: 'code',
        render: (row) => <span className="font-mono text-xs text-muted">{row.code}</span>,
        csvValue: (row) => row.code,
      },
      {
        header: 'Hours',
        sortable: true,
        sortKey: 'startTime',
        render: (row) => (
          <span className="text-sm text-muted">
            {row.startTime} – {row.endTime}
            {row.crossesMidnight ? ' (overnight)' : ''}
          </span>
        ),
        csvValue: (row) =>
          `${row.startTime} - ${row.endTime}${row.crossesMidnight ? ' (overnight)' : ''}`,
      },
      {
        header: 'Late after',
        render: (row) => <span className="text-sm text-muted">{row.lateAfterMinutes} min</span>,
        csvValue: (row) => row.lateAfterMinutes,
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
        csvValue: (row) => row.status,
      },
      {
        header: 'Actions',
        width: '10rem',
        align: 'center',
        render: (row) => (
          <div className="inline-flex flex-nowrap items-center justify-center gap-2">
            {canEdit ? (
            <button
              type="button"
              title="Edit"
              onClick={() => setEditing(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
            </button>
            ) : null}
            {canDelete ? (
            <button
              type="button"
              title="Delete"
              onClick={() => setDeleteTarget(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:text-red-500"
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

  const exportProps = useListTableExport('Shift templates', shiftColumns, table.exportRows, canExport);

  if (!canView) {
    return <AccessDeniedPanel moduleLabel="Shifts" compact />;
  }

  return (
    <div className="p-6">
      <TableListToolbar
        title="Shift templates"
        subtitle="Employees pick their shift on the Attendance page and can change it anytime."
        addLabel="Add shift"
        onAdd={canCreate ? () => setIsAddOpen(true) : undefined}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((open) => !open)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
        {...exportProps}
        exportDisabled={isLoading || exportProps.exportDisabled}
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
          <div className="flex h-48 items-center justify-center text-muted">Loading shifts...</div>
        ) : (
          <>
            <DataTable
              columns={shiftColumns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as ShiftSortField)}
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

      <SlideOver open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add shift">
        <ShiftForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} submitLabel="Create" />
      </SlideOver>

      <SlideOver open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit shift">
        {editing ? (
          <ShiftForm
            value={toShiftForm(editing)}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Update"
          />
        ) : null}
      </SlideOver>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete shift"
        message={deleteTarget ? `Delete shift "${deleteTarget.name}"?` : ''}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  );
};
