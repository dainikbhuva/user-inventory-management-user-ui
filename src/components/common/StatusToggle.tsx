import { cn } from '../../shared/utils/cn';
import { FieldError } from '../ui/FieldError';

interface StatusToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export const StatusToggle = ({ checked, onChange, disabled, error }: StatusToggleProps) => (
  <div>
    <p className="text-sm font-medium text-body">Status</p>
    <label
      className={cn(
        'mt-2 inline-flex cursor-pointer items-center',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        className={cn(
          'relative h-6 w-11 rounded-full border border-base bg-surface-3 transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
          'peer-checked:border-primary peer-checked:bg-primary',
          'after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full',
          'after:bg-white after:shadow-sm after:transition-transform',
          'peer-checked:after:translate-x-5'
        )}
      />
    </label>
    <FieldError message={error} />
  </div>
);
