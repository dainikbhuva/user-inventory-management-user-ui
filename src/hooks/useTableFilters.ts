import { useEffect, useState } from 'react'
import { countActiveFilters } from '../shared/utils/countActiveFilters'

export function useTableFilters<T extends Record<string, unknown>>(
  applied: T,
  defaults: T,
  setFilters: (filters: Partial<T>) => void,
  resetFilters: () => void,
  transformOnApply?: (draft: T) => Partial<T>
) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<T>(defaults)

  const activeFilterCount = countActiveFilters(applied, defaults)

  useEffect(() => {
    if (filterOpen) {
      setDraftFilters(applied)
    }
  }, [filterOpen, applied])

  const handleApply = () => {
    const payload = transformOnApply ? transformOnApply(draftFilters) : draftFilters
    setFilters(payload)
  }

  const handleReset = () => {
    setDraftFilters(defaults)
    resetFilters()
  }

  return {
    filterOpen,
    setFilterOpen,
    draftFilters,
    setDraftFilters,
    activeFilterCount,
    handleApply,
    handleReset,
  }
}
