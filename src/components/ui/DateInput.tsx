import * as React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
}

const openDatePicker = (input: HTMLInputElement | null) => {
  if (!input || input.disabled) return;
  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker();
      return;
    } catch {
      // showPicker can throw if not triggered by user gesture in some browsers
    }
  }
  input.focus();
  input.click();
};

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, error, disabled, onClick, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <div className="relative w-full">
        <input
          type="date"
          ref={setRefs}
          disabled={disabled}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) openDatePicker(innerRef.current);
          }}
          className={cn(
            'date-input flex h-10 w-full rounded-sm border border-base bg-surface py-2 pl-3 pr-11 text-sm text-body',
            'placeholder:text-muted transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => openDatePicker(innerRef.current)}
          className={cn(
            'absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm',
            'text-muted transition-colors hover:bg-surface-2 hover:text-primary',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label="Open calendar"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
