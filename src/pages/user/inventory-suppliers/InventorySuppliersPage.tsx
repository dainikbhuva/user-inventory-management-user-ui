import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { inventorySupplierService } from '../../../services/supplier.service';
import type { InventorySupplierRecord } from '../../../shared/types/inventoryMaster.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useListTableExport } from '../../../hooks/useListTableExport';

const LIST_PATH = '/settings/inventory-suppliers';
const PERM = PORTAL_PERMISSION_MODULES.inventorySuppliers;

const SuppliersList = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const { canView, canCreate, canEdit, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(
    PERM.moduleCode,
    PERM.itemCode
  );

  const [items, setItems] = useState<InventorySupplierRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<InventorySupplierRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filterFn = useCallback(
    (rows: InventorySupplierRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [
        (item) => item.supplierName,
        (item) => item.supplierCode,
        (item) => item.contactPerson ?? '',
        (item) => item.mobile ?? '',
        (item) => item.email ?? '',
        (item) => item.city ?? '',
        (item) => item.gstNumber ?? '',
      ]),
    []
  );

  const getSortValue = useCallback((item: InventorySupplierRecord, sortKey: string) => {
    if (sortKey === 'supplierCode') return item.supplierCode;
    if (sortKey === 'status') return item.status;
    if (sortKey === 'city') return item.city ?? '';
    return item.supplierName;
  }, []);

  const table = useClientDataTable({
    items,
    filterFn,
    getSortValue,
    defaultSortBy: 'supplierName',
  });

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await inventorySupplierService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load suppliers'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await inventorySupplierService.delete(deleteTarget.id);
      toast.success(`Supplier "${deleteTarget.supplierName}" deleted successfully.`);
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete supplier'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<InventorySupplierRecord>[] = useMemo(
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
        sortKey: 'supplierCode',
        render: (row) => <span className="font-mono text-sm text-body">{row.supplierCode}</span>,
        csvValue: (row) => row.supplierCode,
      },
      {
        header: 'Supplier name',
        width: '18%',
        sortable: true,
        sortKey: 'supplierName',
        render: (row) => (
          <button
            type="button"
            onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
            className="font-medium text-body text-left hover:text-primary hover:underline"
          >
            {row.supplierName}
          </button>
        ),
        csvValue: (row) => row.supplierName,
      },
      {
        header: 'Contact',
        width: '12%',
        render: (row) => <span className="text-sm text-muted">{row.contactPerson || '—'}</span>,
        csvValue: (row) => row.contactPerson ?? '',
      },
      {
        header: 'Mobile',
        width: '11%',
        render: (row) => <span className="text-sm text-muted">{row.mobile || '—'}</span>,
        csvValue: (row) => row.mobile ?? '',
      },
      {
        header: 'Email',
        width: '14%',
        render: (row) => <span className="text-sm text-muted">{row.email || '—'}</span>,
        csvValue: (row) => row.email ?? '',
      },
      {
        header: 'City',
        width: '10%',
        sortable: true,
        sortKey: 'city',
        render: (row) => <span className="text-sm text-muted">{row.city || '—'}</span>,
        csvValue: (row) => row.city ?? '',
      },
      {
        header: 'Status',
        width: '9%',
        sortable: true,
        sortKey: 'status',
        render: (row) => <StatusBadge status={row.status} />,
        csvValue: (row) => row.status,
      },
      {
        header: 'Actions',
        width: '11%',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center justify-center gap-2">
            {canView ? (
              <button
                type="button"
                title="View supplier"
                onClick={() => navigate(`${LIST_PATH}/${row.id}`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Eye className="h-4 w-4" />
              </button>
            ) : null}
            {canEdit ? (
              <button
                type="button"
                title="Edit supplier"
                onClick={() => navigate(`${LIST_PATH}/${row.id}/edit`)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                title="Delete supplier"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            {!canView && !canEdit && !canDelete ? <span className="text-xs text-muted">—</span> : null}
          </div>
        ),
      },
    ],
    [table.rowIndexOffset, canView, canEdit, canDelete, navigate]
  );

  const exportProps = useListTableExport('Suppliers', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    const denied = <AccessDeniedPanel moduleLabel="Suppliers" />;
    return embedded ? denied : (
      <UserLayout title="Suppliers" subtitle="Manage vendors and suppliers for purchasing inventory.">
        {denied}
      </UserLayout>
    );
  }

  const content = (
    <>
      <TableListToolbar
        title="Suppliers"
        subtitle="Manage vendors and suppliers for purchasing inventory."
        addLabel="Add Supplier"
        onAdd={canCreate ? () => navigate(`${LIST_PATH}/new`) : undefined}
        filterOpen={table.filterOpen}
        onFilterToggle={() => table.setFilterOpen((open) => !open)}
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
        title="Delete supplier"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.supplierName}"? This action cannot be undone.`
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

  if (embedded) {
    return <div className="min-w-0">{content}</div>;
  }

  return (
    <UserLayout title="Suppliers" subtitle="Manage vendors and suppliers for purchasing inventory.">
      {content}
    </UserLayout>
  );
};

export const InventorySuppliersPage = () => <SuppliersList />;
export const InventorySuppliersSettingsPanel = () => <SuppliersList embedded />;
