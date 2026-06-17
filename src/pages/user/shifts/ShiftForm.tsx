import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import type { ShiftFormData } from '../../../shared/types/shift.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

const codeValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) {
    return 'Code must be lowercase letters, numbers, and hyphens';
  }
  return undefined;
};

const validationSchema: ValidationSchema<ShiftFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2)],
  code: [rules.required('Code is required'), codeValidator],
  startTime: [rules.required('Start time is required')],
  endTime: [rules.required('End time is required')],
};

interface ShiftFormProps {
  value?: ShiftFormData;
  onSubmit: (data: ShiftFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: ShiftFormData = {
  name: '',
  code: '',
  startTime: '09:00',
  endTime: '18:00',
  breakMinutes: '60',
  lateAfterMinutes: '15',
  halfDayHours: '4',
  description: '',
  status: 'active',
  sortOrder: '0',
};

export const ShiftForm = ({ value, onSubmit, onCancel, submitLabel = 'Save' }: ShiftFormProps) => {
  const [form, setForm] = useState<ShiftFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields } =
    useFormValidation<ShiftFormData>();

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
      toast.error(getApiErrorMessage(err, 'Failed to save shift'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Shift name" error={errors.name} required>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
            clearFieldError('name');
          }}
          placeholder="e.g. Morning shift"
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
          placeholder="e.g. morning"
          disabled={isSubmitting}
          error={Boolean(errors.code)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start time" error={errors.startTime} required>
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => {
              setForm((p) => ({ ...p, startTime: e.target.value }));
              clearFieldError('startTime');
            }}
            disabled={isSubmitting}
            error={Boolean(errors.startTime)}
          />
        </FormField>
        <FormField label="End time" error={errors.endTime} required>
          <Input
            type="time"
            value={form.endTime}
            onChange={(e) => {
              setForm((p) => ({ ...p, endTime: e.target.value }));
              clearFieldError('endTime');
            }}
            disabled={isSubmitting}
            error={Boolean(errors.endTime)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Break (min)">
          <Input
            type="number"
            min={0}
            value={form.breakMinutes}
            onChange={(e) => setForm((p) => ({ ...p, breakMinutes: e.target.value }))}
            disabled={isSubmitting}
          />
        </FormField>
        <FormField label="Late after (min)">
          <Input
            type="number"
            min={0}
            value={form.lateAfterMinutes}
            onChange={(e) => setForm((p) => ({ ...p, lateAfterMinutes: e.target.value }))}
            disabled={isSubmitting}
          />
        </FormField>
        <FormField label="Half day (hours)">
          <Input
            type="number"
            min={0}
            step={0.5}
            value={form.halfDayHours}
            onChange={(e) => setForm((p) => ({ ...p, halfDayHours: e.target.value }))}
            disabled={isSubmitting}
          />
        </FormField>
      </div>

      <FormField label="Description">
        <Input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Optional"
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
