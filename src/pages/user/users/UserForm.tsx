import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import type { PortalRole } from '../../../shared/types/portal.types';

export interface UserFormData {
  name: string;
  phone: string;
  email: string;
  roleId: string;
  password: string;
  confirmPassword: string;
  status: 'active' | 'inactive';
}

interface UserFormProps {
  value?: UserFormData;
  roles: PortalRole[];
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: UserFormData = {
  name: '',
  phone: '',
  email: '',
  roleId: '',
  password: '',
  confirmPassword: '',
  status: 'active',
};

export const UserForm = ({
  value,
  roles,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: UserFormProps) => {
  const [form, setForm] = useState<UserFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields } = useFormValidation<UserFormData>();

  const isEdit = Boolean(value);

  const validationSchema = useMemo<ValidationSchema<UserFormData>>(() => ({
    name: [rules.required('Name is required'), rules.minLength(2)],
    email: [rules.required('Email is required'), rules.email()],
    roleId: [rules.required('Role is required')],
    password: isEdit
      ? [rules.optionalMinLength(6, 'Password must be at least 6 characters')]
      : [rules.required('Password is required'), rules.minLength(6, 'Password must be at least 6 characters')],
    confirmPassword: [
      (val, all) => {
        if (!isEdit && !all.password) return 'Confirm password is required';
        if (all.password && val !== all.password) return 'Passwords do not match';
        return undefined;
      },
    ],
  }), [isEdit]);

  useEffect(() => {
    setForm(value ?? defaultValues);
  }, [value]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateFields(form, validationSchema)) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(form);
      clearErrors();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Name" error={errors.name} required>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
            clearFieldError('name');
          }}
          placeholder="Full name"
          disabled={isSubmitting}
          error={Boolean(errors.name)}
        />
      </FormField>

      <FormField label="Phone number" error={errors.phone}>
        <Input
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="Contact number"
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label="Email" error={errors.email} required>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm((p) => ({ ...p, email: e.target.value }));
            clearFieldError('email');
          }}
          placeholder="user@company.com"
          disabled={isSubmitting}
          error={Boolean(errors.email)}
        />
      </FormField>

      <FormField label="Role" error={errors.roleId} required>
        <Select
          value={form.roleId}
          onChange={(e) => {
            setForm((p) => ({ ...p, roleId: e.target.value }));
            clearFieldError('roleId');
          }}
          disabled={isSubmitting}
          error={Boolean(errors.roleId)}
        >
          <option value="">Select role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
              {role.code === 'super_admin' ? ' (max 2 users)' : ''}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-muted">
          Super Admin role can only be assigned by an existing Super Admin (maximum 2 per company).
        </p>
      </FormField>

      <FormField label={isEdit ? 'New password' : 'Password'} error={errors.password} required={!isEdit}>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => {
              setForm((p) => ({ ...p, password: e.target.value }));
              clearFieldError('password');
            }}
            placeholder={isEdit ? 'Leave blank to keep current' : 'Minimum 6 characters'}
            disabled={isSubmitting}
            error={Boolean(errors.password)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      <FormField label="Confirm password" error={errors.confirmPassword} required={!isEdit}>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={(e) => {
              setForm((p) => ({ ...p, confirmPassword: e.target.value }));
              clearFieldError('confirmPassword');
            }}
            placeholder="Re-enter password"
            disabled={isSubmitting}
            error={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      <StatusToggle
        checked={form.status === 'active'}
        onChange={(checked) => setForm((p) => ({ ...p, status: checked ? 'active' : 'inactive' }))}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
