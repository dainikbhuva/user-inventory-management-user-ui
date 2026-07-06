import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { grnService } from '../../../services/trading.service';
import type { GRNRecord } from '../../../shared/types/trading.types';
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

const LIST_PATH = '/purchase/grns';
const PERM = PORTAL_PERMISSION_MODULES.grns;

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const GRNsPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(
    PERM.moduleCode, PERM.itemCode
  );
  const [items, setItems] = useState<GRNRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<GRNRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: GRNRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [(i) => i.grnNumber, (i) => i.supplierName ?? '', (i) => i.poNumber ?? '']),
    []
  );
  const getSortValue = useCallback((item: GRNRecord, sortKey: string) => {
    if (sortKey === 'grnDate') return item.grnDate ?? '';
    if (sortKey === 'status') return item.status;
    return item.grnNumber;
  }, []);

  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'grnDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await grnService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load GRNs')); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await grnService.delete(deleteTarget.id);
      toast.success(`GRN "${deleteTarget.grnNumber}" deleted.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete GRN')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<GRNRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_row, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'GRN Number', width: '14%', sortable: true, sortKey: 'grnNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.grnNumber}</button>, csvValue: (row) => row.grnNumber },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'grnDate', render: (row) => <span className="text-sm text-body">{formatDate(row.grnDate)}</span>, csvValue: (row) => formatCsvDate(row.grnDate) },
    { header: 'Supplier', width: '20%', render: (row) => <span className="text-sm text-body">{row.supplierName || '—'}</span>, csvValue: (row) => row.supplierName ?? '' },
    { header: 'PO Ref', width: '13%', render: (row) => <span className="text-sm text-muted font-mono">{row.poNumber || '—'}</span>, csvValue: (row) => row.poNumber ?? '' },
    { header: 'Amount', width: '12%', align: 'right', render: (row) => <span className="tabular-nums text-sm font-medium text-body">{formatCurrency(row.totalAmount)}</span>, csvValue: (row) => row.totalAmount },
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

  const exportProps = useListTableExport('GRNs', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    return <UserLayout title="Goods Receipt Notes" subtitle="Receive goods from suppliers."><AccessDeniedPanel moduleLabel="GRNs" /></UserLayout>;
  }

  return (
    <UserLayout title="Goods Receipt Notes (GRN)" subtitle="Record goods received from suppliers.">
      <TableListToolbar title="GRNs" subtitle="Record goods received from suppliers." addLabel="New GRN"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen} onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount} onApply={table.handleApply} onReset={table.handleReset} isApplying={isLoading}
        {...exportProps}
        exportDisabled={isLoading || exportProps.exportDisabled}>
        <SearchStatusFilters search={table.draftFilters.search} status={table.draftFilters.status}
          onSearchChange={(search) => table.setDraftFilters((p) => ({ ...p, search }))}
          onStatusChange={(status) => table.setDraftFilters((p) => ({ ...p, status: status as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search by GRN number, supplier, PO reference" />
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete GRN" message={deleteTarget ? `Delete "${deleteTarget.grnNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
