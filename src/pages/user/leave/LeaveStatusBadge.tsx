import { type ReactNode } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { PortalLeaveRequestRecord } from '../../../shared/types/leave.types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 ring-red-500/20',
  cancelled: 'bg-slate-500/10 text-slate-600 ring-slate-500/20',
};

export const LeaveStatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${STATUS_STYLES[status] ?? STATUS_STYLES.cancelled}`}
  >
    {status.replace('_', ' ')}
  </span>
);

export const LeaveActionButtons = ({
  row,
  onEdit,
  onApprove,
  onReject,
  onCancel,
  onDelete,
}: {
  row: PortalLeaveRequestRecord;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) => {
  const { permissions } = row;
  const actions: ReactNode[] = [];

  if (permissions.canEdit) {
    actions.push(
      <button
        key="edit"
        type="button"
        title="Edit"
        onClick={onEdit}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  if (permissions.canReview) {
    actions.push(
      <button
        key="approve"
        type="button"
        title="Approve"
        onClick={onApprove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-emerald-600 transition hover:border-emerald-500 hover:bg-emerald-500/10"
      >
        <Check className="h-4 w-4" />
      </button>,
      <button
        key="reject"
        type="button"
        title="Reject"
        onClick={onReject}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-red-500 transition hover:border-red-500 hover:bg-red-500/10"
      >
        <X className="h-4 w-4" />
      </button>
    );
  }

  if (permissions.canCancel) {
    actions.push(
      <button
        key="cancel"
        type="button"
        title="Cancel request"
        onClick={onCancel}
        className="inline-flex h-8 px-2 items-center justify-center rounded-sm border border-base bg-surface text-xs text-muted transition hover:bg-surface-2"
      >
        Cancel
      </button>
    );
  }

  if (permissions.canDelete) {
    actions.push(
      <button
        key="delete"
        type="button"
        title="Delete"
        onClick={onDelete}
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  if (!actions.length) {
    return <span className="text-xs text-muted">—</span>;
  }

  return <div className="inline-flex flex-nowrap items-center justify-center gap-1">{actions}</div>;
};
