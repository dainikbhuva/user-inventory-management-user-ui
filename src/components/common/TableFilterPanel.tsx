import type { ReactNode } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { cn } from '../../shared/utils/cn'
import { Button } from '../ui/Button'

interface TableFilterPanelProps {
  open: boolean
  onApply: () => void
  onReset: () => void
  children: ReactNode
  className?: string
  isApplying?: boolean
}

export const TableFilterPanel = ({
  open,
  onApply,
  onReset,
  children,
  className,
  isApplying = false,
}: TableFilterPanelProps) => (
  <div
    className={cn(
      'grid transition-all duration-300 ease-in-out',
      open ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0 mb-0',
      className
    )}
  >
    <div className="overflow-hidden">
      <div
        className="rounded-sm border border-base bg-surface p-4 shadow-sm"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-base pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onReset} disabled={isApplying} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button type="button" onClick={onApply} disabled={isApplying} className="gap-2">
            {!isApplying && <Check className="h-4 w-4" />}
            {isApplying ? 'Applying...' : 'Apply'}
          </Button>
        </div>
      </div>
    </div>
  </div>
)
