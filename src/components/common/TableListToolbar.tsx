import type { ReactNode } from 'react'
import { ListPageHeader } from './ListPageHeader'
import { TableFilterPanel } from './TableFilterPanel'

interface TableListToolbarProps {
  title: string
  subtitle: string
  addLabel: string
  onAdd?: () => void
  showAdd?: boolean
  filterOpen: boolean
  onFilterToggle: () => void
  activeFilterCount: number
  onApply: () => void
  onReset: () => void
  isApplying?: boolean
  extraActions?: ReactNode
  children: ReactNode
}

export const TableListToolbar = ({
  title,
  subtitle,
  addLabel,
  onAdd,
  showAdd = true,
  filterOpen,
  onFilterToggle,
  activeFilterCount,
  onApply,
  onReset,
  isApplying,
  extraActions,
  children,
}: TableListToolbarProps) => (
  <>
    <ListPageHeader
      title={title}
      subtitle={subtitle}
      addLabel={addLabel}
      onAdd={onAdd}
      showAdd={showAdd}
      filterOpen={filterOpen}
      onFilterToggle={onFilterToggle}
      activeFilterCount={activeFilterCount}
      extraActions={extraActions}
    />
    <TableFilterPanel
      open={filterOpen}
      onApply={onApply}
      onReset={onReset}
      isApplying={isApplying}
    >
      {children}
    </TableFilterPanel>
  </>
)
