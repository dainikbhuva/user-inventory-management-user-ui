import type { SearchStatusFilterValues } from '../constants/tableFilters';

export const filterBySearchStatus = <T extends { status: string }>(
  items: T[],
  filters: SearchStatusFilterValues,
  searchFields: ((item: T) => string)[]
): T[] => {
  let result = items;

  if (filters.status !== 'all') {
    result = result.filter((item) => item.status === filters.status);
  }

  const query = filters.search.trim().toLowerCase();
  if (query) {
    result = result.filter((item) =>
      searchFields.some((field) => field(item).toLowerCase().includes(query))
    );
  }

  return result;
};
