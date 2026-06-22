import type { StockMovementStatus } from '../../../shared/types/inventoryProduct.types';

export const StockMovementStatusBadge = ({ status }: { status: StockMovementStatus }) => {
  if (status === 'posted') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20">
        Posted
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500 ring-1 ring-red-500/20">
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-500/20">
      Draft
    </span>
  );
};
