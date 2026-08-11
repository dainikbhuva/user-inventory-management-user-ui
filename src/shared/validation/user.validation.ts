import { rules, type ValidationSchema } from '../utils/validation';
import type { UserFormValues } from '../../pages/user/users/UserForm';

export const getUserValidationSchema = (options: {
  requireEmployeeCode: boolean;
  requirePassword: boolean;
}): ValidationSchema<UserFormValues> => {
  const schema: ValidationSchema<UserFormValues> = {
    firstName: [
      rules.required('First name is required'),
      rules.minLength(2, 'First name must be at least 2 characters'),
    ],
    lastName: [
      rules.required('Last name is required'),
      rules.minLength(2, 'Last name must be at least 2 characters'),
    ],
    email: [rules.required('Email is required'), rules.email()],
    phone: [rules.indianMobile()],
    roleId: [rules.required('Role is required')],
    address: [rules.maxLength(300, 'Address cannot exceed 300 characters')],
  };

  if (options.requireEmployeeCode) {
    schema.employeeCode = [
      rules.required('Employee code is required'),
      rules.alphanumericCode('Employee code can only contain letters, numbers, hyphens, and underscores'),
    ];
  }

  if (options.requirePassword) {
    schema.password = [
      rules.required('Password is required'),
      rules.minLength(6, 'Password must be at least 6 characters'),
    ];
    schema.confirmPassword = [
      rules.required('Confirm password is required'),
      (value, form) => (value !== form.password ? 'Passwords must match' : undefined),
    ];
  } else {
    schema.password = [
      (value) => {
        if (value && value.length > 0 && value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return undefined;
      },
    ];
    schema.confirmPassword = [
      (value, form) => {
        if (form.password && value !== form.password) {
          return 'Passwords must match';
        }
        return undefined;
      },
    ];
  }

  return schema;
};
