import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { toast } from '../../../shared/utils/toast';
import type { MasterRecordFormData } from './MasterRecordForm';

export interface TaxFormData extends MasterRecordFormData {
  hsnCode: string;
  taxRate: string;
}

const codeValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) {
    return 'Code must be lowercase letters, numbers, and hyphens';
  }
  return undefined;
};

const hsnValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return 'HSN code is required';
  if (!/^[0-9]{4,8}$/.test(value.trim())) return 'HSN code must be 4 to 8 digits';
  return undefined;
};

const taxRateValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return 'Tax rate is required';
  const num = Number(value);
  if (Number.isNaN(num) || num < 0 || num > 100) return 'Tax rate must be between 0 and 100';
  return undefined;
};

const validationSchema: ValidationSchema<TaxFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2)],
  code: [rules.required('Code is required'), codeValidator],
  hsnCode: [hsnValidator],
  taxRate: [taxRateValidator],
};

const defaultValues: TaxFormData = {
  name: '',
  code: '',
  description: '',
  hsnCode: '',
  taxRate: '0',
  status: 'active',
  sortOrder: '0',
};

interface TaxFormProps {
  value?: TaxFormData;
  onSubmit: (data: TaxFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export const TaxForm = ({ value, onSubmit, onCancel, submitLabel = 'Save' }: TaxFormProps) => {
  const [form, setForm] = useState<TaxFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<TaxFormData>();

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
      toast.error(applyApiErrors(err, 'Failed to save tax record'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Tax name" error={errors.name} required>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
            clearFieldError('name');
          }}
          placeholder="e.g. GST 18%"
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
          placeholder="e.g. gst-18"
          disabled={isSubmitting}
          error={Boolean(errors.code)}
        />
      </FormField>

      <FormField label="HSN code" error={errors.hsnCode} required>
        <Input
          value={form.hsnCode}
          onChange={(e) => {
            setForm((p) => ({ ...p, hsnCode: e.target.value.replace(/\D/g, '').slice(0, 8) }));
            clearFieldError('hsnCode');
          }}
          placeholder="e.g. 8471"
          disabled={isSubmitting}
          error={Boolean(errors.hsnCode)}
        />
      </FormField>

      <FormField label="Tax rate (%)" error={errors.taxRate} required>
        <Input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={form.taxRate}
          onChange={(e) => {
            setForm((p) => ({ ...p, taxRate: e.target.value }));
            clearFieldError('taxRate');
          }}
          placeholder="e.g. 18"
          disabled={isSubmitting}
          error={Boolean(errors.taxRate)}
        />
      </FormField>

      <FormField label="Description">
        <Input
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Optional notes"
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
