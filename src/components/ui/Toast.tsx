import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import type { Toast as ToastData } from '../../store/ui.store';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    accentClass: 'border-l-emerald-500',
    progressClass: 'bg-emerald-500',
    title: 'Success',
  },
  error: {
    Icon: XCircle,
    iconClass: 'text-red-500',
    accentClass: 'border-l-red-500',
    progressClass: 'bg-red-500',
    title: 'Error',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-500',
    accentClass: 'border-l-amber-500',
    progressClass: 'bg-amber-500',
    title: 'Warning',
  },
  info: {
    Icon: Info,
    iconClass: 'text-primary',
    accentClass: 'border-l-primary',
    progressClass: 'bg-primary',
    title: 'Info',
  },
} as const;

export const Toast = ({ toast, onDismiss }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = toastConfig[toast.type];
  const { Icon } = config;
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));

    let leaveTimer: ReturnType<typeof setTimeout> | undefined;
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;

    if (duration > 0) {
      dismissTimer = setTimeout(() => {
        setIsLeaving(true);
        leaveTimer = setTimeout(() => onDismiss(toast.id), 300);
      }, duration);
    }

    return () => {
      cancelAnimationFrame(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [duration, onDismiss, toast.id]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto w-full min-w-[320px] max-w-[400px] overflow-hidden rounded-lg border border-base border-l-4 bg-surface shadow-soft transition-all duration-300',
        config.accentClass,
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconClass)} />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-body">
            {toast.title ?? config.title}
          </p>
          <p className="mt-0.5 text-sm text-muted">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted transition hover:bg-surface-2 hover:text-body"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {duration > 0 ? (
        <div className="h-1 w-full bg-surface-2">
          <div
            className={cn('h-full origin-left toast-progress', config.progressClass)}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      ) : null}
    </div>
  );
};
