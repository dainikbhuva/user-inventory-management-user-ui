import { useMemo, useState } from 'react';
import type { SortDirection } from '../components/common/DataTable';
import {
  DEFAULT_SEARCH_STATUS_FILTERS,
  applySearchStatusFilters,
  type SearchStatusFilterValues,
} from '../shared/constants/tableFilters';
import { useTableFilters } from './useTableFilters';

interface UseClientDataTableOptions<T> {
  items: T[];
  filterFn: (items: T[], filters: SearchStatusFilterValues) => T[];
  getSortValue: (item: T, sortKey: string) => string | number;
  defaultSortBy?: string;
  defaultPageSize?: number;
}

export function useClientDataTable<T>({
  items,
  filterFn,
  getSortValue,
  defaultSortBy = 'name',
  defaultPageSize = 10,
}: UseClientDataTableOptions<T>) {
  const [filters, setFiltersState] = useState<SearchStatusFilterValues>(DEFAULT_SEARCH_STATUS_FILTERS);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const setFilters = (partial: Partial<SearchStatusFilterValues>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_SEARCH_STATUS_FILTERS);
    setCurrentPage(1);
  };

  const {
    filterOpen,
    setFilterOpen,
    draftFilters,
    setDraftFilters,
    activeFilterCount,
    handleApply,
    handleReset,
  } = useTableFilters(
    filters,
    DEFAULT_SEARCH_STATUS_FILTERS,
    setFilters,
    resetFilters,
    applySearchStatusFilters
  );

  const setSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => filterFn(items, filters), [items, filters, filterFn]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = getSortValue(a, sortBy);
      const bVal = getSortValue(b, sortBy);
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortBy, sortOrder, getSortValue]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rowIndexOffset = (currentPage - 1) * pageSize;
  const pageData = useMemo(
    () => sorted.slice(rowIndexOffset, rowIndexOffset + pageSize),
    [sorted, rowIndexOffset, pageSize]
  );

  return {
    filters,
    filterOpen,
    setFilterOpen,
    draftFilters,
    setDraftFilters,
    activeFilterCount,
    handleApply,
    handleReset,
    sortBy,
    sortOrder,
    setSort,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    totalItems,
    totalPages,
    rowIndexOffset,
    pageData,
  };
}
