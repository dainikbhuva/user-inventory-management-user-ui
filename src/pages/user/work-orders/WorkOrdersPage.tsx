import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { workOrderService } from '../../../services/workOrder.service';
import type { WorkOrderRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';

const LIST_PATH = '/manufacturing/work-orders';
const PERM = PORTAL_PERMISSION_MODULES.workOrders;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export const WorkOrdersPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<WorkOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WorkOrderRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: WorkOrderRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [(r) => r.workOrderNumber]),
    []
  );
  const getSortValue = useCallback((row: WorkOrderRecord, sortKey: string) => {
    if (sortKey === 'workOrderDate') return row.workOrderDate ?? '';
    if (sortKey === 'status') return row.status;
    return row.workOrderNumber;
  }, []);

  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'workOrderDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await workOrderService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load work orders')); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await workOrderService.delete(deleteTarget.id);
      toast.success(`Work order "${deleteTarget.workOrderNumber}" deleted.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete work order')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<WorkOrderRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_row, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'WO #', width: '14%', sortable: true, sortKey: 'workOrderNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.workOrderNumber}</button> },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'workOrderDate', render: (row) => formatDate(row.workOrderDate) },
    { header: 'Planned Qty', width: '10%', align: 'right', render: (row) => <span className="tabular-nums">{row.plannedQty}</span> },
    { header: 'Produced', width: '10%', align: 'right', render: (row) => <span className="tabular-nums text-muted">{row.producedQty}</span> },
    { header: 'Scheduled', width: '12%', render: (row) => formatDate(row.scheduledDate) },
    { header: 'Status', width: '10%', sortable: true, sortKey: 'status', render: (row) => <ManufacturingStatusBadge status={row.status} /> },
    { header: 'Actions', width: '12%', align: 'center',
      render: (row) => (
        <div className="inline-flex items-center justify-center gap-2">
          <button type="button" title="View" onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary">
            <Eye className="h-4 w-4" />
          </button>
          {canDelete && row.status === 'draft' ? (
            <button type="button" title="Delete" onClick={() => setDeleteTarget(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ], [table.rowIndexOffset, canDelete, navigate]);

  if (!permsLoading && !canView) {
    return <UserLayout title="Work Orders" subtitle="Plan and track production runs."><AccessDeniedPanel moduleLabel="Work Orders" /></UserLayout>;
  }

  return (
    <UserLayout title="Work Orders" subtitle="Plan and track production runs.">
      <TableListToolbar
        title="Work Orders"
        subtitle="Plan and track production runs."
        addLabel="New Work Order"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
      >
        <SearchStatusFilters
          search={table.draftFilters.search}
          status={table.draftFilters.status}
          onSearchChange={(search) => table.setDraftFilters((p) => ({ ...p, search }))}
          onStatusChange={(status) => table.setDraftFilters((p) => ({ ...p, status: status as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search by work order number"
        />
      </TableListToolbar>
      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <>
            <DataTable columns={columns} data={table.pageData} rowKey={(row) => row.id} sortKey={table.sortBy} sortDirection={table.sortOrder} onSort={table.setSort} rowIndexOffset={table.rowIndexOffset} />
            <div className="border-t border-base px-5 py-4">
              <Pagination currentPage={table.currentPage} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
            </div>
          </>
        )}
      </div>
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete Work Order" message={deleteTarget ? `Delete "${deleteTarget.workOrderNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
