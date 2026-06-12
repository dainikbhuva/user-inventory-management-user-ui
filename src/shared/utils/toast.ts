import { useUIStore, type ToastInput, type ToastType } from '../../store/ui.store';

type ToastOptions = Omit<ToastInput, 'type' | 'message'>;

const show = (type: ToastType, message: string, options?: ToastOptions) => {
  useUIStore.getState().addToast({ type, message, ...options });
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    show('success', message, options),
  error: (message: string, options?: ToastOptions) =>
    show('error', message, options),
  warning: (message: string, options?: ToastOptions) =>
    show('warning', message, options),
  info: (message: string, options?: ToastOptions) =>
    show('info', message, options),
};
