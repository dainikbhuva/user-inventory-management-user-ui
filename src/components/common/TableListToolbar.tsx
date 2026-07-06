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
  showExport?: boolean
  onExport?: () => void
  exportDisabled?: boolean
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
  showExport,
  onExport,
  exportDisabled,
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
      showExport={showExport}
      onExport={onExport}
      exportDisabled={exportDisabled}
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
