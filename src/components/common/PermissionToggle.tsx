import { cn } from '../../shared/utils/cn';

interface PermissionToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}

export const PermissionToggle = ({
  checked,
  onChange,
  disabled,
  ariaLabel,
  className,
}: PermissionToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) onChange(!checked);
    }}
    className={cn(
      'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      checked ? 'border-primary bg-primary' : 'border-base bg-surface-3',
      disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
      className
    )}
  >
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute left-0.5 top-0.5 block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform',
        checked && 'translate-x-4'
      )}
    />
  </button>
);
