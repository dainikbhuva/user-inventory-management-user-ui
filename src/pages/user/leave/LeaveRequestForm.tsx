import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import type { PortalLeaveTypeRecord } from '../../../shared/types/leave.types';

export interface LeaveRequestFormData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const validationSchema: ValidationSchema<LeaveRequestFormData> = {
  leaveTypeId: [rules.required('Leave type is required')],
  startDate: [rules.required('Start date is required')],
  endDate: [rules.required('End date is required')],
};

interface LeaveRequestFormProps {
  value?: LeaveRequestFormData;
  leaveTypes: PortalLeaveTypeRecord[];
  approverName?: string;
  onSubmit: (data: LeaveRequestFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: LeaveRequestFormData = {
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
};

export const LeaveRequestForm = ({
  value,
  leaveTypes,
  approverName,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
}: LeaveRequestFormProps) => {
  const [form, setForm] = useState<LeaveRequestFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields } =
    useFormValidation<LeaveRequestFormData>();

  useEffect(() => {
    setForm(value ?? defaultValues);
  }, [value]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateFields(form, validationSchema)) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }
    if (form.endDate < form.startDate) {
      toast.warning('End date must be on or after start date.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(form);
      clearErrors();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save leave request'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {approverName ? (
        <div className="rounded-sm border border-base bg-surface-2 px-4 py-3 text-sm text-muted">
          This request will be sent to <span className="font-medium text-body">{approverName}</span> for approval.
        </div>
      ) : (
        <div className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          No reporting manager is assigned. A company admin will review your request.
        </div>
      )}

      <FormField label="Leave type" error={errors.leaveTypeId} required>
        <Select
          value={form.leaveTypeId}
          onChange={(e) => {
            setForm((p) => ({ ...p, leaveTypeId: e.target.value }));
            clearFieldError('leaveTypeId');
          }}
          disabled={isSubmitting}
          error={Boolean(errors.leaveTypeId)}
        >
          <option value="">Select leave type</option>
          {leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
              {type.annualAllocation > 0 ? ` (${type.annualAllocation} days/year)` : ''}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start date" error={errors.startDate} required>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => {
              setForm((p) => ({ ...p, startDate: e.target.value }));
              clearFieldError('startDate');
            }}
            disabled={isSubmitting}
            error={Boolean(errors.startDate)}
          />
        </FormField>
        <FormField label="End date" error={errors.endDate} required>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => {
              setForm((p) => ({ ...p, endDate: e.target.value }));
              clearFieldError('endDate');
            }}
            disabled={isSubmitting}
            error={Boolean(errors.endDate)}
          />
        </FormField>
      </div>

      <FormField label="Reason">
        <Input
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
          placeholder="Why do you need this leave?"
          disabled={isSubmitting}
        />
      </FormField>

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
