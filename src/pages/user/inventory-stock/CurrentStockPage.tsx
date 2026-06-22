import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { inventoryStockService } from '../../../services/inventoryStock.service';
import type { CurrentStockRecord } from '../../../shared/types/inventoryStock.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';

const PERM = PORTAL_PERMISSION_MODULES.currentStock;

export const CurrentStockPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const { canView, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  );
  const [items, setItems] = useState<CurrentStockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filterFn = useCallback((rows: CurrentStockRecord[], filters: SearchStatusFilterValues) => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.product.name, r.product.code, r.warehouse.name].some((v) => v.toLowerCase().includes(q))
    );
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue: useCallback((r: CurrentStockRecord, key: string) => {
      if (key === 'warehouse') return r.warehouse.name;
      if (key === 'currentStock') return r.currentStock;
      if (key === 'stockValue') return r.stockValue;
      return r.product.name;
    }, []),
    defaultSortBy: 'productName',
  });

  useEffect(() => {
    inventoryStockService
      .getCurrentStock()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load current stock')))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: DataTableColumn<CurrentStockRecord>[] = useMemo(
    () => [
      { header: '#', width: '4%', align: 'center', render: (_r, i) => <span className="text-muted">{table.rowIndexOffset + i + 1}</span> },
      { header: 'Product', sortable: true, sortKey: 'productName', render: (r) => <span className="font-medium text-body">{r.product.name}</span> },
      { header: 'Code', render: (r) => <span className="font-mono text-sm">{r.product.code}</span> },
      { header: 'Warehouse', sortable: true, sortKey: 'warehouse', render: (r) => r.warehouse.name },
      { header: 'Qty', sortable: true, sortKey: 'currentStock', align: 'right', render: (r) => <span className="tabular-nums">{r.currentStock}</span> },
      { header: 'Value', sortable: true, sortKey: 'stockValue', align: 'right', render: (r) => <span className="tabular-nums">{r.stockValue.toFixed(2)}</span> },
      {
        header: 'Alert',
        render: (r) =>
          r.isLowStock ? (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">Low stock</span>
          ) : (
            <span className="text-muted text-xs">OK</span>
          ),
      },
    ],
    [table.rowIndexOffset]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Current Stock" subtitle="Stock by product and warehouse">
        <AccessDeniedPanel moduleLabel="Current stock" />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Current Stock" subtitle="Auto-maintained stock per product and warehouse">
      <TableListToolbar
        title="Current Stock"
        subtitle="Updated automatically when stock in/out or adjustments are posted."
        addLabel=""
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
          searchPlaceholder="Search product or warehouse"
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
    </UserLayout>
  );
};
