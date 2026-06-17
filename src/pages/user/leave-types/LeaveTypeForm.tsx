import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

export interface LeaveTypeFormData {
  name: string;
  code: string;
  description: string;
  maxDaysPerYear: string;
  status: 'active' | 'inactive';
  sortOrder: string;
}

const codeValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) {
    return 'Code must be lowercase letters, numbers, and hyphens';
  }
  return undefined;
};

const validationSchema: ValidationSchema<LeaveTypeFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2)],
  code: [rules.required('Code is required'), codeValidator],
};

interface LeaveTypeFormProps {
  value?: LeaveTypeFormData;
  onSubmit: (data: LeaveTypeFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: LeaveTypeFormData = {
  name: '',
  code: '',
  description: '',
  maxDaysPerYear: '0',
  status: 'active',
  sortOrder: '0',
};

export const LeaveTypeForm = ({
  value,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: LeaveTypeFormProps) => {
  const [form, setForm] = useState<LeaveTypeFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields } =
    useFormValidation<LeaveTypeFormData>();

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
      toast.error(getApiErrorMessage(err, 'Failed to save leave type'));
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
          placeholder="e.g. Annual Leave"
          disabled={isSubmitting}
          error={Boolean(errors.name)}
        />
      </FormField>

      <FormField label="Code" error={errors.code} required>
        <Input
          value={form.code}
          onChange={(e) => {
            setForm((p) => ({ ...p, code: e.target.value.toLowerCase() }));
            clearFieldError('code');
          }}
          placeholder="e.g. annual-leave"
          disabled={isSubmitting}
          error={Boolean(errors.code)}
        />
      </FormField>

      <FormField label="Description">
        <Input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Optional description"
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label="Annual allocation (days)">
        <Input
          type="number"
          min={0}
          value={form.maxDaysPerYear}
          onChange={(e) => setForm((p) => ({ ...p, maxDaysPerYear: e.target.value }))}
          placeholder="Days allocated per employee per year"
          disabled={isSubmitting}
        />
      </FormField>

      <FormField label="Sort order">
        <Input
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
          disabled={isSubmitting}
        />
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
