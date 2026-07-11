import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { reportService } from '../../../services/report.service'
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types'
import { toast } from '../../../shared/utils/toast'
import { getApiErrorMessage } from '../../../shared/utils/apiError'
import { useClientDataTable } from '../../../hooks/useClientDataTable'
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters'
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters'
import { useModulePermissions } from '../../../shared/permissions/PermissionContext'
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules'
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel'
import { useListTableExport } from '../../../hooks/useListTableExport'

const PERM = PORTAL_PERMISSION_MODULES.productReport

const stockLabel = (level: InventoryProductRecord['stockLevel']) => {
  if (level === 'in_stock') return 'In stock'
  if (level === 'low_stock') return 'Low stock'
  return 'Out of stock'
}

export const ProductReportPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  )
  const [items, setItems] = useState<InventoryProductRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items,
    filterFn: useCallback(
      (rows: InventoryProductRecord[], filters: SearchStatusFilterValues) =>
        filterBySearchStatus(rows, filters, [
          (r) => r.productCode,
          (r) => r.productName,
          (r) => r.category.name,
          (r) => r.unit.name,
          (r) => r.brand?.name ?? '',
          (r) => r.barcode ?? '',
        ]),
      []
    ),
    getSortValue: useCallback((r: InventoryProductRecord, key: string) => {
      if (key === 'productCode') return r.productCode
      if (key === 'category') return r.category.name
      if (key === 'quantityOnHand') return r.quantityOnHand
      if (key === 'stockLevel') return r.stockLevel
      if (key === 'salePrice') return r.salePrice
      if (key === 'status') return r.status
      return r.productName
    }, []),
    defaultSortBy: 'productName',
  })

  useEffect(() => {
    setIsLoading(true)
    reportService
      .getProductReport()
      .then(setItems)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load product report')))
      .finally(() => setIsLoading(false))
  }, [])

  const columns: DataTableColumn<InventoryProductRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_r, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span>,
      },
      {
        header: 'Code',
        sortable: true,
        sortKey: 'productCode',
        render: (r) => <span className="font-mono text-sm">{r.productCode}</span>,
        csvValue: (r) => r.productCode,
      },
      {
        header: 'Product',
        sortable: true,
        sortKey: 'productName',
        render: (r) => <span className="font-medium text-body">{r.productName}</span>,
        csvValue: (r) => r.productName,
      },
      {
        header: 'Category',
        sortable: true,
        sortKey: 'category',
        render: (r) => r.category.name,
        csvValue: (r) => r.category.name,
      },
      {
        header: 'Unit',
        render: (r) => r.unit.name,
        csvValue: (r) => r.unit.name,
      },
      {
        header: 'Qty',
        sortable: true,
        sortKey: 'quantityOnHand',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.quantityOnHand}</span>,
        csvValue: (r) => r.quantityOnHand,
      },
      {
        header: 'Stock',
        sortable: true,
        sortKey: 'stockLevel',
        render: (r) => stockLabel(r.stockLevel),
        csvValue: (r) => stockLabel(r.stockLevel),
      },
      {
        header: 'Sale price',
        sortable: true,
        sortKey: 'salePrice',
        align: 'right',
        render: (r) => <span className="tabular-nums">{r.salePrice.toFixed(2)}</span>,
        csvValue: (r) => r.salePrice,
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (r) => <StatusBadge status={r.status} />,
        csvValue: (r) => r.status,
      },
    ],
    [table.rowIndexOffset]
  )

  const exportProps = useListTableExport('Product Report', columns, table.exportRows, canExport)

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Product Report" subtitle="Product catalog report">
        <AccessDeniedPanel moduleLabel="Product report" />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Product Report" subtitle="Filter, sort, and export product catalog data">
      <TableListToolbar
        title="Product Report"
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
          searchPlaceholder="Search product, code, category, brand"
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
