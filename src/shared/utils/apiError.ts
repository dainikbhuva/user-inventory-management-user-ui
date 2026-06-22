import type { AxiosError } from 'axios';
import { getPermissionErrorMessage } from './permissionMessages';

export interface ApiValidationDetail {
  field: string;
  message: string;
}

interface ApiErrorBody {
  success?: boolean;
  statusCode?: number;
  message?: string;
  error?: {
    message?: string;
    details?: unknown;
  };
}

const isValidationDetail = (value: unknown): value is ApiValidationDetail =>
  typeof value === 'object' &&
  value !== null &&
  'field' in value &&
  'message' in value &&
  typeof (value as ApiValidationDetail).field === 'string' &&
  typeof (value as ApiValidationDetail).message === 'string';

export const getApiValidationDetails = (error: unknown): ApiValidationDetail[] => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  const details = axiosError.response?.data?.error?.details;
  if (!Array.isArray(details)) return [];
  return details.filter(isValidationDetail);
};

export const formatFieldLabel = (field: string): string =>
  field
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

export const mapApiDetailsToFieldErrors = <T extends object>(
  details: ApiValidationDetail[]
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const detail of details) {
    const key = detail.field as keyof T;
    if (!errors[key]) {
      errors[key] = detail.message;
    }
  }
  return errors;
};

/** Toast-friendly message including field-level validation details when present. */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const permissionMessage = getPermissionErrorMessage(error);
  if (permissionMessage) return permissionMessage;

  const details = getApiValidationDetails(error);
  if (details.length > 0) {
    if (details.length === 1) {
      const only = details[0]!;
      return `${formatFieldLabel(only.field)}: ${only.message}`;
    }
    return `Please fix ${details.length} fields: ${details
      .map((d) => `${formatFieldLabel(d.field)} — ${d.message}`)
      .join('; ')}`;
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  const data = axiosError.response?.data;

  if (data?.error?.message && data.error.message !== 'Validation failed') {
    return data.error.message;
  }
  if (data?.message) return data.message;
  if (error instanceof Error && error.message) return error.message;

  return fallback;
};

/** Apply API validation errors to form state; returns message for toast. */
export const handleApiFormError = <T extends object>(
  error: unknown,
  options: {
    setErrors: (errors: Partial<Record<keyof T, string>>) => void;
    fallback: string;
  }
): string => {
  const details = getApiValidationDetails(error);
  if (details.length > 0) {
    options.setErrors(mapApiDetailsToFieldErrors<T>(details));
  }
  return getApiErrorMessage(error, options.fallback);
};
