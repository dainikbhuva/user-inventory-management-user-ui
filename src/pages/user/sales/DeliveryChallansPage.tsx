import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { deliveryChallanService } from '../../../services/trading.service';
import type { DeliveryChallanRecord } from '../../../shared/types/trading.types';
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

const LIST_PATH = '/sales/delivery-challans';
const PERM = PORTAL_PERMISSION_MODULES.deliveryChallans;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const DeliveryChallansPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<DeliveryChallanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryChallanRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback((rows: DeliveryChallanRecord[], f: SearchStatusFilterValues) =>
    filterBySearchStatus(rows, f, [(i) => i.dcNumber, (i) => i.customerName ?? '']), []);
  const getSortValue = useCallback((item: DeliveryChallanRecord, key: string) => {
    if (key === 'dcDate') return item.dcDate ?? '';
    if (key === 'status') return item.status;
    return item.dcNumber;
  }, []);
  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'dcDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await deliveryChallanService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load delivery challans')); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deliveryChallanService.delete(deleteTarget.id);
      toast.success(`Delivery challan "${deleteTarget.dcNumber}" deleted.`);
      setDeleteTarget(null); await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<DeliveryChallanRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'DC Number', width: '13%', sortable: true, sortKey: 'dcNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.dcNumber}</button>, csvValue: (row) => row.dcNumber },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'dcDate', render: (row) => <span className="text-sm">{formatDate(row.dcDate)}</span>, csvValue: (row) => formatCsvDate(row.dcDate) },
    { header: 'Customer', width: '22%', render: (row) => <span className="text-sm">{row.customerName || '—'}</span>, csvValue: (row) => row.customerName ?? '' },
    { header: 'Amount', width: '12%', align: 'right', render: (row) => <span className="tabular-nums text-sm font-medium">{formatCurrency(row.totalAmount)}</span>, csvValue: (row) => row.totalAmount },
    { header: 'Status', width: '12%', sortable: true, sortKey: 'status', render: (row) => <TradingStatusBadge status={row.status} />, csvValue: (row) => row.status },
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

  const exportProps = useListTableExport('Delivery Challans', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    return <UserLayout title="Delivery Challans" subtitle="Dispatch goods to customers."><AccessDeniedPanel moduleLabel="Delivery Challans" /></UserLayout>;
  }

  return (
    <UserLayout title="Delivery Challans" subtitle="Dispatch goods to customers.">
      <TableListToolbar title="Delivery Challans" subtitle="Dispatch goods to customers." addLabel="New Challan"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen} onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount} onApply={table.handleApply} onReset={table.handleReset} isApplying={isLoading}
        {...exportProps}
        exportDisabled={isLoading || exportProps.exportDisabled}>
        <SearchStatusFilters search={table.draftFilters.search} status={table.draftFilters.status}
          onSearchChange={(s) => table.setDraftFilters((p) => ({ ...p, search: s }))}
          onStatusChange={(s) => table.setDraftFilters((p) => ({ ...p, status: s as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search by DC number, customer" />
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete challan" message={deleteTarget ? `Delete "${deleteTarget.dcNumber}"?` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
