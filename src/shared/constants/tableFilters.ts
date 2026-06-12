export const DEFAULT_SEARCH_STATUS_FILTERS = {
  search: '',
  status: 'all' as const,
}

export type SearchStatusFilterValues = {
  search: string
  status: 'active' | 'inactive' | 'all'
}

export const applySearchStatusFilters = (draft: SearchStatusFilterValues) => ({
  search: draft.search.trim(),
  status: draft.status,
})

export const DEFAULT_SUBSCRIPTION_FILTERS = {
  status: 'all' as const,
}

export type SubscriptionFilterValues = {
  status: 'active' | 'expired' | 'cancelled' | 'inactive' | 'all'
}
