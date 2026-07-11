import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { reportService } from '../../../services/report.service'
import type { StockLedgerRecord } from '../../../shared/types/inventoryStock.types'
import { toast } from '../../../shared/utils/toast'
import { getApiErrorMessage } from '../../../shared/utils/apiError'
import { useClientDataTable } from '../../../hooks/useClientDataTable'
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters'
import { useModulePermissions } from '../../../shared/permissions/PermissionContext'
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules'
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel'
import { useListTableExport } from '../../../hooks/useListTableExport'
import { formatCsvDate } from '../../../shared/utils/csvFormatters'

const PERM = PORTAL_PERMISSION_MODULES.stockLedgerReport

export const StockLedgerReportPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  )
  const [items, setItems] = useState<StockLedgerRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items,
    filterFn: useCallback((rows: StockLedgerRecord[], filters: SearchStatusFilterValues) => {
      const q = filters.search.trim().toLowerCase()
      if (!q) return rows
      return rows.filter((r) =>
        [r.product.name, r.product.code, r.referenceNumber, r.transactionType, r.warehouse.name].some(
          (v) => v.toLowerCase().includes(q)
        )
      )
    }, []),
    getSortValue: useCallback((r: StockLedgerRecord, key: string) => {
      if (key === 'transactionType') return r.transactionType
      if (key === 'referenceNumber') return r.referenceNumber
      if (key === 'balanceQty') return r.balanceQty
      return r.transactionDate
    }, []),
    defaultSortBy: 'transactionDate',
  })

  useEffect(() => {
    setIsLoading(true)
    reportService
      .getStockLedgerReport()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load stock ledger report')))
      .finally(() => setIsLoading(false))
  }, [])

  const columns: DataTableColumn<StockLedgerRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span>,
      },
      {
        header: 'Date',
        sortable: true,
        sortKey: 'transactionDate',
        render: (r) => r.transactionDate,
        csvValue: (r) => formatCsvDate(r.transactionDate),
      },
      {
        header: 'Type',
        sortable: true,
        sortKey: 'transactionType',
        render: (r) => <span className="font-mono text-xs">{r.transactionType}</span>,
        csvValue: (r) => r.transactionType,
      },
      {
        header: 'Reference',
        sortable: true,
        sortKey: 'referenceNumber',
        render: (r) => <span className="font-mono text-sm">{r.referenceNumber}</span>,
        csvValue: (r) => r.referenceNumber,
      },
      {
        header: 'Product',
        render: (r) => r.product.name,
        csvValue: (r) => r.product.name,
      },
      {
        header: 'Warehouse',
        render: (r) => r.warehouse.name,
        csvValue: (r) => r.warehouse.name,
      },
      {
        header: 'In',
        align: 'right',
        render: (r) => <span className="tabular-nums text-emerald-600">{r.qtyIn || '—'}</span>,
        csvValue: (r) => r.qtyIn ?? '',
      },
      {
        header: 'Out',
        align: 'right',
        render: (r) => <span className="tabular-nums text-red-500">{r.qtyOut || '—'}</span>,
        csvValue: (r) => r.qtyOut ?? '',
      },
      {
        header: 'Balance',
        sortable: true,
        sortKey: 'balanceQty',
        align: 'right',
        render: (r) => <span className="tabular-nums font-medium">{r.balanceQty}</span>,
        csvValue: (r) => r.balanceQty,
      },
      {
        header: 'By',
        render: (r) => r.createdBy.name,
        csvValue: (r) => r.createdBy.name,
      },
    ],
    [table.rowIndexOffset]
  )

  const exportProps = useListTableExport('Stock Ledger Report', columns, table.exportRows, canExport)

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Stock Ledger Report" subtitle="Stock movement history">
        <AccessDeniedPanel moduleLabel="Stock ledger report" />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Stock Ledger Report" subtitle="Every stock movement logged">
      <TableListToolbar
        title="Stock Ledger Report"
        subtitle="CSV export uses the filtered and sorted rows."
        addLabel=""
        showAdd={false}
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
          onStatusChange={(status) =>
            table.setDraftFilters((p) => ({
              ...p,
              status: status as SearchStatusFilterValues['status'],
            }))
          }
          showSearch
          searchPlaceholder="Search product, reference, type, warehouse"
          statusOptions={[{ value: 'all', label: 'All records' }]}
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
              rowKey={(r) => r.id}
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
    </UserLayout>
  )
}
