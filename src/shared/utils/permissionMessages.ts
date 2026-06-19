import type { AxiosError } from 'axios';

interface ApiErrorBody {
  error?: { message?: string };
  message?: string;
}

export const PERMISSION_DENIED_MESSAGE =
  'You do not have permission to perform this action.';

export const permissionDeniedForModule = (moduleLabel: string): string =>
  `You do not have permission to access ${moduleLabel}. Contact your company admin if you need access.`;

export const isPermissionDeniedError = (error: unknown): boolean => {
  const status = (error as AxiosError)?.response?.status;
  return status === 403;
};

export const getPermissionErrorMessage = (error: unknown): string | null => {
  if (!isPermissionDeniedError(error)) return null;
  const data = (error as AxiosError<ApiErrorBody>).response?.data;
  return data?.error?.message || data?.message || PERMISSION_DENIED_MESSAGE;
};
