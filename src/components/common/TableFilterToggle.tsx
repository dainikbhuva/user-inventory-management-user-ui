import { SlidersHorizontal } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../shared/utils/cn'

interface TableFilterToggleProps {
  open: boolean
  onToggle: () => void
  activeCount?: number
  className?: string
  iconOnly?: boolean
}

export const TableFilterToggle = ({
  open,
  onToggle,
  activeCount = 0,
  className,
  iconOnly = false,
}: TableFilterToggleProps) => (
  <Button
    type="button"
    variant={open ? 'default' : 'outline'}
    size={iconOnly ? 'icon' : 'default'}
    onClick={onToggle}
    className={cn('inline-flex items-center gap-2 relative', className)}
    aria-expanded={open}
    aria-label="Toggle filters"
    title="Filter"
  >
    <SlidersHorizontal className="h-4 w-4" />
    {!iconOnly && <span>Filter</span>}
    {activeCount > 0 && (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full text-xs font-semibold',
          iconOnly
            ? 'absolute -right-1 -top-1 h-4 min-w-4 px-1'
            : 'h-5 min-w-5 px-1.5',
          open ? 'bg-white/20 text-white' : 'bg-primary-soft text-primary'
        )}
      >
        {activeCount}
      </span>
    )}
  </Button>
)
