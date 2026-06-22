import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { productionEntryService } from '../../../services/productionEntry.service';
import type { ProductionEntryRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';

const LIST_PATH = '/manufacturing/production-entries';
const PERM = PORTAL_PERMISSION_MODULES.productionEntries;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export const ProductionEntriesPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<ProductionEntryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductionEntryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: ProductionEntryRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [(r) => r.entryNumber]),
    []
  );
  const getSortValue = useCallback((row: ProductionEntryRecord, sortKey: string) => {
    if (sortKey === 'entryDate') return row.entryDate ?? '';
    if (sortKey === 'status') return row.status;
    return row.entryNumber;
  }, []);

  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'entryDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await productionEntryService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load production entries')); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmCancel = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await productionEntryService.cancel(deleteTarget.id);
      toast.success(`Entry "${deleteTarget.entryNumber}" cancelled.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<ProductionEntryRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_row, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'Entry #', width: '14%', sortable: true, sortKey: 'entryNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.entryNumber}</button> },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'entryDate', render: (row) => formatDate(row.entryDate) },
    { header: 'Produced Qty', width: '10%', align: 'right', render: (row) => <span className="tabular-nums">{row.producedQty}</span> },
    { header: 'Status', width: '12%', sortable: true, sortKey: 'status', render: (row) => <ManufacturingStatusBadge status={row.status} /> },
    { header: 'Actions', width: '12%', align: 'center',
      render: (row) => (
        <div className="inline-flex items-center justify-center gap-2">
          <button type="button" title="View" onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary">
            <Eye className="h-4 w-4" />
          </button>
          {canDelete && row.status === 'draft' ? (
            <button type="button" title="Cancel" onClick={() => setDeleteTarget(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ], [table.rowIndexOffset, canDelete, navigate]);

  if (!permsLoading && !canView) {
    return <UserLayout title="Production Entries" subtitle="Record finished goods produced."><AccessDeniedPanel moduleLabel="Production Entries" /></UserLayout>;
  }

  return (
    <UserLayout title="Production Entries" subtitle="Record finished goods produced.">
      <TableListToolbar
        title="Production Entries"
        subtitle="Record finished goods produced."
        addLabel="New Entry"
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
          searchPlaceholder="Search by entry number"
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Cancel Production Entry" message={deleteTarget ? `Cancel entry "${deleteTarget.entryNumber}"?` : ''} confirmLabel="Cancel" variant="danger" isLoading={isDeleting} onConfirm={confirmCancel} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
