import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { reportService } from '../../../services/report.service'
import type { StockAdjustmentRecord } from '../../../shared/types/inventoryStock.types'
import { toast } from '../../../shared/utils/toast'
import { getApiErrorMessage } from '../../../shared/utils/apiError'
import { useClientDataTable } from '../../../hooks/useClientDataTable'
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters'
import { useModulePermissions } from '../../../shared/permissions/PermissionContext'
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules'
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel'
import { useListTableExport } from '../../../hooks/useListTableExport'
import { formatCsvDate } from '../../../shared/utils/csvFormatters'
import { StockMovementStatusBadge } from '../stock-movements/StockMovementStatusBadge'

const PERM = PORTAL_PERMISSION_MODULES.stockAdjustmentReport

const ADJUSTMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const badgeStatus = (status: StockAdjustmentRecord['status']) =>
  status === 'approved' ? 'posted' : status === 'cancelled' ? 'cancelled' : 'draft'

export const StockAdjustmentReportPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  )
  const [items, setItems] = useState<StockAdjustmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items,
    filterFn: useCallback((rows: StockAdjustmentRecord[], filters: SearchStatusFilterValues) => {
      let result = rows
      if (filters.status !== 'all') {
        result = result.filter((r) => r.status === (filters.status as string))
      }
      const q = filters.search.trim().toLowerCase()
      if (q) {
        result = result.filter((r) =>
          [r.adjustmentNumber, r.warehouse.name, r.reason, r.status, r.notes ?? ''].some((v) =>
            v.toLowerCase().includes(q)
          )
        )
      }
      return result
    }, []),
    getSortValue: useCallback((r: StockAdjustmentRecord, key: string) => {
      if (key === 'adjustmentNumber') return r.adjustmentNumber
      if (key === 'warehouse') return r.warehouse.name
      if (key === 'status') return r.status
      if (key === 'reason') return r.reason
      return r.adjustmentDate
    }, []),
    defaultSortBy: 'adjustmentDate',
  })

  useEffect(() => {
    setIsLoading(true)
    reportService
      .getStockAdjustmentReport()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load stock adjustment report')))
      .finally(() => setIsLoading(false))
  }, [])

  const columns: DataTableColumn<StockAdjustmentRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span>,
      },
      {
        header: 'Number',
        sortable: true,
        sortKey: 'adjustmentNumber',
        render: (r) => <span className="font-mono text-sm font-medium">{r.adjustmentNumber}</span>,
        csvValue: (r) => r.adjustmentNumber,
      },
      {
        header: 'Date',
        sortable: true,
        sortKey: 'adjustmentDate',
        render: (r) => r.adjustmentDate,
        csvValue: (r) => formatCsvDate(r.adjustmentDate),
      },
      {
        header: 'Warehouse',
        sortable: true,
        sortKey: 'warehouse',
        render: (r) => r.warehouse.name,
        csvValue: (r) => r.warehouse.name,
      },
      {
        header: 'Reason',
        sortable: true,
        sortKey: 'reason',
        render: (r) => r.reason,
        csvValue: (r) => r.reason,
      },
      {
        header: 'Lines',
        align: 'center',
        render: (r) => <span className="tabular-nums">{r.lines.length}</span>,
        csvValue: (r) => r.lines.length,
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (r) => <StockMovementStatusBadge status={badgeStatus(r.status)} />,
        csvValue: (r) => r.status,
      },
      {
        header: 'Created by',
        render: (r) => r.createdBy.name,
        csvValue: (r) => r.createdBy.name,
      },
    ],
    [table.rowIndexOffset]
  )

  const exportProps = useListTableExport(
    'Stock Adjustment Report',
    columns,
    table.exportRows,
    canExport
  )

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Stock Adjustment Report" subtitle="Inventory adjustment report">
        <AccessDeniedPanel moduleLabel="Stock adjustment report" />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Stock Adjustment Report" subtitle="Filter, sort, and export adjustments">
      <TableListToolbar
        title="Stock Adjustment Report"
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
          searchPlaceholder="Search number, warehouse, reason"
          statusOptions={ADJUSTMENT_STATUS_OPTIONS}
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
