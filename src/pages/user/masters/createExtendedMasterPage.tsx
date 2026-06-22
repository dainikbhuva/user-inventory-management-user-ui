import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import type { PortalMasterRecord } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';

interface ExtendedMasterFormProps<TForm> {
  value?: TForm;
  onSubmit: (data: TForm) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

interface ExtendedMasterPageConfig<TRecord extends PortalMasterRecord, TForm, TCreate, TUpdate> {
  title: string;
  subtitle: string;
  addLabel: string;
  entityLabel: string;
  embedded?: boolean;
  permission?: { moduleCode: string; itemCode: string };
  loadItems: () => Promise<TRecord[]>;
  createItem: (payload: TCreate) => Promise<TRecord>;
  updateItem: (id: string, payload: TUpdate) => Promise<TRecord>;
  deleteItem: (id: string) => Promise<void>;
  extraColumns: DataTableColumn<TRecord>[];
  FormComponent: ComponentType<ExtendedMasterFormProps<TForm>>;
  toFormValue: (item: TRecord) => TForm;
  toCreatePayload: (data: TForm) => TCreate;
  toUpdatePayload: (data: TForm) => TUpdate;
  searchFields: Array<(item: TRecord) => string | undefined>;
  defaultSortBy?: string;
}

export const createExtendedMasterPage = <TRecord extends PortalMasterRecord, TForm, TCreate, TUpdate>(
  config: ExtendedMasterPageConfig<TRecord, TForm, TCreate, TUpdate>
) => {
  const ExtendedMasterPage = () => {
    const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
      config.permission?.moduleCode,
      config.permission?.itemCode
    );
    const hasPermissionGate = Boolean(config.permission);

    const [items, setItems] = useState<TRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editing, setEditing] = useState<TRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filterFn = useCallback(
      (rows: TRecord[], filters: SearchStatusFilterValues) =>
        filterBySearchStatus(
          rows,
          filters,
          config.searchFields.map((getter) => (item: TRecord) => getter(item) ?? '')
        ),
      []
    );

    const getSortValue = useCallback((item: TRecord, sortKey: string): string | number => {
      if (sortKey === 'code') return item.code;
      if (sortKey === 'sortOrder') return item.sortOrder ?? 0;
      if (sortKey === 'status') return item.status;
      if (sortKey === 'createdAt') return item.createdAt ? new Date(item.createdAt).getTime() : 0;
      return item.name;
    }, []);

    const table = useClientDataTable({
      items,
      filterFn,
      getSortValue,
      defaultSortBy: config.defaultSortBy ?? 'sortOrder',
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

    const handleCreate = async (data: TForm) => {
      await config.createItem(config.toCreatePayload(data));
      setIsAddOpen(false);
      toast.success(`${config.entityLabel} created successfully.`);
      await loadItems();
    };

    const handleUpdate = async (data: TForm) => {
      if (!editing) return;
      await config.updateItem(editing.id, config.toUpdatePayload(data));
      setEditing(null);
      toast.success(`${config.entityLabel} updated successfully.`);
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

    const baseColumns: DataTableColumn<TRecord>[] = useMemo(
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
          header: 'Name',
          width: '16%',
          sortable: true,
          sortKey: 'name',
          render: (row) => <span className="font-medium text-body">{row.name}</span>,
        },
        {
          header: 'Code',
          width: '12%',
          sortable: true,
          sortKey: 'code',
          render: (row) => <span className="font-mono text-sm text-muted">{row.code}</span>,
        },
        ...config.extraColumns,
        {
          header: 'Status',
          width: '9%',
          sortable: true,
          sortKey: 'status',
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          header: 'Actions',
          width: '10%',
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
    const FormComponent = config.FormComponent;

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
            searchPlaceholder="Search records"
          />
        </TableListToolbar>

        <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-muted">Loading...</div>
          ) : (
            <>
              <DataTable
                columns={baseColumns}
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
          <FormComponent
            key={editing?.id ?? 'create'}
            value={editing ? config.toFormValue(editing) : undefined}
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

  return ExtendedMasterPage;
};
