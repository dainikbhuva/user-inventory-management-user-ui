export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationRule<T> = (
  value: T[keyof T],
  form: T
) => string | undefined;

export type ValidationSchema<T> = Partial<
  Record<keyof T, ValidationRule<T>[]>
>;

export const INDIAN_GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const INDIAN_PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const INDIAN_PINCODE_REGEX = /^\d{6}$/;
export const CODE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
export const ALPHANUMERIC_CODE_REGEX = /^[A-Za-z0-9_-]+$/;

export function validateForm<T extends object>(
  values: T,
  schema: ValidationSchema<T>
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const field of Object.keys(schema) as Array<keyof T>) {
    const fieldRules = schema[field];
    if (!fieldRules) continue;

    for (const rule of fieldRules) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }

  return errors;
}

export const rules = {
  required:
    (message = 'This field is required') =>
    (value: unknown) => {
      if (typeof value === 'string' && !value.trim()) return message;
      if (value === null || value === undefined || value === '') return message;
      return undefined;
    },

  email:
    (message = 'Please enter a valid email address') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) return message;
      return undefined;
    },

  minLength:
    (min: number, message?: string) =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (value.trim().length < min) {
        return message ?? `Must be at least ${min} characters`;
      }
      return undefined;
    },

  maxLength:
    (max: number, message?: string) =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (value.trim().length > max) {
        return message ?? `Must be at most ${max} characters`;
      }
      return undefined;
    },

  optionalMinLength:
    (min: number, message?: string) =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value) return undefined;
      if (value.length < min) {
        return message ?? `Must be at least ${min} characters`;
      }
      return undefined;
    },

  optionalPattern:
    (pattern: RegExp, message: string) =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!pattern.test(value.trim())) return message;
      return undefined;
    },

  optionalUrl:
    (message = 'Please enter a valid URL (e.g. https://example.com)') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      const raw = value.trim();
      try {
        new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
        return undefined;
      } catch {
        return message;
      }
    },

  nonNegativeNumber:
    (message = 'Must be 0 or greater') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) return message;
      return undefined;
    },

  positiveNumber:
    (message = 'Must be greater than 0') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) return message;
      return undefined;
    },

  alphanumericCode:
    (message = 'Code can only contain letters, numbers, hyphens, and underscores') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!ALPHANUMERIC_CODE_REGEX.test(value.trim())) return message;
      return undefined;
    },

  masterCode:
    (message = 'Code must be lowercase letters, numbers, and hyphens') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!CODE_REGEX.test(value.trim())) return message;
      return undefined;
    },

  indianGst:
    (message = 'Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5)') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!INDIAN_GST_REGEX.test(value.trim().toUpperCase())) return message;
      return undefined;
    },

  indianPan:
    (message = 'Enter a valid PAN (e.g. ABCDE1234F)') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!INDIAN_PAN_REGEX.test(value.trim().toUpperCase())) return message;
      return undefined;
    },

  indianMobile:
    (message = 'Enter a valid 10-digit mobile number') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!INDIAN_MOBILE_REGEX.test(value.trim())) return message;
      return undefined;
    },

  indianPincode:
    (message = 'Pincode must be 6 digits') =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value.trim()) return undefined;
      if (!INDIAN_PINCODE_REGEX.test(value.trim())) return message;
      return undefined;
    },
};
