import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { Pagination } from '../../../components/common/Pagination';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { SlideOver } from '../../../components/common/SlideOver';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { LeaveRequestForm, type LeaveRequestFormData } from './LeaveRequestForm';
import { LeaveActionButtons, LeaveStatusBadge } from './LeaveStatusBadge';
import { leaveService } from '../../../services/leave.service';
import { leaveTypeService } from '../../../services/leaveType.service';
import { portalUserService } from '../../../services/user.service';
import { useAuth } from '../../../shared/auth/useAuth';
import type { PortalLeaveBalanceRecord, PortalLeaveListMeta, PortalLeaveRequestRecord } from '../../../shared/types/leave.types';
import type { PortalLeaveTypeRecord } from '../../../shared/types/leave.types';
import type { PortalUserRecord } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useClientDataTable } from '../../../hooks/useClientDataTable';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

type TabKey = 'my' | 'approvals';
type LeaveSortField = 'employee' | 'leaveType' | 'startDate' | 'totalDays' | 'status';

const toFormValue = (item: PortalLeaveRequestRecord): LeaveRequestFormData => ({
  leaveTypeId: item.leaveType.id,
  startDate: item.startDate,
  endDate: item.endDate,
  reason: item.reason ?? '',
});

const getSortValue = (item: PortalLeaveRequestRecord, sortKey: string): string | number => {
  switch (sortKey) {
    case 'leaveType':
      return item.leaveType.name;
    case 'startDate':
      return item.startDate;
    case 'totalDays':
      return item.totalDays;
    case 'status':
      return item.status;
    default:
      return item.user.name;
  }
};

export const LeavePage = () => {
  const { moduleCode, itemCode } = useParams<{ moduleCode?: string; itemCode?: string }>();
  const M = PORTAL_PERMISSION_MODULES.leave;
  const { canView, canCreate, isLoading: permsLoading } = useModulePermissions(
    moduleCode ?? M.moduleCode,
    itemCode ?? M.itemCode
  );

  const { user } = useAuth();
  const [balances, setBalances] = useState<PortalLeaveBalanceRecord[]>([]);
  const [items, setItems] = useState<PortalLeaveRequestRecord[]>([]);
  const [meta, setMeta] = useState<PortalLeaveListMeta>({ isApprover: false, pendingApprovalCount: 0 });
  const [leaveTypes, setLeaveTypes] = useState<PortalLeaveTypeRecord[]>([]);
  const [currentUserRecord, setCurrentUserRecord] = useState<PortalUserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<PortalLeaveRequestRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortalLeaveRequestRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const myLeaves = useMemo(
    () => items.filter((item) => item.user.id === user?.id),
    [items, user?.id]
  );

  const approvalLeaves = useMemo(
    () => items.filter((item) => item.permissions.canReview),
    [items]
  );

  const visibleItems = activeTab === 'my' ? myLeaves : approvalLeaves;

  const table = useClientDataTable({
    items: visibleItems,
    filterFn: useCallback((list: PortalLeaveRequestRecord[]) => list, []),
    getSortValue: useCallback(getSortValue, []),
    defaultSortBy: 'startDate',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [leaveResult, typeItems, userItems, balanceItems] = await Promise.all([
        leaveService.getAll(),
        leaveTypeService.getActive(),
        portalUserService.getUsers(),
        leaveService.getBalances(),
      ]);
      setItems(leaveResult.items);
      setMeta(leaveResult.meta);
      setLeaveTypes(typeItems);
      setBalances(balanceItems);
      setCurrentUserRecord(userItems.find((item) => item.id === user?.id) ?? null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load leave requests'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (data: LeaveRequestFormData) => {
    await leaveService.create({
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason.trim() || undefined,
    });
    setIsAddOpen(false);
      toast.success('Leave request submitted. Manager approval is required first.');
    await loadData();
  };

  const handleUpdate = async (data: LeaveRequestFormData) => {
    if (!editing) return;
    await leaveService.update(editing.id, {
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason.trim() || undefined,
    });
    setEditing(null);
    toast.success('Leave request updated.');
    await loadData();
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await leaveService.review(id, { status });
      toast.success(status === 'approved' ? 'Leave request approved.' : 'Leave request rejected.');
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to review leave request'));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await leaveService.cancel(id);
      toast.success('Leave request cancelled.');
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel leave request'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await leaveService.delete(deleteTarget.id);
      toast.success('Leave request deleted.');
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete leave request'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<PortalLeaveRequestRecord>[] = useMemo(
    () => [
      {
        header: '#',
        width: '4%',
        align: 'center',
        render: (_row, index) => (
          <span className="text-muted tabular-nums">{table.rowIndexOffset + index + 1}</span>
        ),
      },
      ...(activeTab === 'approvals'
        ? [
            {
              header: 'Employee',
              sortable: true,
              sortKey: 'employee',
              render: (row: PortalLeaveRequestRecord) => (
                <span>
                  <span className="font-medium text-body">{row.user.name}</span>
                  <span className="text-xs text-muted"> · {row.user.employeeCode}</span>
                </span>
              ),
            } as DataTableColumn<PortalLeaveRequestRecord>,
          ]
        : []),
      {
        header: 'Leave type',
        sortable: true,
        sortKey: 'leaveType',
        render: (row) => <span className="text-sm text-body">{row.leaveType.name}</span>,
      },
      {
        header: 'Period',
        sortable: true,
        sortKey: 'startDate',
        render: (row) => (
          <span className="text-sm text-muted">
            {row.startDate} → {row.endDate}
          </span>
        ),
      },
      {
        header: 'Days',
        sortable: true,
        sortKey: 'totalDays',
        align: 'center',
        render: (row) => <span className="text-sm font-medium text-body">{row.totalDays}</span>,
      },
      {
        header: 'Approver',
        render: (row) => (
          <span className="text-sm text-muted">{row.approver?.name ?? 'Company admin'}</span>
        ),
      },
      {
        header: 'Status',
        sortable: true,
        sortKey: 'status',
        render: (row) => (
          <span className="inline-flex items-center gap-2">
            <LeaveStatusBadge status={row.status} />
            {row.approvalStageLabel ? (
              <span className="text-xs text-muted">{row.approvalStageLabel}</span>
            ) : null}
          </span>
        ),
      },
      {
        header: 'Actions',
        width: '10rem',
        align: 'center',
        render: (row) => (
          <LeaveActionButtons
            row={row}
            onEdit={() => setEditing(row)}
            onApprove={() => handleReview(row.id, 'approved')}
            onReject={() => handleReview(row.id, 'rejected')}
            onCancel={() => handleCancel(row.id)}
            onDelete={() => setDeleteTarget(row)}
          />
        ),
      },
    ],
    [activeTab, table.rowIndexOffset]
  );

  if (!permsLoading && !canView) {
    return (
      <UserLayout title="Leave" subtitle="Access restricted">
        <div className="flex h-48 items-center justify-center rounded-sm border border-base bg-surface text-muted">
          You do not have permission to view leave.
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Leave" subtitle="Apply leave, track balance, and approve team requests">
      {activeTab === 'my' && balances.length > 0 ? (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((balance) => (
            <div key={balance.leaveType.id} className="rounded-sm border border-base bg-surface px-4 py-3">
              <p className="text-xs text-muted">{balance.leaveType.name}</p>
              <p className="mt-1 text-2xl font-bold text-body">{balance.remaining}</p>
              <p className="text-xs text-muted">
                {balance.used} used · {balance.allocated} allocated
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-body">Leave management</h2>
          <p className="mt-1 text-sm text-muted">
            Employee → Reporting Manager → HR approval. Balance is deducted when fully approved.
          </p>
        </div>
        {canCreate ? (
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          disabled={leaveTypes.length === 0}
          className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply Leave
        </button>
        ) : null}
      </div>

      <div className="mb-4 flex gap-2 border-b border-base">
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'my'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-body'
          }`}
        >
          My Leave ({myLeaves.length})
        </button>
        {meta.isApprover ? (
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'approvals'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            }`}
          >
            Team Approvals
            {meta.pendingApprovalCount > 0 ? (
              <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700">
                {meta.pendingApprovalCount}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading leave requests...</div>
        ) : leaveTypes.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            Add leave types first from the Leave Types menu.
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            {activeTab === 'my'
              ? 'No leave requests yet. Click Apply Leave to submit your first request.'
              : 'No team leave requests waiting for your approval.'}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={table.pageData}
              rowKey={(row) => row.id}
              sortKey={table.sortBy}
              sortDirection={table.sortOrder}
              onSort={(key) => table.setSort(key as LeaveSortField)}
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

      <SlideOver open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Apply Leave">
        <LeaveRequestForm
          leaveTypes={leaveTypes}
          approverName={currentUserRecord?.reportingManager?.name}
          onSubmit={handleCreate}
          onCancel={() => setIsAddOpen(false)}
          submitLabel="Submit for approval"
        />
      </SlideOver>

      <SlideOver open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit Leave Request">
        {editing ? (
          <LeaveRequestForm
            value={toFormValue(editing)}
            leaveTypes={leaveTypes}
            approverName={editing.approver?.name}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Update"
          />
        ) : null}
      </SlideOver>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete leave request"
        message={
          deleteTarget
            ? `Delete leave request (${deleteTarget.startDate} to ${deleteTarget.endDate})?`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteTarget(null)}
      />
    </UserLayout>
  );
};
