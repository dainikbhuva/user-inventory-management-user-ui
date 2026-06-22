import { useCallback, useState } from 'react';
import {
  validateForm,
  type FieldErrors,
  type ValidationSchema,
} from '../shared/utils/validation';
import { handleApiFormError } from '../shared/utils/apiError';

export function useFormValidation<T extends object>() {
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setSubmitError(null);
  }, []);

  const validateFields = useCallback(
    (values: T, schema: ValidationSchema<T>) => {
      const fieldErrors = validateForm(values, schema);
      setErrors(fieldErrors);
      return Object.keys(fieldErrors).length === 0;
    },
    []
  );

  const applyApiErrors = useCallback((error: unknown, fallback: string) => {
    const message = handleApiFormError<T>(error, { setErrors, fallback });
    setSubmitError(message);
    return message;
  }, []);

  return {
    errors,
    submitError,
    setSubmitError,
    setErrors,
    clearFieldError,
    clearErrors,
    validateFields,
    applyApiErrors,
  };
}
