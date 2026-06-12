import { cn } from '../../shared/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const pageSizes = [5, 10, 20, 50];

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">

      {/* Left: record range info */}
      <p className="text-sm text-muted">
        Showing{' '}
        <span className="font-semibold text-body">{startItem}–{endItem}</span>
        {' '}of{' '}
        <span className="font-semibold text-body">{totalItems}</span>
        {' '}results
      </p>

      {/* Right: rows selector + page buttons */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted whitespace-nowrap">Rows per page</label>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="appearance-none cursor-pointer rounded-sm border border-base bg-surface pl-3 pr-8 py-2 text-sm font-medium text-body hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Page buttons */}
        <nav className="inline-flex items-center gap-1" aria-label="Pagination">

          {/* Prev */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-base bg-surface text-body hover:bg-surface-2 hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((page, i) =>
            page === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-sm border text-sm font-medium transition px-2',
                  page === currentPage
                    ? 'border-primary bg-primary text-white cursor-default'
                    : 'border-base bg-surface text-body hover:bg-surface-2 hover:border-primary'
                )}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-base bg-surface text-body hover:bg-surface-2 hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};