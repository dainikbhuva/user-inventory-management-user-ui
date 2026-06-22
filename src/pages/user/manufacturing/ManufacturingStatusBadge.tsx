import { cn } from '../../../shared/utils/cn';

type MfgStatus =
  | 'active' | 'inactive'
  | 'draft' | 'in_progress' | 'completed' | 'cancelled'
  | 'issued' | 'posted';

const STATUS_STYLES: Record<MfgStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  issued: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  posted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const STATUS_LABELS: Record<MfgStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  issued: 'Issued',
  posted: 'Posted',
};

interface Props {
  status: string;
  className?: string;
}

export const ManufacturingStatusBadge = ({ status, className }: Props) => {
  const s = status as MfgStatus;
  const style = STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-600';
  const label = STATUS_LABELS[s] ?? status;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', style, className)}>
      {label}
    </span>
  );
};
