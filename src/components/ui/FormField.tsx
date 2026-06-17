import type { ReactNode } from 'react';
import { cn } from '../../shared/utils/cn';
import { FieldError } from './FieldError';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  error,
  required,
  children,
  className,
}: FormFieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <label className="text-sm font-medium text-body">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
    </label>
    {children}
    <FieldError message={error} />
  </div>
);
