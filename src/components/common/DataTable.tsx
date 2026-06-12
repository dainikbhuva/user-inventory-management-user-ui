import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  width?: string;
  sortable?: boolean;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((item: T) => string);
  emptyMessage?: string;
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSort?: (sortKey: string) => void;
  rowIndexOffset?: number;
}

export const DataTable = <T extends object>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No records to display',
  sortKey = null,
  sortDirection = 'asc',
  onSort,
  rowIndexOffset = 0,
}: DataTableProps<T>) => {
  const getRowKey = (item: T) =>
    typeof rowKey === 'function' ? rowKey(item) : String(item[rowKey]);

  const renderSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable || !column.sortKey) return null;

    const isActive = sortKey === column.sortKey;
    const Icon = !isActive ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown;

    return (
      <Icon
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          isActive ? 'text-primary' : 'text-muted opacity-60'
        )}
      />
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="data-table min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-surface-2">
            {columns.map((column) => {
              const isSortable = column.sortable && column.sortKey && onSort;

              return (
                <th
                  key={column.header}
                  className={cn(
                    'px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.sortKey!)}
                      className={cn(
                        'inline-flex items-center gap-1.5 transition hover:text-body',
                        sortKey === column.sortKey && 'text-body'
                      )}
                    >
                      <span>{column.header}</span>
                      {renderSortIcon(column)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="bg-surface">
          {data.length === 0 ? (
            <tr>
              <td
                className="border-none px-4 py-8 text-center text-sm text-muted"
                colSpan={columns.length}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-10 h-10 text-muted opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={getRowKey(item)}
                className="group hover:bg-surface-2 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn(
                      'px-4 py-2 text-sm text-body align-middle',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item, rowIndexOffset + index)
                      : String(item[column.accessor as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
