import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { reportService } from '../../../services/report.service'
import type { StockMovementRecord, StockMovementType } from '../../../shared/types/inventoryProduct.types'
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

const MOVEMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const configFor = (movementType: StockMovementType) =>
  movementType === 'in'
    ? {
        perm: PORTAL_PERMISSION_MODULES.stockInReport,
        title: 'Stock In Report',
        filename: 'Stock In Report',
        moduleLabel: 'Stock in report',
        includeSupplier: true,
      }
    : {
        perm: PORTAL_PERMISSION_MODULES.stockOutReport,
        title: 'Stock Out Report',
        filename: 'Stock Out Report',
        moduleLabel: 'Stock out report',
        includeSupplier: false,
      }

export const StockMovementReportPage = ({ movementType }: { movementType: StockMovementType }) => {
  const config = configFor(movementType)
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? config.perm.moduleCode,
    itemCode ?? config.perm.itemCode
  )
  const [items, setItems] = useState<StockMovementRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items,
    filterFn: useCallback((rows: StockMovementRecord[], filters: SearchStatusFilterValues) => {
      let result = rows
      if (filters.status !== 'all') {
        result = result.filter((r) => r.status === (filters.status as string))
      }
      const q = filters.search.trim().toLowerCase()
      if (q) {
        result = result.filter((r) =>
          [
            r.documentNo,
            r.warehouse.name,
            r.supplier?.name ?? '',
            r.referenceNo ?? '',
            r.status,
            r.notes ?? '',
          ].some((v) => v.toLowerCase().includes(q))
        )
      }
      return result
    }, []),
    getSortValue: useCallback((r: StockMovementRecord, key: string) => {
      if (key === 'documentNo') return r.documentNo
      if (key === 'warehouse') return r.warehouse.name
      if (key === 'status') return r.status
      if (key === 'totalQuantity') return r.totalQuantity
      return r.movementDate
    }, []),
    defaultSortBy: 'movementDate',
  })

  useEffect(() => {
    setIsLoading(true)
    reportService
      .getStockMovementReport(movementType)
      .then(setItems)
      .catch((err) =>
        toast.error(getApiErrorMessage(err, `Failed to load ${config.moduleLabel.toLowerCase()}`))
      )
      .finally(() => setIsLoading(false))
  }, [config.moduleLabel, movementType])

  const columns: DataTableColumn<StockMovementRecord>[] = useMemo(() => {
    const cols: DataTableColumn<StockMovementRecord>[] = [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span>,
      },
      {
        header: 'Document',
        sortable: true,
        sortKey: 'documentNo',
        render: (r) => <span className="font-mono text-sm font-medium">{r.documentNo}</span>,
        csvValue: (r) => r.documentNo,
      },
      {
        header: 'Date',
        sortable: true,
        sortKey: 'movementDate',
        render: (r) => r.movementDate,
        csvValue: (r) => formatCsvDate(r.movementDate),
      },
      {
        header: 'Warehouse',
        sortable: true,
        sortKey: 'warehouse',
        render: (r) => r.warehouse.name,
        csvValue: (r) => r.warehouse.name,
      },
    ]
    if (config.includeSupplier) {
      cols.push({
        header: 'Supplier',
        render: (r) => r.supplier?.name ?? '—',
        csvValue: (r) => r.supplier?.name ?? '',
      })
    }
    cols.push(
      {
        header: 'Items',
        align: 'center',
        render: (r) => <span className="tabular-nums">{r.lines.length}</span>,
        csvValue: (r) => r.lines.length,
      },
      {
        header: 'Total qty',
        sortable: true,
        sortKey: 'totalQuantity',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.totalQuantity}</span>,
        csvValue: (r) => r.totalQuantity,
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (r) => <StockMovementStatusBadge status={r.status} />,
        csvValue: (r) => r.status,
      },
      {
        header: 'Reference',
        render: (r) => r.referenceNo || '—',
        csvValue: (r) => r.referenceNo ?? '',
      }
    )
    return cols
  }, [config.includeSupplier, table.rowIndexOffset])

  const exportProps = useListTableExport(config.filename, columns, table.exportRows, canExport)

  if (!permsLoading && !canView) {
    return (
      <UserLayout title={config.title} subtitle="Inventory movement report">
        <AccessDeniedPanel moduleLabel={config.moduleLabel} />
      </UserLayout>
    )
  }

  return (
    <UserLayout title={config.title} subtitle="Filter, sort, and export movement records">
      <TableListToolbar
        title={config.title}
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
          searchPlaceholder="Search document, warehouse, reference"
          statusOptions={MOVEMENT_STATUS_OPTIONS}
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

export const StockInReportPage = () => <StockMovementReportPage movementType="in" />
export const StockOutReportPage = () => <StockMovementReportPage movementType="out" />
