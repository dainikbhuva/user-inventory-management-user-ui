import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { salesInvoiceService } from '../../../services/trading.service';
import type { SalesInvoiceRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';

const LIST_PATH = '/sales/sales-invoices';
const PERM = PORTAL_PERMISSION_MODULES.salesInvoices;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const SalesInvoicesPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<SalesInvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SalesInvoiceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback((rows: SalesInvoiceRecord[], f: SearchStatusFilterValues) =>
    filterBySearchStatus(rows, f, [(i) => i.invoiceNumber, (i) => i.customerName ?? '']), []);
  const getSortValue = useCallback((item: SalesInvoiceRecord, key: string) => {
    if (key === 'invoiceDate') return item.invoiceDate ?? '';
    if (key === 'status') return item.status;
    return item.invoiceNumber;
  }, []);
  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'invoiceDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await salesInvoiceService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load sales invoices')); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await salesInvoiceService.delete(deleteTarget.id);
      toast.success(`Invoice "${deleteTarget.invoiceNumber}" deleted.`);
      setDeleteTarget(null); await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<SalesInvoiceRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'Invoice No.', width: '13%', sortable: true, sortKey: 'invoiceNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.invoiceNumber}</button> },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'invoiceDate', render: (row) => <span className="text-sm">{formatDate(row.invoiceDate)}</span> },
    { header: 'Customer', width: '20%', render: (row) => <span className="text-sm">{row.customerName || '—'}</span> },
    { header: 'Total', width: '11%', align: 'right', render: (row) => <span className="tabular-nums text-sm font-medium">{formatCurrency(row.totalAmount)}</span> },
    { header: 'Balance', width: '11%', align: 'right',
      render: (row) => <span className={`tabular-nums text-sm font-medium ${row.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(row.balanceAmount)}</span> },
    { header: 'Status', width: '11%', sortable: true, sortKey: 'status', render: (row) => <TradingStatusBadge status={row.status} /> },
    { header: 'Actions', width: '10%', align: 'center',
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
    return <UserLayout title="Sales Invoices" subtitle="Manage customer invoices."><AccessDeniedPanel moduleLabel="Sales Invoices" /></UserLayout>;
  }

  return (
    <UserLayout title="Sales Invoices" subtitle="Manage customer invoices.">
      <TableListToolbar title="Sales Invoices" subtitle="Manage customer invoices." addLabel="New Invoice"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen} onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount} onApply={table.handleApply} onReset={table.handleReset} isApplying={isLoading}>
        <SearchStatusFilters search={table.draftFilters.search} status={table.draftFilters.status}
          onSearchChange={(s) => table.setDraftFilters((p) => ({ ...p, search: s }))}
          onStatusChange={(s) => table.setDraftFilters((p) => ({ ...p, status: s as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search by invoice number, customer" />
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete invoice" message={deleteTarget ? `Delete "${deleteTarget.invoiceNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
