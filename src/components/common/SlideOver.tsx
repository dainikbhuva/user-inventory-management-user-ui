import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

interface SlideOverProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const SlideOver = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: SlideOverProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-all duration-300',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl border-l border-base transition-transform duration-300 overflow-y-auto',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between border-b border-base p-5">
          <div>
            <h2 className="text-lg font-semibold text-body">{title}</h2>
            {description && <p className="text-sm text-muted mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-base text-body hover:bg-surface-2"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>

        {footer && (
          <div className="border-t border-base p-5">{footer}</div>
        )}
      </div>
    </div>
  );
};
