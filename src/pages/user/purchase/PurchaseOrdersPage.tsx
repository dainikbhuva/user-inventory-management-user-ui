import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { purchaseOrderService } from '../../../services/trading.service';
import type { PurchaseOrderRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { TradingStatusBadge } from '../trading/TradingStatusBadge';

const LIST_PATH = '/purchase/purchase-orders';
const PERM = PORTAL_PERMISSION_MODULES.purchaseOrders;

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, isLoading: permsLoading } = useModulePermissions(
    PERM.moduleCode,
    PERM.itemCode
  );

  const [items, setItems] = useState<PurchaseOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: PurchaseOrderRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [
        (item) => item.poNumber,
        (item) => item.supplierName ?? '',
        (item) => item.referenceNo ?? '',
      ]),
    []
  );

  const getSortValue = useCallback((item: PurchaseOrderRecord, sortKey: string) => {
    if (sortKey === 'poDate') return item.poDate ?? '';
    if (sortKey === 'status') return item.status;
    if (sortKey === 'totalAmount') return String(item.totalAmount);
    return item.poNumber;
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue,
    defaultSortBy: 'poDate',
  });

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await purchaseOrderService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load purchase orders'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await purchaseOrderService.delete(deleteTarget.id);
      toast.success(`Purchase order "${deleteTarget.poNumber}" deleted.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete purchase order'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PurchaseOrderRecord>[] = useMemo(
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
        header: 'PO Number',
        width: '14%',
        sortable: true,
        sortKey: 'poNumber',
        render: (row) => (
          <button
            type="button"
            onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
            className="font-mono text-sm font-medium text-primary hover:underline"
          >
            {row.poNumber}
          </button>
        ),
      },
      {
        header: 'Date',
        width: '11%',
        sortable: true,
        sortKey: 'poDate',
        render: (row) => <span className="text-sm text-body">{formatDate(row.poDate)}</span>,
      },
      {
        header: 'Supplier',
        width: '20%',
        render: (row) => <span className="text-sm text-body">{row.supplierName || '—'}</span>,
      },
      {
        header: 'Warehouse',
        width: '14%',
        render: (row) => <span className="text-sm text-muted">{row.warehouseName || '—'}</span>,
      },
      {
        header: 'Amount',
        width: '12%',
        sortable: true,
        sortKey: 'totalAmount',
        align: 'right',
        render: (row) => <span className="tabular-nums text-sm font-medium text-body">{formatCurrency(row.totalAmount)}</span>,
      },
      {
        header: 'Status',
        width: '11%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <TradingStatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        width: '13%',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center justify-center gap-2">
            <button
              type="button"
              title="View"
              onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
            >
              <Eye className="h-4 w-4" />
            </button>
            {canDelete && row.status === 'draft' ? (
              <button
                type="button"
                title="Delete"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [table.rowIndexOffset, canDelete, navigate]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Purchase Orders" subtitle="Manage purchase orders to suppliers.">
        <AccessDeniedPanel moduleLabel="Purchase Orders" />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Purchase Orders" subtitle="Manage purchase orders to suppliers.">
      <TableListToolbar
        title="Purchase Orders"
        subtitle="Manage purchase orders to suppliers."
        addLabel="New PO"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((open) => !open)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
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
          searchPlaceholder="Search by PO number, supplier, reference"
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={table.setSort}
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

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete purchase order"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.poNumber}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </UserLayout>
  );
};
