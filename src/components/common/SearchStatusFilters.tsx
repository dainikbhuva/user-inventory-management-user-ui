import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { FilterField } from './FilterField'

export const ACTIVE_INACTIVE_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'inactive', label: 'Inactive' },
] as const

interface SearchStatusFiltersProps {
  search?: string
  status: string
  onSearchChange?: (value: string) => void
  onStatusChange: (value: string) => void
  showSearch?: boolean
  searchPlaceholder?: string
  statusOptions?: ReadonlyArray<{ value: string; label: string }>
}

export const SearchStatusFilters = ({
  search = '',
  status,
  onSearchChange,
  onStatusChange,
  showSearch = true,
  searchPlaceholder = 'Search by name or code',
  statusOptions = ACTIVE_INACTIVE_STATUS_OPTIONS,
}: SearchStatusFiltersProps) => (
  <>
    {showSearch && onSearchChange && (
      <FilterField label="Search">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </FilterField>
    )}
    <FilterField label="Status">
      <Select value={status} onChange={(e) => onStatusChange(e.target.value)}>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FilterField>
  </>
)
