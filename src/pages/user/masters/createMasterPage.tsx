import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { MasterRecordForm, type MasterRecordFormData } from './MasterRecordForm';
import type { PortalMasterRecord } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { exportTableCsv } from '../../../shared/utils/tableCsvExport';

type MasterSortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt';

interface MasterPageConfig {
  title: string;
  subtitle: string;
  addLabel: string;
  entityLabel: string;
  embedded?: boolean;
  loadItems: () => Promise<PortalMasterRecord[]>;
  createItem: (payload: {
    name: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive';
    sortOrder: number;
  }) => Promise<PortalMasterRecord>;
  updateItem: (
    id: string,
    payload: Partial<{
      name: string;
      code: string;
      description: string;
      status: 'active' | 'inactive';
      sortOrder: number;
    }>
  ) => Promise<PortalMasterRecord>;
  deleteItem: (id: string) => Promise<void>;
  permission?: { moduleCode: string; itemCode: string };
}

const toFormValue = (item: PortalMasterRecord): MasterRecordFormData => ({
  name: item.name,
  code: item.code,
  description: item.description ?? '',
  status: item.status,
  sortOrder: String(item.sortOrder ?? 0),
});

const buildFilter = (items: PortalMasterRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (item) => item.name,
    (item) => item.code,
    (item) => item.description ?? '',
  ]);

const getSortValue = (item: PortalMasterRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'code':
      return item.code;
    case 'sortOrder':
      return item.sortOrder ?? 0;
    case 'status':
      return item.status;
    case 'createdAt':
      return item.createdAt ? new Date(item.createdAt).getTime() : 0;
    default:
      return item.name;
  }
};

export const createMasterPage = (config: MasterPageConfig) => {
  const MasterPage = () => {
    const { canView, canCreate, canEdit, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(
      config.permission?.moduleCode,
      config.permission?.itemCode
    );
    const hasPermissionGate = Boolean(config.permission);

    const [items, setItems] = useState<PortalMasterRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editing, setEditing] = useState<PortalMasterRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PortalMasterRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filterFn = useCallback(buildFilter, []);
    const sortFn = useCallback(getSortValue, []);

    const table = useClientDataTable({
      items,
      filterFn,
      getSortValue: sortFn,
      defaultSortBy: 'sortOrder',
    });

    const loadItems = useCallback(async () => {
      try {
        setIsLoading(true);
        setItems(await config.loadItems());
      } catch (err) {
        toast.error(getApiErrorMessage(err, `Failed to load ${config.entityLabel.toLowerCase()}s`));
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      loadItems();
    }, [loadItems]);

    const savePayload = (data: MasterRecordFormData) => ({
      name: data.name.trim(),
      code: data.code.trim(),
      description: data.description.trim() || undefined,
      status: data.status,
      sortOrder: Number(data.sortOrder || 0),
    });

    const handleCreate = async (data: MasterRecordFormData) => {
      await config.createItem(savePayload(data));
      setIsAddOpen(false);
      toast.success(`${config.entityLabel} "${data.name.trim()}" created successfully.`);
      await loadItems();
    };

    const handleUpdate = async (data: MasterRecordFormData) => {
      if (!editing) return;
      await config.updateItem(editing.id, savePayload(data));
      setEditing(null);
      toast.success(`${config.entityLabel} "${data.name.trim()}" updated successfully.`);
      await loadItems();
    };

    const confirmDelete = async () => {
      if (!deleteTarget) return;
      try {
        setIsDeleting(true);
        await config.deleteItem(deleteTarget.id);
        toast.success(`${config.entityLabel} "${deleteTarget.name}" deleted successfully.`);
        setDeleteTarget(null);
        await loadItems();
      } catch (err) {
        toast.error(getApiErrorMessage(err, `Failed to delete ${config.entityLabel.toLowerCase()}`));
      } finally {
        setIsDeleting(false);
      }
    };

    const handleExport = useCallback(() => {
      if (table.exportRows.length === 0) {
        toast.error('No records to export.');
        return;
      }
      exportTableCsv(config.title, [
        { header: 'Name', getValue: (row) => row.name },
        { header: 'Code', getValue: (row) => row.code },
        { header: 'Description', getValue: (row) => row.description ?? '' },
        { header: 'Sort', getValue: (row) => row.sortOrder ?? 0 },
        { header: 'Status', getValue: (row) => row.status },
      ], table.exportRows);
      toast.success('Export downloaded.');
    }, [table.exportRows]);

    const columns: DataTableColumn<PortalMasterRecord>[] = useMemo(
      () => [
        {
          header: '#',
          width: '6%',
          align: 'center',
          render: (_row, index) => (
            <span className="text-muted tabular-nums">{table.rowIndexOffset + index + 1}</span>
          ),
        },
        {
          header: 'Name',
          width: '18%',
          sortable: true,
          sortKey: 'name',
          render: (row) => <span className="font-medium text-body">{row.name}</span>,
        },
        {
          header: 'Code',
          width: '14%',
          sortable: true,
          sortKey: 'code',
          render: (row) => <span className="font-mono text-sm text-muted">{row.code}</span>,
        },
        {
          header: 'Description',
          width: '24%',
          render: (row) => <span className="text-sm text-muted">{row.description || '—'}</span>,
        },
        {
          header: 'Sort',
          width: '8%',
          sortable: true,
          sortKey: 'sortOrder',
          align: 'center',
          render: (row) => <span className="tabular-nums text-sm text-muted">{row.sortOrder}</span>,
        },
        {
          header: 'Status',
          width: '10%',
          sortable: true,
          sortKey: 'status',
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          header: 'Actions',
          width: '12%',
          align: 'center',
          render: (row) => (
            <div className="inline-flex items-center justify-center gap-2">
              {canEdit ? (
              <button
                type="button"
                title={`Edit ${config.entityLabel.toLowerCase()}`}
                onClick={() => setEditing(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
              ) : null}
              {canDelete ? (
              <button
                type="button"
                title={`Delete ${config.entityLabel.toLowerCase()}`}
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
      [table.rowIndexOffset, canEdit, canDelete]
    );

    const isFormOpen = isAddOpen || Boolean(editing);

    const accessDenied = hasPermissionGate && !permsLoading && !canView;

    const content = accessDenied ? (
      <AccessDeniedPanel moduleLabel={config.entityLabel} />
    ) : (
      <>
        <TableListToolbar
          title={config.title}
          subtitle={config.subtitle}
          addLabel={config.addLabel}
          onAdd={
            canCreate
              ? () => {
                  setEditing(null);
                  setIsAddOpen(true);
                }
              : undefined
          }
          filterOpen={table.filterOpen}
          onFilterToggle={() => table.setFilterOpen((open) => !open)}
          activeFilterCount={table.activeFilterCount}
          onApply={table.handleApply}
          onReset={table.handleReset}
          isApplying={isLoading}
          showExport={canExport}
          onExport={handleExport}
          exportDisabled={isLoading || table.exportRows.length === 0}
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
            searchPlaceholder="Search by name, code, or description"
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
                onSort={(key) => table.setSort(key as MasterSortField)}
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
          title={`Delete ${config.entityLabel.toLowerCase()}`}
          message={
            deleteTarget
              ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
              : ''
          }
          confirmLabel="OK"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
        />

        <SlideOver
          open={isFormOpen}
          title={editing ? `Edit ${config.entityLabel}` : config.addLabel}
          description={
            editing
              ? `Update ${config.entityLabel.toLowerCase()} details.`
              : `Create a new ${config.entityLabel.toLowerCase()} for your company.`
          }
          onClose={() => {
            setIsAddOpen(false);
            setEditing(null);
          }}
          footer={null}
        >
          <MasterRecordForm
            key={editing?.id ?? 'create'}
            value={editing ? toFormValue(editing) : undefined}
            onCancel={() => {
              setIsAddOpen(false);
              setEditing(null);
            }}
            onSubmit={editing ? handleUpdate : handleCreate}
            submitLabel={editing ? `Update ${config.entityLabel.toLowerCase()}` : config.addLabel}
          />
        </SlideOver>
      </>
    );

    if (config.embedded) {
      return (
        <div className="overflow-hidden rounded-sm border border-base bg-surface p-6 shadow-sm">
          {content}
        </div>
      );
    }

    return (
      <UserLayout title={config.title} subtitle={config.subtitle}>
        {content}
      </UserLayout>
    );
  };

  return MasterPage;
};
