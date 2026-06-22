import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { salesOrderService } from '../../../services/trading.service';
import type { SalesOrderRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';

const LIST_PATH = '/sales/sales-orders';
const PERM = PORTAL_PERMISSION_MODULES.salesOrders;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const SalesOrdersPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<SalesOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SalesOrderRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback((rows: SalesOrderRecord[], f: SearchStatusFilterValues) =>
    filterBySearchStatus(rows, f, [(i) => i.soNumber, (i) => i.customerName ?? '']), []);
  const getSortValue = useCallback((item: SalesOrderRecord, key: string) => {
    if (key === 'soDate') return item.soDate ?? '';
    if (key === 'status') return item.status;
    return item.soNumber;
  }, []);
  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'soDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await salesOrderService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load sales orders')); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await salesOrderService.delete(deleteTarget.id);
      toast.success(`Sales order "${deleteTarget.soNumber}" deleted.`);
      setDeleteTarget(null); await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<SalesOrderRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'SO Number', width: '13%', sortable: true, sortKey: 'soNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.soNumber}</button> },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'soDate', render: (row) => <span className="text-sm">{formatDate(row.soDate)}</span> },
    { header: 'Customer', width: '22%', render: (row) => <span className="text-sm">{row.customerName || '—'}</span> },
    { header: 'Amount', width: '12%', align: 'right', render: (row) => <span className="tabular-nums text-sm font-medium">{formatCurrency(row.totalAmount)}</span> },
    { header: 'Status', width: '12%', sortable: true, sortKey: 'status', render: (row) => <TradingStatusBadge status={row.status} /> },
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

  if (!permsLoading && !canView) {
    return <UserLayout title="Sales Orders" subtitle="Manage customer orders."><AccessDeniedPanel moduleLabel="Sales Orders" /></UserLayout>;
  }

  return (
    <UserLayout title="Sales Orders" subtitle="Manage customer orders.">
      <TableListToolbar title="Sales Orders" subtitle="Manage customer orders." addLabel="New Order"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen} onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount} onApply={table.handleApply} onReset={table.handleReset} isApplying={isLoading}>
        <SearchStatusFilters search={table.draftFilters.search} status={table.draftFilters.status}
          onSearchChange={(s) => table.setDraftFilters((p) => ({ ...p, search: s }))}
          onStatusChange={(s) => table.setDraftFilters((p) => ({ ...p, status: s as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search by SO number, customer" />
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete sales order" message={deleteTarget ? `Delete "${deleteTarget.soNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
