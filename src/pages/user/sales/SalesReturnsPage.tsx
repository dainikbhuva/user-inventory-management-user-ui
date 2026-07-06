import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { salesReturnService } from '../../../services/trading.service';
import type { SalesReturnRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';
import { useListTableExport } from '../../../hooks/useListTableExport';
import { formatCsvDate } from '../../../shared/utils/csvFormatters';

const LIST_PATH = '/sales/sales-returns';
const PERM = PORTAL_PERMISSION_MODULES.salesReturns;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const SalesReturnsPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<SalesReturnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SalesReturnRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback((rows: SalesReturnRecord[], f: SearchStatusFilterValues) =>
    filterBySearchStatus(rows, f, [(i) => i.returnNumber, (i) => i.customerName ?? '']), []);
  const getSortValue = useCallback((item: SalesReturnRecord, key: string) => {
    if (key === 'returnDate') return item.returnDate ?? '';
    if (key === 'status') return item.status;
    return item.returnNumber;
  }, []);
  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'returnDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await salesReturnService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load sales returns')); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await salesReturnService.delete(deleteTarget.id);
      toast.success(`Sales return "${deleteTarget.returnNumber}" deleted.`);
      setDeleteTarget(null); await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<SalesReturnRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'Return No.', width: '13%', sortable: true, sortKey: 'returnNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.returnNumber}</button>, csvValue: (row) => row.returnNumber },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'returnDate', render: (row) => <span className="text-sm">{formatDate(row.returnDate)}</span>, csvValue: (row) => formatCsvDate(row.returnDate) },
    { header: 'Customer', width: '22%', render: (row) => <span className="text-sm">{row.customerName || '—'}</span>, csvValue: (row) => row.customerName ?? '' },
    { header: 'Amount', width: '13%', align: 'right', render: (row) => <span className="tabular-nums text-sm font-medium">{formatCurrency(row.totalAmount)}</span>, csvValue: (row) => row.totalAmount },
    { header: 'Status', width: '10%', sortable: true, sortKey: 'status', render: (row) => <TradingStatusBadge status={row.status} />, csvValue: (row) => row.status },
    { header: 'Actions', width: '15%', align: 'center',
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

  const exportProps = useListTableExport('Sales Returns', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    return <UserLayout title="Sales Returns" subtitle="Handle customer returns."><AccessDeniedPanel moduleLabel="Sales Returns" /></UserLayout>;
  }

  return (
    <UserLayout title="Sales Returns" subtitle="Handle customer returns.">
      <TableListToolbar title="Sales Returns" subtitle="Handle customer returns." addLabel="New Return"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen} onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount} onApply={table.handleApply} onReset={table.handleReset} isApplying={isLoading}
        {...exportProps}
        exportDisabled={isLoading || exportProps.exportDisabled}>
        <SearchStatusFilters search={table.draftFilters.search} status={table.draftFilters.status}
          onSearchChange={(s) => table.setDraftFilters((p) => ({ ...p, search: s }))}
          onStatusChange={(s) => table.setDraftFilters((p) => ({ ...p, status: s as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search by return number, customer" />
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete sales return" message={deleteTarget ? `Delete "${deleteTarget.returnNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
