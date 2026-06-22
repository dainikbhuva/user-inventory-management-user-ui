import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { TableListToolbar } from '../../../components/common/TableListToolbar';
import { SearchStatusFilters } from '../../../components/common/SearchStatusFilters';
import { AnnouncementForm } from './AnnouncementForm';
import { announcementService } from '../../../services/announcement.service';
import type { AnnouncementFormData, PortalAnnouncementRecord } from '../../../shared/types/announcement.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { filterBySearchStatus } from '../../../shared/utils/clientTableFilters';
import type { SearchStatusFilterValues } from '../../../shared/constants/tableFilters';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { AccessDeniedPanel } from '../../../components/common/AccessDeniedPanel';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import {
  ANNOUNCEMENT_PRIORITY_STYLES,
  ANNOUNCEMENT_STATUS_LABELS,
} from '../../../shared/constants/announcementAudience';

type AnnouncementSortField = 'title' | 'startDate' | 'endDate' | 'priority' | 'status' | 'createdAt';

const formatDisplayDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const toFormValue = (item: PortalAnnouncementRecord): AnnouncementFormData => ({
  title: item.title,
  description: item.description ?? '',
  audienceType: item.audienceType,
  audienceIds: item.audienceIds,
  startDate: item.startDate,
  endDate: item.endDate,
  priority: item.priority,
  status: item.status,
});

const toPayload = (data: AnnouncementFormData) => ({
  title: data.title.trim(),
  description: data.description.trim() || undefined,
  audienceType: data.audienceType,
  audienceIds: data.audienceType === 'all' ? [] : data.audienceIds,
  startDate: data.startDate,
  endDate: data.endDate,
  priority: data.priority,
  status: data.status,
});

const filterItems = (items: PortalAnnouncementRecord[], filters: SearchStatusFilterValues) =>
  filterBySearchStatus(items, filters, [
    (item) => item.title,
    (item) => item.description ?? '',
    (item) => item.audienceTypeLabel,
    (item) => item.audienceTargets.map((t) => t.name).join(' '),
    (item) => item.statusLabel,
  ]);

const getSortValue = (item: PortalAnnouncementRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'startDate':
      return item.startDate;
    case 'endDate':
      return item.endDate;
    case 'priority':
      return item.priority;
    case 'status':
      return item.status;
    case 'createdAt':
      return item.createdAt ? new Date(item.createdAt).getTime() : 0;
    default:
      return item.title;
  }
};

const AudienceCell = ({ row }: { row: PortalAnnouncementRecord }) => (
  <div className="min-w-0">
    <p className="text-sm font-medium text-body">{row.audienceTypeLabel}</p>
    {row.audienceTargets.length > 0 ? (
      <p className="mt-0.5 truncate text-xs text-muted">
        {row.audienceTargets.map((t) => t.name).join(', ')}
      </p>
    ) : null}
  </div>
);

export const AnnouncementsPage = ({ embedded = false }: { embedded?: boolean }) => {
  const M = PORTAL_PERMISSION_MODULES.announcements;
  const { canView, canCreate, canEdit, canDelete, isLoading: permsLoading } = useModulePermissions(
    M.moduleCode,
    M.itemCode
  );

  const [items, setItems] = useState<PortalAnnouncementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortalAnnouncementRecord | null>(null);
  const [viewing, setViewing] = useState<PortalAnnouncementRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalAnnouncementRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const table = useClientDataTable({
    items,
    filterFn: useCallback(filterItems, []),
    getSortValue: useCallback(getSortValue, []),
    defaultSortBy: 'startDate',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setItems(await announcementService.getAll());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load announcements'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (data: AnnouncementFormData) => {
    await announcementService.create(toPayload(data));
    setIsAddOpen(false);
    toast.success(`Announcement "${data.title.trim()}" created.`);
    await loadData();
  };

  const handleUpdate = async (data: AnnouncementFormData) => {
    if (!editing) return;
    await announcementService.update(editing.id, toPayload(data));
    setEditing(null);
    toast.success(`Announcement "${data.title.trim()}" updated.`);
    await loadData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await announcementService.delete(deleteTarget.id);
      toast.success(`Announcement "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete announcement'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalAnnouncementRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_row, index) => (
          <span className="text-muted tabular-nums">{table.rowIndexOffset + index + 1}</span>
        ),
      },
      {
        header: 'Title',
        sortable: true,
        sortKey: 'title',
        render: (row) => (
          <div className="min-w-0">
            <p className="font-medium text-body">{row.title}</p>
            {row.isLive ? (
              <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20">
                Live
              </span>
            ) : null}
          </div>
        ),
      },
      {
        header: 'Audience',
        render: (row) => <AudienceCell row={row} />,
      },
      {
        header: 'Period',
        sortable: true,
        sortKey: 'startDate',
        render: (row) => (
          <span className="text-sm text-muted">
            {formatDisplayDate(row.startDate)} → {formatDisplayDate(row.endDate)}
          </span>
        ),
      },
      {
        header: 'Priority',
        sortable: true,
        sortKey: 'priority',
        render: (row) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${ANNOUNCEMENT_PRIORITY_STYLES[row.priority]}`}
          >
            {row.priorityLabel}
          </span>
        ),
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (row) => (
          <span className="text-sm font-medium text-body">{ANNOUNCEMENT_STATUS_LABELS[row.status]}</span>
        ),
      },
      {
        header: 'Actions',
        width: '10rem',
        align: 'center',
        render: (row) => (
          <div className="inline-flex flex-nowrap items-center justify-center gap-2">
            <button
              type="button"
              title="View"
              onClick={() => setViewing(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary"
            >
              <Eye className="h-4 w-4" />
            </button>
            {canEdit ? (
              <button
                type="button"
                title="Edit"
                onClick={() => setEditing(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:bg-surface-2 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                title="Delete"
                onClick={() => setDeleteTarget(row)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    [table.rowIndexOffset, canEdit, canDelete]
  );

  if (!permsLoading && !canView && !embedded) {
    return (
      <UserLayout title="Announcements" subtitle="Access restricted">
        <AccessDeniedPanel moduleLabel="Announcements" />
      </UserLayout>
    );
  }

  const accessDenied = !permsLoading && !canView;

  const pageContent = accessDenied ? (
    <AccessDeniedPanel moduleLabel="Announcements" />
  ) : (
    <>
      <TableListToolbar
        title="Announcements"
        subtitle="Create announcements with audience, schedule, and priority. Live items appear on the dashboard."
        addLabel="New announcement"
        onAdd={canCreate ? () => setIsAddOpen(true) : undefined}
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
          searchPlaceholder="Search by title, audience, or description..."
        />
      </TableListToolbar>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading announcements...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as AnnouncementSortField)}
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
        title="Delete announcement"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />

      <SlideOver
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="New announcement"
        description="Publish an update for selected employees. Set status to Active to show on the dashboard."
        footer={null}
      >
        <AnnouncementForm
          onCancel={() => setIsAddOpen(false)}
          onSubmit={handleCreate}
          submitLabel="Create announcement"
        />
      </SlideOver>

      <SlideOver
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit announcement"
        description="Update audience, schedule, or message."
        footer={null}
      >
        {editing ? (
          <AnnouncementForm
            key={editing.id}
            value={toFormValue(editing)}
            onCancel={() => setEditing(null)}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
          />
        ) : null}
      </SlideOver>

      <SlideOver
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? 'Announcement'}
        description={viewing ? formatDisplayDate(viewing.startDate) : undefined}
        footer={null}
      >
        {viewing ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ANNOUNCEMENT_PRIORITY_STYLES[viewing.priority]}`}
              >
                {viewing.priorityLabel}
              </span>
              <span className="inline-flex rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-base">
                {viewing.statusLabel}
              </span>
              {viewing.isLive ? (
                <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                  Live on dashboard
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Audience</p>
              <p className="mt-1 text-body">{viewing.audienceTypeLabel}</p>
              {viewing.audienceTargets.length > 0 ? (
                <p className="mt-1 text-muted">{viewing.audienceTargets.map((t) => t.name).join(', ')}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Visible period</p>
              <p className="mt-1 text-body">
                {formatDisplayDate(viewing.startDate)} — {formatDisplayDate(viewing.endDate)}
              </p>
            </div>
            {viewing.description ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-body">{viewing.description}</p>
              </div>
            ) : null}
            <p className="text-xs text-muted">Posted by {viewing.createdBy.name}</p>
          </div>
        ) : null}
      </SlideOver>
    </>
  );

  if (embedded) {
    return (
      <div className="overflow-hidden rounded-sm border border-base bg-surface p-6 shadow-sm">
        {pageContent}
      </div>
    );
  }

  return (
    <UserLayout title="Announcements" subtitle="Publish company-wide updates for your team">
      {pageContent}
    </UserLayout>
  );
};

export const AnnouncementsSettingsPanel = () => <AnnouncementsPage embedded />;
