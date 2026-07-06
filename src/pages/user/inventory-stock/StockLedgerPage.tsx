import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { inventoryStockService } from '../../../services/inventoryStock.service';
import type { StockLedgerRecord } from '../../../shared/types/inventoryStock.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { useListTableExport } from '../../../hooks/useListTableExport';
import { formatCsvDate } from '../../../shared/utils/csvFormatters';

const PERM = PORTAL_PERMISSION_MODULES.stockLedger;

export const StockLedgerPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  );
  const [items, setItems] = useState<StockLedgerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filterFn = useCallback((rows: StockLedgerRecord[], filters: SearchStatusFilterValues) => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.product.name, r.product.code, r.referenceNumber, r.transactionType, r.warehouse.name].some(
        (v) => v.toLowerCase().includes(q)
      )
    );
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue: useCallback((r: StockLedgerRecord, key: string) => {
      if (key === 'transactionDate') return r.transactionDate;
      if (key === 'transactionType') return r.transactionType;
      return r.referenceNumber;
    }, []),
    defaultSortBy: 'transactionDate',
  });

  useEffect(() => {
    inventoryStockService
      .getStockLedger()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load stock ledger')))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: DataTableColumn<StockLedgerRecord>[] = useMemo(
    () => [
      { header: 'Date', sortable: true, sortKey: 'transactionDate', render: (r) => r.transactionDate, csvValue: (r) => formatCsvDate(r.transactionDate) },
      { header: 'Type', sortable: true, sortKey: 'transactionType', render: (r) => <span className="font-mono text-xs">{r.transactionType}</span>, csvValue: (r) => r.transactionType },
      { header: 'Reference', render: (r) => <span className="font-mono text-sm">{r.referenceNumber}</span>, csvValue: (r) => r.referenceNumber },
      { header: 'Product', render: (r) => r.product.name, csvValue: (r) => r.product.name },
      { header: 'Warehouse', render: (r) => r.warehouse.name, csvValue: (r) => r.warehouse.name },
      { header: 'In', align: 'right', render: (r) => <span className="tabular-nums text-emerald-600">{r.qtyIn || '—'}</span>, csvValue: (r) => r.qtyIn ?? '' },
      { header: 'Out', align: 'right', render: (r) => <span className="tabular-nums text-red-500">{r.qtyOut || '—'}</span>, csvValue: (r) => r.qtyOut ?? '' },
      { header: 'Balance', align: 'right', render: (r) => <span className="tabular-nums font-medium">{r.balanceQty}</span>, csvValue: (r) => r.balanceQty },
      { header: 'By', render: (r) => r.createdBy.name, csvValue: (r) => r.createdBy.name },
    ],
    []
  );

  const exportProps = useListTableExport('Stock Ledger', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Stock Ledger" subtitle="Every stock movement logged">
        <AccessDeniedPanel moduleLabel="Stock ledger" />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Stock Ledger" subtitle="Complete audit trail of all stock movements">
      <TableListToolbar
        title="Stock Ledger"
        subtitle="Every stock in, out, and adjustment is logged here automatically."
        addLabel=""
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
        {...exportProps}
        exportDisabled={isLoading || exportProps.exportDisabled}
      >
        <SearchStatusFilters
          search={table.draftFilters.search}
          status={table.draftFilters.status}
          onSearchChange={(search) => table.setDraftFilters((p) => ({ ...p, search }))}
          onStatusChange={(status) => table.setDraftFilters((p) => ({ ...p, status: status as SearchStatusFilterValues['status'] }))}
          searchPlaceholder="Search product, reference, type"
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
