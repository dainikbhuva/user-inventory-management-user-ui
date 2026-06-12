export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationRule<T> = (
  value: T[keyof T],
  form: T
) => string | undefined;

export type ValidationSchema<T> = Partial<
  Record<keyof T, ValidationRule<T>[]>
>;

export function validateForm<T extends object>(
  values: T,
  schema: ValidationSchema<T>
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const field of Object.keys(schema) as Array<keyof T>) {
    const rules = schema[field];
    if (!rules) continue;

    for (const rule of rules) {
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

  optionalMinLength:
    (min: number, message?: string) =>
    (value: unknown) => {
      if (typeof value !== 'string' || !value) return undefined;
      if (value.length < min) {
        return message ?? `Must be at least ${min} characters`;
      }
      return undefined;
    },
};
