import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { HOLIDAY_TYPES, HOLIDAY_TYPE_LABELS } from '../../../shared/constants/holidayType';
import type { HolidayFormData } from '../../../shared/types/holiday.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

const validationSchema: ValidationSchema<HolidayFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2)],
  date: [rules.required('Date is required')],
};

interface HolidayFormProps {
  value?: HolidayFormData;
  onSubmit: (data: HolidayFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: HolidayFormData = {
  name: '',
  date: '',
  holidayType: 'company',
  isRecurring: false,
  description: '',
  status: 'active',
};

export const HolidayForm = ({
  value,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: HolidayFormProps) => {
  const [form, setForm] = useState<HolidayFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields } =
    useFormValidation<HolidayFormData>();

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
      toast.error(getApiErrorMessage(err, 'Failed to save holiday'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Holiday name" error={errors.name} required>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
            clearFieldError('name');
          }}
          placeholder="e.g. Republic Day"
          disabled={isSubmitting}
          error={Boolean(errors.name)}
        />
      </FormField>

      <FormField label="Date" error={errors.date} required>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => {
            setForm((p) => ({ ...p, date: e.target.value }));
            clearFieldError('date');
          }}
          disabled={isSubmitting}
          error={Boolean(errors.date)}
        />
      </FormField>

      <FormField label="Holiday type">
        <Select
          value={form.holidayType}
          onChange={(e) =>
            setForm((p) => ({ ...p, holidayType: e.target.value as HolidayFormData['holidayType'] }))
          }
          disabled={isSubmitting}
        >
          {HOLIDAY_TYPES.map((type) => (
            <option key={type} value={type}>
              {HOLIDAY_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </FormField>

      <label className="flex items-start gap-3 rounded-sm border border-base bg-surface-2 px-4 py-3">
        <input
          type="checkbox"
          checked={form.isRecurring}
          onChange={(e) => setForm((p) => ({ ...p, isRecurring: e.target.checked }))}
          disabled={isSubmitting}
          className="mt-1 h-4 w-4 rounded border-base text-primary focus:ring-primary"
        />
        <span>
          <span className="block text-sm font-medium text-body">Repeat every year</span>
          <span className="mt-0.5 block text-xs text-muted">
            Uses the same month and day each year (e.g. 26 January).
          </span>
        </span>
      </label>

      <FormField label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Optional notes"
          disabled={isSubmitting}
          rows={3}
          className="w-full rounded-sm border border-base bg-surface px-3 py-2 text-sm text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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
