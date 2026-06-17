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
  <label
    className={cn(
      'inline-flex h-6 w-10 shrink-0 cursor-pointer items-center justify-center',
      disabled && 'cursor-not-allowed opacity-40',
      className
    )}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      disabled={disabled}
      aria-label={ariaLabel}
      className="peer sr-only"
    />
    <span
      className={cn(
        'relative block h-5 w-9 rounded-full border border-base bg-surface-3 transition-colors',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1',
        'peer-checked:border-primary peer-checked:bg-primary',
        'after:absolute after:left-0.5 after:top-0.5 after:block after:h-3.5 after:w-3.5 after:rounded-full',
        'after:bg-white after:shadow-sm after:transition-transform after:content-[""]',
        'peer-checked:after:translate-x-4'
      )}
    />
  </label>
);
