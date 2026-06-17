import type { FormEvent } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import type { ProfileFormValues } from '../../../shared/types/profile.types';
import type { UserGender } from '../../../shared/types/portal.types';

interface ProfileEditFormProps {
  value: ProfileFormValues;
  isSubmitting?: boolean;
  onChange: (value: ProfileFormValues) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
}

export const ProfileEditForm = ({
  value,
  isSubmitting = false,
  onChange,
  onCancel,
  onSubmit,
}: ProfileEditFormProps) => {
  const set = <K extends keyof ProfileFormValues>(key: K, val: ProfileFormValues[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <FormField label="First name" required>
          <Input
            value={value.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            disabled={isSubmitting}
            autoComplete="given-name"
          />
        </FormField>
        <FormField label="Last name" required>
          <Input
            value={value.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            disabled={isSubmitting}
            autoComplete="family-name"
          />
        </FormField>
        <FormField label="Mobile">
          <Input
            type="tel"
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
            disabled={isSubmitting}
            autoComplete="tel"
          />
        </FormField>
        <FormField label="Gender">
          <Select
            value={value.gender}
            onChange={(e) => set('gender', e.target.value as UserGender | '')}
            disabled={isSubmitting}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </FormField>
        <FormField label="Date of birth">
          <Input
            type="date"
            value={value.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            disabled={isSubmitting}
          />
        </FormField>
        <div className="sm:col-span-2 xl:col-span-3">
          <FormField label="Address">
            <Input
              value={value.address}
              onChange={(e) => set('address', e.target.value)}
              disabled={isSubmitting}
              autoComplete="street-address"
            />
          </FormField>
        </div>
      </dl>

      <div className="flex flex-wrap justify-end gap-2 border-t border-base pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
};
