import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { toast } from '../../../shared/utils/toast';
import type { MasterRecordFormData } from './MasterRecordForm';

export interface WarehouseFormData extends MasterRecordFormData {
  address: string;
}

const codeValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) {
    return 'Code must be lowercase letters, numbers, and hyphens';
  }
  return undefined;
};

const validationSchema: ValidationSchema<WarehouseFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2)],
  code: [rules.required('Code is required'), codeValidator],
};

const defaultValues: WarehouseFormData = {
  name: '',
  code: '',
  description: '',
  address: '',
  status: 'active',
  sortOrder: '0',
};

interface WarehouseFormProps {
  value?: WarehouseFormData;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export const WarehouseForm = ({ value, onSubmit, onCancel, submitLabel = 'Save' }: WarehouseFormProps) => {
  const [form, setForm] = useState<WarehouseFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<WarehouseFormData>();

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
      clearErrors();
      await onSubmit(form);
      clearErrors();
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to save warehouse'));
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
          placeholder="e.g. Main warehouse"
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
          placeholder="e.g. main-warehouse"
          disabled={isSubmitting}
          error={Boolean(errors.code)}
        />
      </FormField>

      <FormField label="Address">
        <Input
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          placeholder="Street, city, pin code"
          disabled={isSubmitting}
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
