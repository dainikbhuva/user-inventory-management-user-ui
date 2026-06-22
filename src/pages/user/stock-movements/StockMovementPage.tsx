import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { stockMovementService } from '../../../services/stockMovement.service';
import type { StockMovementRecord, StockMovementType } from '../../../shared/types/inventoryProduct.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { StockMovementStatusBadge } from './StockMovementStatusBadge';

const configFor = (movementType: StockMovementType) => {
  if (movementType === 'in') {
    return {
      movementType: 'in' as const,
      listPath: '/stock-in',
      createPath: '/stock-in/new',
      viewPath: (id: string) => `/stock-in/${id}`,
      editPath: (id: string) => `/stock-in/${id}/edit`,
      perm: PORTAL_PERMISSION_MODULES.stockIn,
      title: 'Stock In',
      subtitle: 'Record goods received into warehouse inventory.',
      addLabel: 'New stock in',
      moduleLabel: 'Stock in',
    };
  }
  return {
    movementType: 'out' as const,
    listPath: '/stock-out',
    createPath: '/stock-out/new',
    viewPath: (id: string) => `/stock-out/${id}`,
    editPath: (id: string) => `/stock-out/${id}/edit`,
    perm: PORTAL_PERMISSION_MODULES.stockOut,
    title: 'Stock Out',
    subtitle: 'Record goods issued or sold from warehouse inventory.',
    addLabel: 'New stock out',
    moduleLabel: 'Stock out',
  };
};

export const StockMovementPage = ({ movementType }: { movementType: StockMovementType }) => {
  const navigate = useNavigate();
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const config = configFor(movementType);
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? config.perm.moduleCode,
    itemCode ?? config.perm.itemCode
  );

  const [items, setItems] = useState<StockMovementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StockMovementRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: StockMovementRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [
        (item) => item.documentNo,
        (item) => item.warehouse.name,
        (item) => item.supplier?.name ?? '',
        (item) => item.referenceNo ?? '',
        (item) => item.status,
      ]),
    []
  );

  const getSortValue = useCallback((item: StockMovementRecord, sortKey: string) => {
    if (sortKey === 'documentNo') return item.documentNo;
    if (sortKey === 'movementDate') return item.movementDate;
    if (sortKey === 'warehouse') return item.warehouse.name;
    if (sortKey === 'totalQuantity') return item.totalQuantity;
    if (sortKey === 'status') return item.status;
    return item.documentNo;
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue,
    defaultSortBy: 'movementDate',
  });

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await stockMovementService.getAll(movementType));
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Failed to load ${config.moduleLabel.toLowerCase()} records`));
    } finally {
      setIsLoading(false);
    }
  }, [config.moduleLabel, movementType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await stockMovementService.delete(movementType, deleteTarget.id);
      toast.success('Draft deleted successfully.');
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete draft'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<StockMovementRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_row, index) => (
          <span className="text-muted tabular-nums">{table.rowIndexOffset + index + 1}</span>
        ),
      },
      {
        header: 'Document',
        width: '11%',
        sortable: true,
        sortKey: 'documentNo',
        render: (row) => <span className="font-mono text-sm font-medium text-body">{row.documentNo}</span>,
      },
      {
        header: 'Date',
        width: '10%',
        sortable: true,
        sortKey: 'movementDate',
        render: (row) => <span className="text-body">{row.movementDate}</span>,
      },
      {
        header: 'Warehouse',
        width: '14%',
        sortable: true,
        sortKey: 'warehouse',
        render: (row) => <span className="text-body">{row.warehouse.name}</span>,
      },
      ...(movementType === 'in'
        ? [
            {
              header: 'Supplier',
              width: '14%',
              render: (row: StockMovementRecord) => (
                <span className="text-muted">{row.supplier?.name ?? '—'}</span>
              ),
            } as DataTableColumn<StockMovementRecord>,
          ]
        : []),
      {
        header: 'Items',
        width: '8%',
        align: 'center',
        render: (row) => <span className="tabular-nums text-body">{row.lines.length}</span>,
      },
      {
        header: 'Total qty',
        width: '9%',
        sortable: true,
        sortKey: 'totalQuantity',
        align: 'right',
        render: (row) => <span className="tabular-nums text-body">{row.totalQuantity}</span>,
      },
      {
        header: 'Status',
        width: '10%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StockMovementStatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        width: '12%',
        align: 'right',
        render: (row) => (
          <div className="flex justify-end gap-1">
            {canView ? (
              <button
                type="button"
                onClick={() => navigate(config.viewPath(row.id))}
                className="rounded-sm p-2 text-muted transition-colors hover:bg-surface-2 hover:text-primary"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </button>
            ) : null}
            {canEdit && row.status === 'draft' ? (
              <button
                type="button"
                onClick={() => navigate(config.editPath(row.id))}
                className="rounded-sm p-2 text-muted transition-colors hover:bg-surface-2 hover:text-primary"
                title="Edit draft"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete && row.status === 'draft' ? (
              <button
                type="button"
                onClick={() => setDeleteTarget(row)}
                className="rounded-sm p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                title="Delete draft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canEdit, canView, config, movementType, navigate, table.rowIndexOffset]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title={config.title} subtitle={config.subtitle}>
        <AccessDeniedPanel moduleLabel={config.moduleLabel} />
      </UserLayout>
    );
  }

  return (
    <UserLayout title={config.title} subtitle={config.subtitle}>
      <TableListToolbar
        title={config.title}
        subtitle={`${config.title} documents. Draft → Post to update stock.`}
        addLabel={config.addLabel}
        onAdd={canCreate ? () => navigate(config.createPath) : undefined}
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
          searchPlaceholder="Search by document, warehouse, reference"
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading || permsLoading ? (
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
        title="Delete draft"
        message={
          deleteTarget
            ? `Delete draft "${deleteTarget.documentNo}"? Only draft documents can be deleted.`
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

export const StockInPage = () => <StockMovementPage movementType="in" />;
export const StockOutPage = () => <StockMovementPage movementType="out" />;
