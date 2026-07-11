import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { reportService } from '../../../services/report.service'
import type { PortalUserRecord } from '../../../shared/types/portal.types'
import { toast } from '../../../shared/utils/toast'
import { getApiErrorMessage } from '../../../shared/utils/apiError'
import { useClientDataTable } from '../../../hooks/useClientDataTable'
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters'
import { getEmployeeTypeLabel } from '../../../shared/constants/employeeType'
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters'
import { useModulePermissions } from '../../../shared/permissions/PermissionContext'
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules'
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel'
import { useListTableExport } from '../../../hooks/useListTableExport'

const PERM = PORTAL_PERMISSION_MODULES.userReport

const filterUsers = (items: PortalUserRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (user) => user.name,
    (user) => user.employeeCode,
    (user) => user.email,
    (user) => user.phone ?? '',
    (user) => user.role.name,
    (user) => user.department ?? '',
    (user) => user.designation ?? '',
    (user) => getEmployeeTypeLabel(user.employeeType),
  ])

const getSortValue = (user: PortalUserRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'employeeCode':
      return user.employeeCode
    case 'email':
      return user.email
    case 'role':
      return user.role.name
    case 'department':
      return user.department ?? ''
    case 'employeeType':
      return getEmployeeTypeLabel(user.employeeType)
    case 'status':
      return user.status
    case 'joiningDate':
      return user.joiningDate ?? ''
    default:
      return user.name
  }
}

export const UserReportPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  )

  const [users, setUsers] = useState<PortalUserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items: users,
    filterFn: useCallback(filterUsers, []),
    getSortValue: useCallback(getSortValue, []),
    defaultSortBy: 'name',
  })

  useEffect(() => {
    setIsLoading(true)
    reportService
      .getUserReport()
      .then(setUsers)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load user report')))
      .finally(() => setIsLoading(false))
  }, [])

  const columns: DataTableColumn<PortalUserRecord>[] = useMemo(
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
        header: 'Emp. code',
        sortable: true,
        sortKey: 'employeeCode',
        render: (row) => <span className="font-mono text-xs text-muted">{row.employeeCode}</span>,
        csvValue: (row) => row.employeeCode,
      },
      {
        header: 'Name',
        sortable: true,
        sortKey: 'name',
        render: (row) => <span className="font-medium text-body">{row.name}</span>,
        csvValue: (row) => row.name,
      },
      {
        header: 'Email',
        sortable: true,
        sortKey: 'email',
        render: (row) => <span className="text-sm text-muted">{row.email}</span>,
        csvValue: (row) => row.email,
      },
      {
        header: 'Role',
        sortable: true,
        sortKey: 'role',
        render: (row) => row.role.name,
        csvValue: (row) => row.role.name,
      },
      {
        header: 'Department',
        sortable: true,
        sortKey: 'department',
        render: (row) => row.department || '—',
        csvValue: (row) => row.department ?? '',
      },
      {
        header: 'Emp. type',
        sortable: true,
        sortKey: 'employeeType',
        render: (row) => getEmployeeTypeLabel(row.employeeType),
        csvValue: (row) => getEmployeeTypeLabel(row.employeeType),
      },
      {
        header: 'Joining',
        sortable: true,
        sortKey: 'joiningDate',
        render: (row) => row.joiningDate || '—',
        csvValue: (row) => row.joiningDate ?? '',
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
        csvValue: (row) => row.status,
      },
    ],
    [table.rowIndexOffset]
  )

  const exportProps = useListTableExport('User Report', columns, table.exportRows, canExport)

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="User Report" subtitle="Employee directory report">
        <AccessDeniedPanel moduleLabel="User report" />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="User Report" subtitle="Filter, sort, and export employee data">
      <TableListToolbar
        title="User Report"
        subtitle="Exports include the current filtered and sorted rows."
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
          searchPlaceholder="Search name, email, code, department"
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
