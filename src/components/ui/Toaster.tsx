import { useUIStore } from '../../store/ui.store';
import { Toast } from './Toast';

export const Toaster = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-[400px] flex-col gap-3 sm:bottom-6 sm:right-6"
    >
      {toasts.map((item) => (
        <Toast key={item.id} toast={item} onDismiss={removeToast} />
      ))}
    </div>
  );
};
