/** Status badge for trading module documents. */
import { cn } from '../../../shared/utils/cn';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  partially_received: { label: 'Partial', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  partially_dispatched: { label: 'Partial', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  received: { label: 'Received', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  posted: { label: 'Posted', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  dispatched: { label: 'Dispatched', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  invoiced: { label: 'Invoiced', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  partially_paid: { label: 'Partial', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

interface TradingStatusBadgeProps {
  status: string;
  className?: string;
}

export const TradingStatusBadge = ({ status, className }: TradingStatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
