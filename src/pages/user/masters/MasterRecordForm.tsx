import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { toast } from '../../../shared/utils/toast';

export interface MasterRecordFormData {
  name: string;
  code: string;
  description: string;
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

const sortOrderValidator = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) return 'Sort order must be 0 or greater';
  return undefined;
};

const validationSchema: ValidationSchema<MasterRecordFormData> = {
  name: [rules.required('Name is required'), rules.minLength(2)],
  code: [rules.required('Code is required'), codeValidator],
  sortOrder: [sortOrderValidator],
};

interface MasterRecordFormProps {
  value?: MasterRecordFormData;
  onSubmit: (data: MasterRecordFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: MasterRecordFormData = {
  name: '',
  code: '',
  description: '',
  status: 'active',
  sortOrder: '0',
};

export const MasterRecordForm = ({
  value,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: MasterRecordFormProps) => {
  const [form, setForm] = useState<MasterRecordFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<MasterRecordFormData>();

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
      toast.error(applyApiErrors(err, 'Failed to save record'));
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
          placeholder="e.g. Engineering"
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
          placeholder="e.g. engineering"
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

      <FormField label="Sort order" error={errors.sortOrder}>
        <Input
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) => {
            setForm((p) => ({ ...p, sortOrder: e.target.value }));
            clearFieldError('sortOrder');
          }}
          disabled={isSubmitting}
          error={Boolean(errors.sortOrder)}
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
