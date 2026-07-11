import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserLayout } from '../../../components/layout/Layout'
import { Pagination } from '../../../components/common/Pagination'
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable'
import { TableListToolbar } from '../../../components/common/TableListToolbar'
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters'
import { FilterField } from '../../../components/common/FilterField'
import { Input } from '../../../components/ui/Input'
import { reportService } from '../../../services/report.service'
import type { PortalAttendanceRecord } from '../../../shared/types/attendance.types'
import { toast } from '../../../shared/utils/toast'
import { getApiErrorMessage } from '../../../shared/utils/apiError'
import { useClientDataTable } from '../../../hooks/useClientDataTable'
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters'
import { useModulePermissions } from '../../../shared/permissions/PermissionContext'
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules'
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel'
import { useListTableExport } from '../../../hooks/useListTableExport'

const PERM = PORTAL_PERMISSION_MODULES.attendanceReport

const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half day' },
] as const

const todayIso = () => new Date().toISOString().slice(0, 10)
const monthStartIso = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10)
}

const formatTime = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusLabel = (status: PortalAttendanceRecord['status']) =>
  status === 'half_day' ? 'Half day' : status.charAt(0).toUpperCase() + status.slice(1)

const filterAttendance = (items: PortalAttendanceRecord[], filters: SearchStatusFilterValues) => {
  let result = items
  if (filters.status !== 'all') {
    result = result.filter((row) => row.status === (filters.status as string))
  }
  const query = filters.search.trim().toLowerCase()
  if (query) {
    result = result.filter((row) =>
      [row.user.name, row.user.employeeCode, row.date, row.status, row.notes ?? ''].some((v) =>
        v.toLowerCase().includes(query)
      )
    )
  }
  return result
}

const getSortValue = (row: PortalAttendanceRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'employeeCode':
      return row.user.employeeCode
    case 'employee':
      return row.user.name
    case 'status':
      return row.status
    case 'checkIn':
      return row.checkIn ? new Date(row.checkIn).getTime() : 0
    case 'checkOut':
      return row.checkOut ? new Date(row.checkOut).getTime() : 0
    case 'hours':
      return row.totalWorkingHours
    default:
      return row.date
  }
}

export const AttendanceReportPage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>()
  const { canView, canExport, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? PERM.moduleCode,
    itemCode ?? PERM.itemCode
  )

  const [from, setFrom] = useState(monthStartIso())
  const [to, setTo] = useState(todayIso())
  const [draftFrom, setDraftFrom] = useState(monthStartIso())
  const [draftTo, setDraftTo] = useState(todayIso())
  const [items, setItems] = useState<PortalAttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const table = useClientDataTable({
    items,
    filterFn: useCallback(filterAttendance, []),
    getSortValue: useCallback(getSortValue, []),
    defaultSortBy: 'date',
  })

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setItems(await reportService.getAttendanceReport({ from, to }))
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance report'))
    } finally {
      setIsLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  const handleApply = () => {
    setFrom(draftFrom)
    setTo(draftTo)
    table.handleApply()
  }

  const handleReset = () => {
    const start = monthStartIso()
    const end = todayIso()
    setDraftFrom(start)
    setDraftTo(end)
    setFrom(start)
    setTo(end)
    table.handleReset()
  }

  const columns: DataTableColumn<PortalAttendanceRecord>[] = useMemo(
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
        header: 'Date',
        sortable: true,
        sortKey: 'date',
        render: (row) => row.date,
        csvValue: (row) => row.date,
      },
      {
        header: 'Emp. code',
        sortable: true,
        sortKey: 'employeeCode',
        render: (row) => <span className="font-mono text-xs text-muted">{row.user.employeeCode}</span>,
        csvValue: (row) => row.user.employeeCode,
      },
      {
        header: 'Employee',
        sortable: true,
        sortKey: 'employee',
        render: (row) => <span className="font-medium text-body">{row.user.name}</span>,
        csvValue: (row) => row.user.name,
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (row) => statusLabel(row.status),
        csvValue: (row) => statusLabel(row.status),
      },
      {
        header: 'Check in',
        sortable: true,
        sortKey: 'checkIn',
        render: (row) => formatTime(row.checkIn),
        csvValue: (row) => (row.checkIn ? formatTime(row.checkIn) : ''),
      },
      {
        header: 'Check out',
        sortable: true,
        sortKey: 'checkOut',
        render: (row) => formatTime(row.checkOut),
        csvValue: (row) => (row.checkOut ? formatTime(row.checkOut) : ''),
      },
      {
        header: 'Hours',
        sortable: true,
        sortKey: 'hours',
        align: 'right',
        render: (row) => <span className="tabular-nums">{row.totalWorkingHours.toFixed(2)}</span>,
        csvValue: (row) => row.totalWorkingHours,
      },
      {
        header: 'Notes',
        render: (row) => row.notes || '—',
        csvValue: (row) => row.notes ?? '',
      },
    ],
    [table.rowIndexOffset]
  )

  const exportProps = useListTableExport('Attendance Report', columns, table.exportRows, canExport)
  const dateFilterActive = from !== monthStartIso() || to !== todayIso()
  const activeFilterCount = table.activeFilterCount + (dateFilterActive ? 1 : 0)

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Attendance Report" subtitle="Attendance records report">
        <AccessDeniedPanel moduleLabel="Attendance report" />
      </UserLayout>
    )
  }

  return (
    <UserLayout title="Attendance Report" subtitle="Filter by date range, status, and employee">
      <TableListToolbar
        title="Attendance Report"
        subtitle="CSV export uses the filtered and sorted result set."
        addLabel=""
        showAdd={false}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((o) => !o)}
        activeFilterCount={activeFilterCount}
        onApply={handleApply}
        onReset={handleReset}
        isApplying={isLoading}
        {...exportProps}
        exportDisabled={isLoading || exportProps.exportDisabled}
      >
        <FilterField label="From">
          <Input type="date" value={draftFrom} onChange={(e) => setDraftFrom(e.target.value)} />
        </FilterField>
        <FilterField label="To">
          <Input type="date" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} />
        </FilterField>
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
          searchPlaceholder="Search employee, code, notes"
          statusOptions={ATTENDANCE_STATUS_OPTIONS}
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
