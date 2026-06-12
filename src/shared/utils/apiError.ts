import type { AxiosError } from 'axios';

interface ApiErrorBody {
  success?: boolean;
  statusCode?: number;
  message?: string;
  error?: {
    message?: string;
    details?: unknown;
  };
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const data = axiosError.response?.data;

  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (error instanceof Error && error.message) return error.message;

  return fallback;
};
