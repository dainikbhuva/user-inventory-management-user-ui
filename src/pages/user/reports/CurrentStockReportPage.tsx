import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { reportService } from '../../../services/report.service'
import type { CurrentStockRecord } from '../../../shared/types/inventoryStock.types'
import { toast } from '../../../shared/utils/toast'
import { getApiErrorMessage } from '../../../shared/utils/apiError'
import { useClientDataTable } from '../../../hooks/useClientDataTable'
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters'
import { useModulePermissions } from '../../../shared/permissions/PermissionContext'
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules'
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel'
import { useListTableExport } from '../../../hooks/useListTableExport'

const PERM = PORTAL_PERMISSION_MODULES.currentStockReport

const STOCK_STATUS_OPTIONS = [
  { value: 'all', label: 'All stock' },
  { value: 'active', label: 'OK stock' },
  { value: 'inactive', label: 'Low stock' },
] as const

export const CurrentStockReportPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  )
  const [items, setItems] = useState<CurrentStockRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items,
    filterFn: useCallback((rows: CurrentStockRecord[], filters: SearchStatusFilterValues) => {
      let result = rows
      if (filters.status === 'active') result = result.filter((r) => !r.isLowStock)
      else if (filters.status === 'inactive') result = result.filter((r) => r.isLowStock)
      const q = filters.search.trim().toLowerCase()
      if (q) {
        result = result.filter((r) =>
          [r.product.name, r.product.code, r.warehouse.name].some((v) =>
            v.toLowerCase().includes(q)
          )
        )
      }
      return result
    }, []),
    getSortValue: useCallback((r: CurrentStockRecord, key: string) => {
      if (key === 'code') return r.product.code
      if (key === 'warehouse') return r.warehouse.name
      if (key === 'currentStock') return r.currentStock
      if (key === 'stockValue') return r.stockValue
      return r.product.name
    }, []),
    defaultSortBy: 'productName',
  })

  useEffect(() => {
    setIsLoading(true)
    reportService
      .getCurrentStockReport()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load current stock report')))
      .finally(() => setIsLoading(false))
  }, [])

  const columns: DataTableColumn<CurrentStockRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span>,
      },
      {
        header: 'Product',
        sortable: true,
        sortKey: 'productName',
        render: (r) => <span className="font-medium text-body">{r.product.name}</span>,
        csvValue: (r) => r.product.name,
      },
      {
        header: 'Code',
        sortable: true,
        sortKey: 'code',
        render: (r) => <span className="font-mono text-sm">{r.product.code}</span>,
        csvValue: (r) => r.product.code,
      },
      {
        header: 'Warehouse',
        sortable: true,
        sortKey: 'warehouse',
        render: (r) => r.warehouse.name,
        csvValue: (r) => r.warehouse.name,
      },
      {
        header: 'Opening',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.openingStock}</span>,
        csvValue: (r) => r.openingStock,
      },
      {
        header: 'In',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.stockIn}</span>,
        csvValue: (r) => r.stockIn,
      },
      {
        header: 'Out',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.stockOut}</span>,
        csvValue: (r) => r.stockOut,
      },
      {
        header: 'Current',
        sortable: true,
        sortKey: 'currentStock',
        align: 'right',
        render: (r) => <span className="tabular-nums font-medium">{r.currentStock}</span>,
        csvValue: (r) => r.currentStock,
      },
      {
        header: 'Value',
        sortable: true,
        sortKey: 'stockValue',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.stockValue.toFixed(2)}</span>,
        csvValue: (r) => r.stockValue,
      },
      {
        header: 'Alert',
        render: (r) => (r.isLowStock ? 'Low stock' : 'OK'),
        csvValue: (r) => (r.isLowStock ? 'Low stock' : 'OK'),
      },
    ],
    [table.rowIndexOffset]
  )

  const exportProps = useListTableExport('Current Stock Report', columns, table.exportRows, canExport)

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Current Stock Report" subtitle="Stock on hand report">
        <AccessDeniedPanel moduleLabel="Current stock report" />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Current Stock Report" subtitle="Stock by product and warehouse">
      <TableListToolbar
        title="Current Stock Report"
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
          searchPlaceholder="Search product, code, warehouse"
          statusOptions={STOCK_STATUS_OPTIONS}
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
