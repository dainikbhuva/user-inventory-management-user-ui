import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { inventoryStockService } from '../../../services/inventoryStock.service';
import type { StockAdjustmentRecord } from '../../../shared/types/inventoryStock.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { StockMovementStatusBadge } from '../stock-movements/StockMovementStatusBadge';

const LIST_PATH = '/stock-adjustment';
const PERM = PORTAL_PERMISSION_MODULES.stockAdjustment;

const statusMap = (status: StockAdjustmentRecord['status']) =>
  status === 'approved' ? 'posted' : status === 'cancelled' ? 'cancelled' : 'draft';

export const StockAdjustmentPage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  );
  const [items, setItems] = useState<StockAdjustmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StockAdjustmentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await inventoryStockService.getAdjustments());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load adjustments'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filterFn = useCallback(
    (rows: StockAdjustmentRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [
        (r) => r.adjustmentNumber,
        (r) => r.warehouse.name,
        (r) => r.reason,
        (r) => r.status,
      ]),
    []
  );

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue: useCallback((r: StockAdjustmentRecord, key: string) => {
      if (key === 'adjustmentDate') return r.adjustmentDate;
      if (key === 'status') return r.status;
      return r.adjustmentNumber;
    }, []),
    defaultSortBy: 'adjustmentDate',
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await inventoryStockService.deleteAdjustment(deleteTarget.id);
      toast.success('Draft deleted.');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<StockAdjustmentRecord>[] = useMemo(
    () => [
      { header: 'Document', render: (r) => <span className="font-mono font-medium">{r.adjustmentNumber}</span> },
      { header: 'Date', sortable: true, sortKey: 'adjustmentDate', render: (r) => r.adjustmentDate },
      { header: 'Warehouse', render: (r) => r.warehouse.name },
      { header: 'Reason', render: (r) => r.reason.replace('_', ' ') },
      { header: 'Items', align: 'center', render: (r) => r.lines.length },
      { header: 'Status', render: (r) => <StockMovementStatusBadge status={statusMap(r.status)} /> },
      {
        header: 'Actions',
        align: 'right',
        render: (r) => (
          <div className="flex justify-end gap-1">
            {canView ? (
              <button type="button" onClick={() => navigate(`${LIST_PATH}/${r.id}`)} className="rounded-sm p-2 text-muted hover:bg-surface-2 hover:text-primary" title="View">
                <Eye className="h-4 w-4" />
              </button>
            ) : null}
            {canEdit && r.status === 'draft' ? (
              <button type="button" onClick={() => navigate(`${LIST_PATH}/${r.id}/edit`)} className="rounded-sm p-2 text-muted hover:bg-surface-2 hover:text-primary" title="Edit draft">
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete && r.status === 'draft' ? (
              <button type="button" onClick={() => setDeleteTarget(r)} className="rounded-sm p-2 text-muted hover:bg-red-500/10 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canEdit, canView, navigate]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Stock Adjustment" subtitle="Physical count corrections">
        <AccessDeniedPanel moduleLabel="Stock adjustment" />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Stock Adjustment" subtitle="Correct stock after physical count, damage, or expiry">
      <TableListToolbar
        title="Stock Adjustments"
        subtitle="Draft → Approve to set physical quantity and log to ledger."
        addLabel="New adjustment"
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
          searchPlaceholder="Search document, warehouse, reason"
        />
      </TableListToolbar>
      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading || permsLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <>
            <DataTable columns={columns} data={table.pageData} rowKey={(r) => r.id} sortKey={table.sortBy} sortDirection={table.sortOrder} onSort={table.setSort} rowIndexOffset={table.rowIndexOffset} />
            <div className="border-t border-base px-5 py-4">
              <Pagination currentPage={table.currentPage} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
            </div>
          </>
        )}
      </div>
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete draft" message={deleteTarget ? `Delete "${deleteTarget.adjustmentNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
