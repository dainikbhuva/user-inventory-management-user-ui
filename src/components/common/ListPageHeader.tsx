import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { TableFilterToggle } from './TableFilterToggle'

interface ListPageHeaderProps {
  title: string
  subtitle: string
  addLabel: string
  onAdd?: () => void
  filterOpen: boolean
  onFilterToggle: () => void
  activeFilterCount: number
  showAdd?: boolean
  extraActions?: ReactNode
}

export const ListPageHeader = ({
  title,
  subtitle,
  addLabel,
  onAdd,
  filterOpen,
  onFilterToggle,
  activeFilterCount,
  showAdd = true,
  extraActions,
}: ListPageHeaderProps) => (
  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-body">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {extraActions}
      <TableFilterToggle
        open={filterOpen}
        onToggle={onFilterToggle}
        activeCount={activeFilterCount}
        iconOnly
      />
      {showAdd && onAdd && (
        <Button
          type="button"
          variant="default"
          className="inline-flex items-center gap-2"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          <span>{addLabel}</span>
        </Button>
      )}
    </div>
  </div>
)
