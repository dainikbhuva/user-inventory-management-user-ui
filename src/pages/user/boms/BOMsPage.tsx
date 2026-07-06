import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { bomService, type BOMPayload } from '../../../services/bom.service';
import type { BOMRecord } from '../../../shared/types/manufacturing.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { ManufacturingStatusBadge } from '../manufacturing/ManufacturingStatusBadge';
import { BOMForm, emptyBOMForm } from './BOMForm';
import { useManufacturingMasters } from '../manufacturing/useManufacturingMasters';
import { useListTableExport } from '../../../hooks/useListTableExport';

const PERM = PORTAL_PERMISSION_MODULES.boms;

const BOMsList = ({ embedded = false }: { embedded?: boolean }) => {
  const { canView, canCreate, canEdit, canDelete, canExport, isLoading: permsLoading } = useModulePermissions(
    PERM.moduleCode, PERM.itemCode
  );
  const [items, setItems] = useState<BOMRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BOMRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<BOMRecord | null>(null);
  const [showForm, setShowForm] = useState<'create' | 'edit' | null>(null);
  const [formValue, setFormValue] = useState(emptyBOMForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [autoCode, setAutoCode] = useState(true);
  const { products, warehouses } = useManufacturingMasters();

  const filterFn = useCallback(
    (rows: BOMRecord[], filters: SearchStatusFilterValues) =>
      filterBySearchStatus(rows, filters, [(item) => item.bomCode, (item) => item.bomName]),
    []
  );
  const getSortValue = useCallback((item: BOMRecord, sortKey: string) => {
    if (sortKey === 'bomCode') return item.bomCode;
    if (sortKey === 'status') return item.status;
    return item.bomName;
  }, []);

  const table = useClientDataTable({ items, filterFn, getSortValue, defaultSortBy: 'bomCode' });

  const loadItems = useCallback(async () => {
    try { setIsLoading(true); setItems(await bomService.getAll()); }
    catch (err) { toast.error(getApiErrorMessage(err, 'Failed to load BOMs')); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const openCreate = async () => {
    setFormValue(emptyBOMForm());
    setAutoCode(true);
    setShowForm('create');
    try {
      setIsGeneratingCode(true);
      const code = await bomService.getNextBomCode();
      setFormValue((prev) => ({ ...prev, bomCode: code }));
    } catch { /* ignore */ } finally { setIsGeneratingCode(false); }
  };

  const openEdit = (item: BOMRecord) => {
    setEditTarget(item);
    setFormValue({
      bomCode: item.bomCode,
      bomName: item.bomName,
      finishedProductId: item.finishedProductId,
      outputQty: item.outputQty,
      outputUnitId: item.outputUnitId ?? '',
      components: item.components.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
        unitId: c.unitId ?? '',
        notes: c.notes ?? '',
      })),
      notes: item.notes ?? '',
      status: item.status,
    });
    setShowForm('edit');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formValue.bomName.trim()) { toast.warning('BOM name is required'); return; }
    if (!formValue.finishedProductId) { toast.warning('Finished product is required'); return; }
    if (formValue.components.some((c) => !c.productId)) { toast.warning('All components must have a product selected'); return; }
    try {
      setIsSubmitting(true);
      const payload: BOMPayload = {
        bomCode: formValue.bomCode || undefined,
        autoGenerateBomCode: autoCode && showForm === 'create',
        bomName: formValue.bomName,
        finishedProductId: formValue.finishedProductId,
        outputQty: formValue.outputQty,
        ...(formValue.outputUnitId ? { outputUnitId: formValue.outputUnitId } : {}),
        components: formValue.components.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          ...(c.unitId ? { unitId: c.unitId } : {}),
          ...(c.notes ? { notes: c.notes } : {}),
        })),
        ...(formValue.notes ? { notes: formValue.notes } : {}),
        status: formValue.status,
      };
      if (showForm === 'edit' && editTarget) {
        await bomService.update(editTarget.id, payload);
        toast.success('BOM updated successfully');
      } else {
        await bomService.create(payload);
        toast.success('BOM created successfully');
      }
      setShowForm(null);
      loadItems();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save BOM'));
    } finally { setIsSubmitting(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await bomService.delete(deleteTarget.id);
      toast.success('BOM deleted');
      setDeleteTarget(null);
      await loadItems();
    } catch (err) { toast.error(getApiErrorMessage(err, 'Failed to delete BOM')); }
    finally { setIsDeleting(false); }
  };

  const columns: DataTableColumn<BOMRecord>[] = useMemo(() => [
    { header: '#', width: '5%', align: 'center', render: (_row, i) => <span className="text-muted tabular-nums">{table.rowIndexOffset + i + 1}</span> },
    { header: 'Code', width: '12%', sortable: true, sortKey: 'bomCode',
      render: (row) => <span className="font-mono text-sm font-medium text-primary">{row.bomCode}</span>, csvValue: (row) => row.bomCode },
    { header: 'Name', sortable: true, sortKey: 'bomName', render: (row) => <span className="font-medium text-body">{row.bomName}</span>, csvValue: (row) => row.bomName },
    { header: 'Components', width: '12%', align: 'center', render: (row) => <span className="text-muted">{row.components.length}</span>, csvValue: (row) => row.components.length },
    { header: 'Output Qty', width: '10%', align: 'right', render: (row) => <span className="tabular-nums">{row.outputQty}</span>, csvValue: (row) => row.outputQty },
    { header: 'Status', width: '10%', sortable: true, sortKey: 'status', render: (row) => <ManufacturingStatusBadge status={row.status} />, csvValue: (row) => row.status },
    { header: 'Actions', width: '12%', align: 'center',
      render: (row) => (
        <div className="inline-flex items-center justify-center gap-2">
          {canEdit ? (
            <button type="button" title="Edit" onClick={() => openEdit(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary">
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          {canDelete ? (
            <button type="button" title="Delete" onClick={() => setDeleteTarget(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ], [table.rowIndexOffset, canEdit, canDelete]);

  const exportProps = useListTableExport('Bill of Materials', columns, table.exportRows, canExport);

  if (!permsLoading && !canView) {
    const panel = <AccessDeniedPanel moduleLabel="Bill of Materials" />;
    return embedded ? <div>{panel}</div> : <UserLayout title="Bill of Materials" subtitle="Define production recipes.">{panel}</UserLayout>;
  }

  const content = showForm ? (
    <BOMForm
      value={formValue}
      onChange={setFormValue}
      onSubmit={handleSubmit}
      onCancel={() => setShowForm(null)}
      submitLabel={showForm === 'edit' ? 'Update BOM' : 'Create BOM'}
      isSubmitting={isSubmitting}
      mode={showForm}
      autoGenerateBomCode={autoCode}
      isGeneratingCode={isGeneratingCode}
      onBomCodeManualChange={() => setAutoCode(false)}
      products={products}
      warehouses={warehouses}
    />
  ) : (
    <>
      <TableListToolbar
        title="Bill of Materials"
        subtitle="Define production recipes for finished goods."
        addLabel="New BOM"
        onAdd={canCreate ? openCreate : undefined}
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
          searchPlaceholder="Search by BOM code or name"
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
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete BOM" message={deleteTarget ? `Delete BOM "${deleteTarget.bomName}"? This action cannot be undone.` : ''} confirmLabel="Delete" variant="danger" isLoading={isDeleting} onConfirm={confirmDelete} onCancel={() => !isDeleting && setDeleteTarget(null)} />
    </>
  );

  if (embedded) return <div className="flex flex-col gap-5 py-2">{content}</div>;

  return (
    <UserLayout title="Bill of Materials" subtitle="Define production recipes for finished goods.">
      {content}
    </UserLayout>
  );
};

export const BOMsPage = () => <BOMsList />;
export const BOMsSettingsPanel = () => <BOMsList embedded />;
