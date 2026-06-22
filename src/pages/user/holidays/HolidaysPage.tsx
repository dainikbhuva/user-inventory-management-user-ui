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
import { Select } from '../../../components/ui/Select';
import { HolidayForm } from './HolidayForm';
import { holidayService } from '../../../services/holiday.service';
import type { HolidayFormData, PortalHolidayRecord } from '../../../shared/types/holiday.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';

type HolidaySortField = 'name' | 'date' | 'holidayType' | 'status';

const currentYear = () => new Date().getFullYear();

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => currentYear() - 1 + index);

const formatDisplayDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const toFormValue = (item: PortalHolidayRecord): HolidayFormData => ({
  name: item.name,
  date: item.date,
  holidayType: item.holidayType,
  isRecurring: item.isRecurring,
  description: item.description ?? '',
  status: item.status,
});

const filterItems = (items: PortalHolidayRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (item) => item.name,
    (item) => item.holidayTypeLabel,
    (item) => item.description ?? '',
    (item) => item.date,
  ]);

const getSortValue = (item: PortalHolidayRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'date':
      return item.date;
    case 'holidayType':
      return item.holidayTypeLabel;
    case 'status':
      return item.status;
    default:
      return item.name;
  }
};

const toPayload = (data: HolidayFormData) => ({
  name: data.name.trim(),
  date: data.date,
  holidayType: data.holidayType,
  isRecurring: data.isRecurring,
  description: data.description.trim() || undefined,
  status: data.status,
});

export const HolidaysPage = ({ embedded = false }: { embedded?: boolean }) => {
  const M = PORTAL_PERMISSION_MODULES.holidays;
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    M.moduleCode,
    M.itemCode
  );

  const [year, setYear] = useState(currentYear());
  const [items, setItems] = useState<PortalHolidayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortalHolidayRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalHolidayRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const table = useClientDataTable({
    items,
    filterFn: useCallback(filterItems, []),
    getSortValue: useCallback(getSortValue, []),
    defaultSortBy: 'date',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await holidayService.getAll(year));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load holidays'));
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (data: HolidayFormData) => {
    await holidayService.create(toPayload(data));
    setIsAddOpen(false);
    toast.success(`Holiday "${data.name.trim()}" created successfully.`);
    await loadData();
  };

  const handleUpdate = async (data: HolidayFormData) => {
    if (!editing) return;
    await holidayService.update(editing.id, toPayload(data));
    setEditing(null);
    toast.success(`Holiday "${data.name.trim()}" updated successfully.`);
    await loadData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await holidayService.delete(deleteTarget.id);
      toast.success(`Holiday "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete holiday'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalHolidayRecord>[] = useMemo(
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
        header: 'Date',
        sortable: true,
        sortKey: 'date',
        render: (row) => (
          <span className="text-sm text-body">
            {formatDisplayDate(row.date)}
            {row.isRecurring ? (
              <span className="ml-2 text-xs text-muted">(yearly)</span>
            ) : null}
          </span>
        ),
      },
      {
        header: 'Type',
        sortable: true,
        sortKey: 'holidayType',
        render: (row) => <span className="text-sm text-muted">{row.holidayTypeLabel}</span>,
      },
      {
        header: 'Recurring',
        render: (row) => (
          <span className="text-sm text-muted">{row.isRecurring ? 'Yes' : 'No'}</span>
        ),
      },
      {
        header: 'Status',
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
    <AccessDeniedPanel moduleLabel="Holidays" />
  ) : (
    <>
      <TableListToolbar
        title="Holidays"
        subtitle="Company holidays block attendance check-in and appear on the calendar."
        addLabel="Add Holiday"
        onAdd={canCreate ? () => setIsAddOpen(true) : undefined}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((open) => !open)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-body">Year</label>
            <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}>
              {YEAR_OPTIONS.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </Select>
          </div>
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
            searchPlaceholder="Search by name or type..."
          />
        </div>
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading holidays...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as HolidaySortField)}
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

      <SlideOver open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Holiday">
        <HolidayForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} submitLabel="Create" />
      </SlideOver>

      <SlideOver open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Holiday">
        {editing ? (
          <HolidayForm
            value={toFormValue(editing)}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Update"
          />
        ) : null}
      </SlideOver>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete holiday"
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
      <div className="overflow-hidden rounded-sm border border-base bg-surface p-6 shadow-sm">
        {pageContent}
      </div>
    );
  }

  return (
    <UserLayout title="Holidays" subtitle="Manage company holiday calendar">
      {pageContent}
    </UserLayout>
  );
};
