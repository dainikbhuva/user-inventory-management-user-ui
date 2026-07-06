import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { materialIssueService } from '../../../services/materialIssue.service';
import type { MaterialIssueRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';
import { useListTableExport } from '../../../hooks/useListTableExport';
import { formatCsvDate } from '../../../shared/utils/csvFormatters';

const LIST_PATH = '/manufacturing/material-issues';
const PERM = PORTAL_PERMISSION_MODULES.materialIssues;
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export const MaterialIssuesPage = () => {
  const navigate = useNavigate();
  const { canView, canCreate, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(PERM.moduleCode, PERM.itemCode);
  const [items, setItems] = useState<MaterialIssueRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MaterialIssueRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: MaterialIssueRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [(r) => r.issueNumber]),
    []
  );
  const getSortValue = useCallback((row: MaterialIssueRecord, sortKey: string) => {
    if (sortKey === 'issueDate') return row.issueDate ?? '';
    if (sortKey === 'status') return row.status;
    return row.issueNumber;
  }, []);

  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'issueDate' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await materialIssueService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load material issues')); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmCancel = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await materialIssueService.cancel(deleteTarget.id);
      toast.success(`Issue "${deleteTarget.issueNumber}" cancelled.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to cancel')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<MaterialIssueRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_row, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'Issue #', width: '14%', sortable: true, sortKey: 'issueNumber',
      render: (row) => <button type="button" onClick={() => navigate(`${LIST_PATH}/${row.id}`)} className="font-mono text-sm font-medium text-primary hover:underline">{row.issueNumber}</button>, csvValue: (row) => row.issueNumber },
    { header: 'Date', width: '11%', sortable: true, sortKey: 'issueDate', render: (row) => formatDate(row.issueDate), csvValue: (row) => formatCsvDate(row.issueDate) },
    { header: 'Items', width: '8%', align: 'center', render: (row) => <span className="text-muted">{row.lines.length}</span>, csvValue: (row) => row.lines.length },
    { header: 'Status', width: '12%', sortable: true, sortKey: 'status', render: (row) => <ManufacturingStatusBadge status={row.status} />, csvValue: (row) => row.status },
    { header: 'Actions', width: '12%', align: 'center',
      render: (row) => (
        <div className="inline-flex items-center justify-center gap-2">
          <button type="button" title="View" onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary">
            <Eye className="h-4 w-4" />
          </button>
          {canDelete && row.status === 'draft' ? (
            <button type="button" title="Cancel" onClick={() => setDeleteTarget(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ], [table.rowIndexOffset, canDelete, navigate]);

  const exportProps = useListTableExport('Material Issues', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    return <UserLayout title="Material Issues" subtitle="Issue raw materials for production."><AccessDeniedPanel moduleLabel="Material Issues" /></UserLayout>;
  }

  return (
    <UserLayout title="Material Issues" subtitle="Issue raw materials for production.">
      <TableListToolbar
        title="Material Issues"
        subtitle="Issue raw materials for production."
        addLabel="New Issue"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
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
          searchPlaceholder="Search by issue number"
        />
      </TableListToolbar>
      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? <div className="flex h-64 items-center justify-center text-muted">Loading...</div> : (
          <>
            <DataTable columns={columns} data={table.pageData} rowKey={(row) => row.id} sortKey={table.sortBy} sortDirection={table.sortOrder} onSort={table.setSort} rowIndexOffset={table.rowIndexOffset} />
            <div className="border-t border-base px-5 py-4">
              <Pagination currentPage={table.currentPage} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setCurrentPage} onPageSizeChange={table.setPageSize} />
            </div>
          </>
        )}
      </div>
      <ConfirmModal open={Boolean(deleteTarget)} title="Cancel Material Issue" message={deleteTarget ? `Cancel issue "${deleteTarget.issueNumber}"?` : ''} confirmLabel="Cancel Issue" variant="danger" isLoading={isDeleting} onConfirm={confirmCancel} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </UserLayout>
  );
};
