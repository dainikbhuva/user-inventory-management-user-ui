import type { ReactNode } from 'react'
import { cn } from '../../shared/utils/cn'

interface FilterFieldProps {
  label: string
  children: ReactNode
  className?: string
}

export const FilterField = ({ label, children, className }: FilterFieldProps) => (
  <div className={cn('space-y-1.5', className)}>
    <label className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
    {children}
  </div>
)
