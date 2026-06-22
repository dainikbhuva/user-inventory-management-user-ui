import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { inventoryProductService } from '../../../services/product.service';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const LIST_PATH = '/products';
const PERM = PORTAL_PERMISSION_MODULES.products;

const StockLevelBadge = ({ level }: { level: InventoryProductRecord['stockLevel'] }) => {
  if (level === 'in_stock') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20">
        In stock
      </span>
    );
  }
  if (level === 'low_stock') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-500/20">
        Low stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500 ring-1 ring-red-500/20">
      Out of stock
    </span>
  );
};

export const ProductsPage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  );

  const [items, setItems] = useState<InventoryProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<InventoryProductRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: InventoryProductRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [
        (item) => item.productName,
        (item) => item.productCode,
        (item) => item.category.name,
        (item) => item.unit.name,
        (item) => item.barcode ?? '',
      ]),
    []
  );

  const getSortValue = useCallback((item: InventoryProductRecord, sortKey: string) => {
    if (sortKey === 'productCode') return item.productCode;
    if (sortKey === 'category') return item.category.name;
    if (sortKey === 'quantityOnHand') return item.quantityOnHand;
    if (sortKey === 'stockLevel') return item.stockLevel;
    if (sortKey === 'status') return item.status;
    return item.productName;
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue,
    defaultSortBy: 'productName',
  });

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await inventoryProductService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load products'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await inventoryProductService.delete(deleteTarget.id);
      toast.success(`Product "${deleteTarget.productName}" deleted successfully.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete product'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<InventoryProductRecord>[] = useMemo(
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
        header: 'Code',
        width: '9%',
        sortable: true,
        sortKey: 'productCode',
        render: (row) => <span className="font-mono text-sm text-body">{row.productCode}</span>,
      },
      {
        header: 'Product',
        width: '18%',
        sortable: true,
        sortKey: 'productName',
        render: (row) => <span className="font-medium text-body">{row.productName}</span>,
      },
      {
        header: 'Category',
        width: '12%',
        sortable: true,
        sortKey: 'category',
        render: (row) => <span className="text-body">{row.category.name}</span>,
      },
      {
        header: 'Unit',
        width: '8%',
        render: (row) => <span className="text-muted">{row.unit.name}</span>,
      },
      {
        header: 'Qty on hand',
        width: '9%',
        sortable: true,
        sortKey: 'quantityOnHand',
        align: 'right',
        render: (row) => <span className="tabular-nums text-body">{row.quantityOnHand}</span>,
      },
      {
        header: 'Stock',
        width: '10%',
        sortable: true,
        sortKey: 'stockLevel',
        render: (row) => <StockLevelBadge level={row.stockLevel} />,
      },
      {
        header: 'Sale price',
        width: '9%',
        align: 'right',
        render: (row) => <span className="tabular-nums text-body">{row.salePrice.toFixed(2)}</span>,
      },
      {
        header: 'Status',
        width: '8%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        width: '10%',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center justify-center gap-2">
            {canEdit ? (
              <button
                type="button"
                title="Edit product"
                onClick={() => navigate(`${LIST_PATH}/${row.id}/edit`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                title="Delete product"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            {!canEdit && !canDelete ? <span className="text-xs text-muted">—</span> : null}
          </div>
        ),
      },
    ],
    [canDelete, canEdit, navigate, table.rowIndexOffset]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Products" subtitle="Manage product catalog and stock levels">
        <AccessDeniedPanel moduleLabel="Products" />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Products" subtitle="Manage product catalog. Stock quantity updates via stock in/out.">
      <TableListToolbar
        title="Products"
        subtitle="Product master linked to categories, units, brands, and tax."
        addLabel="Add Product"
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
          searchPlaceholder="Search by name, code, category, barcode"
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
        title="Delete product"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.productName}"? Products with stock on hand cannot be deleted.`
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
