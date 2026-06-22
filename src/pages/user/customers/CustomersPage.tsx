import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { customerService } from '../../../services/customer.service';
import type { CustomerRecord } from '../../../shared/types/trading.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const LIST_PATH = '/settings/customers';
const PERM = PORTAL_PERMISSION_MODULES.customers;

const CustomersList = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    PERM.moduleCode,
    PERM.itemCode
  );

  const [items, setItems] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: CustomerRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [
        (item) => item.customerName,
        (item) => item.customerCode,
        (item) => item.contactPerson ?? '',
        (item) => item.mobile ?? '',
        (item) => item.email ?? '',
        (item) => item.city ?? '',
        (item) => item.gstNumber ?? '',
      ]),
    []
  );

  const getSortValue = useCallback((item: CustomerRecord, sortKey: string) => {
    if (sortKey === 'customerCode') return item.customerCode;
    if (sortKey === 'status') return item.status;
    if (sortKey === 'city') return item.city ?? '';
    return item.customerName;
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue,
    defaultSortBy: 'customerName',
  });

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await customerService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load customers'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await customerService.delete(deleteTarget.id);
      toast.success(`Customer "${deleteTarget.customerName}" deleted successfully.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete customer'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<CustomerRecord>[] = useMemo(
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
        header: 'Code',
        width: '10%',
        sortable: true,
        sortKey: 'customerCode',
        render: (row) => <span className="font-mono text-sm text-body">{row.customerCode}</span>,
      },
      {
        header: 'Customer name',
        width: '20%',
        sortable: true,
        sortKey: 'customerName',
        render: (row) => <span className="font-medium text-body">{row.customerName}</span>,
      },
      {
        header: 'Contact',
        width: '12%',
        render: (row) => <span className="text-sm text-muted">{row.contactPerson || '—'}</span>,
      },
      {
        header: 'Mobile',
        width: '11%',
        render: (row) => <span className="text-sm text-muted">{row.mobile || '—'}</span>,
      },
      {
        header: 'Email',
        width: '15%',
        render: (row) => <span className="text-sm text-muted">{row.email || '—'}</span>,
      },
      {
        header: 'City',
        width: '10%',
        sortable: true,
        sortKey: 'city',
        render: (row) => <span className="text-sm text-muted">{row.city || '—'}</span>,
      },
      {
        header: 'Status',
        width: '8%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: 'Actions',
        width: '9%',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center justify-center gap-2">
            {canEdit ? (
              <button
                type="button"
                title="Edit customer"
                onClick={() => navigate(`${LIST_PATH}/${row.id}/edit`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                title="Delete customer"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            {!canEdit && !canDelete ? <span className="text-xs text-muted">—</span> : null}
          </div>
        ),
      },
    ],
    [table.rowIndexOffset, canEdit, canDelete, navigate]
  );

  if (!permsLoading && !canView) {
    const denied = <AccessDeniedPanel moduleLabel="Customers" />;
    return embedded ? denied : (
      <UserLayout title="Customers" subtitle="Manage your customers and buyers.">
        {denied}
      </UserLayout>
    );
  }

  const content = (
    <>
      <TableListToolbar
        title="Customers"
        subtitle="Manage your customers and buyers."
        addLabel="Add Customer"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((open) => !open)}
        activeFilterCount={table.activeFilterCount}
        onApply={table.handleApply}
        onReset={table.handleReset}
        isApplying={isLoading}
      >
        <SearchStatusFilters
          search={table.draftFilters.search}
          status={table.draftFilters.status}
          onSearchChange={(search) => table.setDraftFilters((prev) => ({ ...prev, search }))}
          onStatusChange={(status) =>
            table.setDraftFilters((prev) => ({
              ...prev,
              status: status as SearchStatusFilterValues['status'],
            }))
          }
          searchPlaceholder="Search by name, code, contact, mobile, email, city"
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
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

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete customer"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.customerName}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="OK"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </>
  );

  if (embedded) return <div className="min-w-0">{content}</div>;

  return (
    <UserLayout title="Customers" subtitle="Manage your customers and buyers.">
      {content}
    </UserLayout>
  );
};

export const CustomersPage = () => <CustomersList />;
export const CustomersSettingsPanel = () => <CustomersList embedded />;
