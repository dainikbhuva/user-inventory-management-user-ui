import type { FormEvent, ReactNode } from 'react';
import { Building2, MapPin, Phone, RefreshCw, Truck } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import type { SupplierFormValues } from '../../../shared/types/inventoryMaster.types';

interface SupplierFormProps {
  mode: 'create' | 'edit';
  value: SupplierFormValues;
  errors?: Partial<Record<keyof SupplierFormValues, string>>;
  isSubmitting?: boolean;
  autoSupplierCode?: boolean;
  isGeneratingCode?: boolean;
  onChange: (value: SupplierFormValues) => void;
  onClearFieldError?: (field: keyof SupplierFormValues) => void;
  onAutoGenerateCode?: () => void;
  onSupplierCodeManualChange?: () => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  submitLabel?: string;
}

const SectionCard = ({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="w-full rounded-sm border border-base bg-surface shadow-sm">
    <div className="flex items-start gap-3 border-b border-base px-6 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-body">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const fieldGrid = 'grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3';
const fullWidthField = 'sm:col-span-2 xl:col-span-3';

export const SupplierForm = ({
  mode,
  value,
  errors,
  isSubmitting = false,
  autoSupplierCode = false,
  isGeneratingCode = false,
  onChange,
  onClearFieldError,
  onAutoGenerateCode,
  onSupplierCodeManualChange,
  onCancel,
  onSubmit,
  submitLabel = 'Save supplier',
}: SupplierFormProps) => {
  const set = <K extends keyof SupplierFormValues>(key: K, val: SupplierFormValues[K]) =>
    onChange({ ...value, [key]: val });

  const touch = <K extends keyof SupplierFormValues>(key: K, val: SupplierFormValues[K]) => {
    onClearFieldError?.(key);
    set(key, val);
  };

  const fieldError = (key: keyof SupplierFormValues) => errors?.[key];

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SectionCard
        icon={<Truck className="h-4 w-4" />}
        title="Supplier details"
        description="Basic identification and supplier name."
      >
        <div className={fieldGrid}>
          <FormField label="Supplier code" required error={fieldError('supplierCode')}>
            <div className="flex gap-2">
              <Input
                value={value.supplierCode}
                onChange={(e) => {
                  onSupplierCodeManualChange?.();
                  touch('supplierCode', e.target.value.toUpperCase());
                }}
                placeholder="e.g. SUP0001"
                disabled={isSubmitting || (mode === 'create' && autoSupplierCode)}
                className="font-mono"
                error={Boolean(fieldError('supplierCode'))}
              />
              {mode === 'create' && onAutoGenerateCode ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAutoGenerateCode}
                  disabled={isSubmitting || isGeneratingCode}
                  className="shrink-0"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                  Auto
                </Button>
              ) : null}
            </div>
          </FormField>

          <FormField label="Supplier name" required className={fullWidthField} error={fieldError('supplierName')}>
            <Input
              value={value.supplierName}
              onChange={(e) => touch('supplierName', e.target.value)}
              placeholder="e.g. ABC Traders"
              disabled={isSubmitting}
              error={Boolean(fieldError('supplierName'))}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Phone className="h-4 w-4" />}
        title="Contact information"
        description="Primary contact details for this supplier."
      >
        <div className={fieldGrid}>
          <FormField label="Contact person" error={fieldError('contactPerson')}>
            <Input
              value={value.contactPerson}
              onChange={(e) => touch('contactPerson', e.target.value)}
              placeholder="e.g. Raj Patel"
              disabled={isSubmitting}
              error={Boolean(fieldError('contactPerson'))}
            />
          </FormField>

          <FormField label="Email" error={fieldError('email')}>
            <Input
              type="email"
              value={value.email}
              onChange={(e) => touch('email', e.target.value)}
              placeholder="abc@gmail.com"
              disabled={isSubmitting}
              error={Boolean(fieldError('email'))}
            />
          </FormField>

          <FormField label="Mobile" error={fieldError('mobile')}>
            <Input
              value={value.mobile}
              onChange={(e) => touch('mobile', e.target.value)}
              placeholder="9876543210"
              disabled={isSubmitting}
              error={Boolean(fieldError('mobile'))}
            />
          </FormField>

          <FormField label="Alternate mobile" error={fieldError('alternateMobile')}>
            <Input
              value={value.alternateMobile}
              onChange={(e) => touch('alternateMobile', e.target.value)}
              placeholder="Optional second number"
              disabled={isSubmitting}
              error={Boolean(fieldError('alternateMobile'))}
            />
          </FormField>

          <FormField label="Website" error={fieldError('website')}>
            <Input
              value={value.website}
              onChange={(e) => touch('website', e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
              className={fullWidthField}
              error={Boolean(fieldError('website'))}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Building2 className="h-4 w-4" />}
        title="Tax & legal"
        description="GST, PAN, and other registration details."
      >
        <div className={fieldGrid}>
          <FormField label="GST number" error={fieldError('gstNumber')}>
            <Input
              value={value.gstNumber}
              onChange={(e) => touch('gstNumber', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              disabled={isSubmitting}
              className="font-mono uppercase"
              error={Boolean(fieldError('gstNumber'))}
            />
            <p className="mt-1 text-xs text-muted">15 characters — leave blank if not available.</p>
          </FormField>

          <FormField label="PAN number" error={fieldError('panNumber')}>
            <Input
              value={value.panNumber}
              onChange={(e) => touch('panNumber', e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              disabled={isSubmitting}
              className="font-mono uppercase"
              error={Boolean(fieldError('panNumber'))}
            />
            <p className="mt-1 text-xs text-muted">Format: ABCDE1234F — leave blank if not available.</p>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={<MapPin className="h-4 w-4" />}
        title="Address"
        description="Supplier office or warehouse address."
      >
        <div className={fieldGrid}>
          <FormField label="Address line 1" className={fullWidthField} error={fieldError('address1')}>
            <Input
              value={value.address1}
              onChange={(e) => touch('address1', e.target.value)}
              placeholder="Street, building, area"
              disabled={isSubmitting}
              error={Boolean(fieldError('address1'))}
            />
          </FormField>

          <FormField label="Address line 2" className={fullWidthField} error={fieldError('address2')}>
            <Input
              value={value.address2}
              onChange={(e) => touch('address2', e.target.value)}
              placeholder="Landmark, suite, floor (optional)"
              disabled={isSubmitting}
              error={Boolean(fieldError('address2'))}
            />
          </FormField>

          <FormField label="Country" error={fieldError('country')}>
            <Input
              value={value.country}
              onChange={(e) => touch('country', e.target.value)}
              placeholder="India"
              disabled={isSubmitting}
              error={Boolean(fieldError('country'))}
            />
          </FormField>

          <FormField label="State" error={fieldError('state')}>
            <Input
              value={value.state}
              onChange={(e) => touch('state', e.target.value)}
              placeholder="Gujarat"
              disabled={isSubmitting}
              error={Boolean(fieldError('state'))}
            />
          </FormField>

          <FormField label="City" error={fieldError('city')}>
            <Input
              value={value.city}
              onChange={(e) => touch('city', e.target.value)}
              placeholder="Ahmedabad"
              disabled={isSubmitting}
              error={Boolean(fieldError('city'))}
            />
          </FormField>

          <FormField label="Pincode" error={fieldError('pincode')}>
            <Input
              value={value.pincode}
              onChange={(e) => touch('pincode', e.target.value)}
              placeholder="380001"
              disabled={isSubmitting}
              error={Boolean(fieldError('pincode'))}
            />
          </FormField>
        </div>
      </SectionCard>

      <section className="w-full rounded-sm border border-base bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-body">Status</p>
            <p className="mt-1 text-sm text-muted">
              Inactive suppliers are hidden from purchase and product forms.
            </p>
          </div>
          <StatusToggle
            checked={value.status === 'active'}
            onChange={(checked) => set('status', checked ? 'active' : 'inactive')}
            disabled={isSubmitting}
          />
        </div>
      </section>

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

export const emptySupplierForm = (): SupplierFormValues => ({
  supplierCode: '',
  supplierName: '',
  contactPerson: '',
  email: '',
  mobile: '',
  alternateMobile: '',
  gstNumber: '',
  panNumber: '',
  website: '',
  address1: '',
  address2: '',
  country: '',
  state: '',
  city: '',
  pincode: '',
  status: 'active',
});

export const supplierToFormValues = (item: {
  supplierCode: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  status: 'active' | 'inactive';
}): SupplierFormValues => ({
  supplierCode: item.supplierCode,
  supplierName: item.supplierName,
  contactPerson: item.contactPerson ?? '',
  email: item.email ?? '',
  mobile: item.mobile ?? '',
  alternateMobile: item.alternateMobile ?? '',
  gstNumber: item.gstNumber ?? '',
  panNumber: item.panNumber ?? '',
  website: item.website ?? '',
  address1: item.address1 ?? '',
  address2: item.address2 ?? '',
  country: item.country ?? '',
  state: item.state ?? '',
  city: item.city ?? '',
  pincode: item.pincode ?? '',
  status: item.status,
});

export const formValuesToPayload = (
  form: SupplierFormValues,
  options?: { autoGenerateSupplierCode?: boolean }
) => ({
  supplierName: form.supplierName.trim(),
  ...(options?.autoGenerateSupplierCode
    ? { autoGenerateSupplierCode: true }
    : { supplierCode: form.supplierCode.trim().toUpperCase() }),
  contactPerson: form.contactPerson.trim() || undefined,
  email: form.email.trim() || undefined,
  mobile: form.mobile.trim() || undefined,
  alternateMobile: form.alternateMobile.trim() || undefined,
  gstNumber: form.gstNumber.trim() || undefined,
  panNumber: form.panNumber.trim() || undefined,
  website: form.website.trim() || undefined,
  address1: form.address1.trim() || undefined,
  address2: form.address2.trim() || undefined,
  country: form.country.trim() || undefined,
  state: form.state.trim() || undefined,
  city: form.city.trim() || undefined,
  pincode: form.pincode.trim() || undefined,
  status: form.status,
});

export const formValuesToUpdatePayload = (form: SupplierFormValues) => ({
  supplierCode: form.supplierCode.trim().toUpperCase(),
  supplierName: form.supplierName.trim(),
  contactPerson: form.contactPerson.trim() || undefined,
  email: form.email.trim() || undefined,
  mobile: form.mobile.trim() || undefined,
  alternateMobile: form.alternateMobile.trim() || undefined,
  gstNumber: form.gstNumber.trim() || undefined,
  panNumber: form.panNumber.trim() || undefined,
  website: form.website.trim() || undefined,
  address1: form.address1.trim() || undefined,
  address2: form.address2.trim() || undefined,
  country: form.country.trim() || undefined,
  state: form.state.trim() || undefined,
  city: form.city.trim() || undefined,
  pincode: form.pincode.trim() || undefined,
  status: form.status,
});
