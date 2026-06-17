import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { rules, type ValidationSchema } from '../../../shared/utils/validation';
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_AUDIENCE_TYPES,
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_STATUS_LABELS,
} from '../../../shared/constants/announcementAudience';
import type { AnnouncementFormData } from '../../../shared/types/announcement.types';
import { roleService } from '../../../services/role.service';
import { departmentService } from '../../../services/master.service';
import { designationService } from '../../../services/master.service';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

const validationSchema: ValidationSchema<AnnouncementFormData> = {
  title: [rules.required('Title is required'), rules.minLength(2)],
  startDate: [rules.required('Start date is required')],
  endDate: [rules.required('End date is required')],
};

interface AudienceOption {
  id: string;
  name: string;
}

interface AnnouncementFormProps {
  value?: AnnouncementFormData;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const defaultValues: AnnouncementFormData = {
  title: '',
  description: '',
  audienceType: 'all',
  audienceIds: [],
  startDate: '',
  endDate: '',
  priority: 'normal',
  status: 'draft',
};

export const AnnouncementForm = ({
  value,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: AnnouncementFormProps) => {
  const [form, setForm] = useState<AnnouncementFormData>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audienceOptions, setAudienceOptions] = useState<AudienceOption[]>([]);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields } =
    useFormValidation<AnnouncementFormData>();

  useEffect(() => {
    setForm(value ?? defaultValues);
  }, [value]);

  useEffect(() => {
    if (form.audienceType === 'all') {
      setAudienceOptions([]);
      return;
    }

    const load = async () => {
      try {
        setLoadingAudience(true);
        if (form.audienceType === 'roles') {
          const roles = await roleService.getActiveRoles();
          setAudienceOptions(roles.map((r) => ({ id: r.id, name: r.name })));
        } else if (form.audienceType === 'departments') {
          const items = await departmentService.getActive();
          setAudienceOptions(items.map((d) => ({ id: d.id, name: d.name })));
        } else {
          const items = await designationService.getActive();
          setAudienceOptions(items.map((d) => ({ id: d.id, name: d.name })));
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load audience options'));
        setAudienceOptions([]);
      } finally {
        setLoadingAudience(false);
      }
    };

    void load();
  }, [form.audienceType]);

  const toggleAudienceId = (id: string) => {
    setForm((prev) => ({
      ...prev,
      audienceIds: prev.audienceIds.includes(id)
        ? prev.audienceIds.filter((item) => item !== id)
        : [...prev.audienceIds, id],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateFields(form, validationSchema)) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }
    if (form.startDate > form.endDate) {
      toast.warning('End date must be on or after start date.');
      return;
    }
    if (form.audienceType !== 'all' && form.audienceIds.length === 0) {
      toast.warning('Select at least one audience target.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...form,
        audienceIds: form.audienceType === 'all' ? [] : form.audienceIds,
      });
      clearErrors();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save announcement'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Title" error={errors.title} required>
        <Input
          value={form.title}
          onChange={(e) => {
            setForm((p) => ({ ...p, title: e.target.value }));
            clearFieldError('title');
          }}
          placeholder="e.g. New Attendance Policy"
          disabled={isSubmitting}
          error={Boolean(errors.title)}
        />
      </FormField>

      <FormField label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Full announcement message for employees..."
          disabled={isSubmitting}
          rows={4}
          className="w-full rounded-sm border border-base bg-surface px-3 py-2 text-sm text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Priority">
          <Select
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                priority: e.target.value as AnnouncementFormData['priority'],
              }))
            }
            disabled={isSubmitting}
          >
            {ANNOUNCEMENT_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {ANNOUNCEMENT_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                status: e.target.value as AnnouncementFormData['status'],
              }))
            }
            disabled={isSubmitting}
          >
            {ANNOUNCEMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ANNOUNCEMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Audience">
        <Select
          value={form.audienceType}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              audienceType: e.target.value as AnnouncementFormData['audienceType'],
              audienceIds: [],
            }))
          }
          disabled={isSubmitting}
        >
          {ANNOUNCEMENT_AUDIENCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {ANNOUNCEMENT_AUDIENCE_LABELS[type]}
            </option>
          ))}
        </Select>
      </FormField>

      {form.audienceType !== 'all' ? (
        <div className="rounded-sm border border-base bg-surface-2/40 p-4">
          <p className="mb-3 text-sm font-medium text-body">
            Select {ANNOUNCEMENT_AUDIENCE_LABELS[form.audienceType].toLowerCase()}
          </p>
          {loadingAudience ? (
            <p className="text-sm text-muted">Loading options...</p>
          ) : audienceOptions.length === 0 ? (
            <p className="text-sm text-muted">No options available. Add them in Settings first.</p>
          ) : (
            <div className="theme-scrollbar max-h-40 space-y-2 overflow-y-auto pr-1">
              {audienceOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded-sm border border-base bg-surface px-3 py-2 text-sm transition hover:border-primary/40"
                >
                  <input
                    type="checkbox"
                    checked={form.audienceIds.includes(option.id)}
                    onChange={() => toggleAudienceId(option.id)}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-base text-primary focus:ring-primary"
                  />
                  <span className="text-body">{option.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted">This announcement will be visible to every active employee.</p>
      )}

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
