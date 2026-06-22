import type { FormEvent, ReactNode } from 'react';
import { Building2, MapPin, Phone, RefreshCw, Users } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import type { CustomerFormValues } from '../../../shared/types/trading.types';

interface CustomerFormProps {
  mode: 'create' | 'edit';
  value: CustomerFormValues;
  errors?: Partial<Record<keyof CustomerFormValues, string>>;
  isSubmitting?: boolean;
  autoCustomerCode?: boolean;
  isGeneratingCode?: boolean;
  onChange: (value: CustomerFormValues) => void;
  onClearFieldError?: (field: keyof CustomerFormValues) => void;
  onAutoGenerateCode?: () => void;
  onCustomerCodeManualChange?: () => void;
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

export const emptyCustomerForm = (): CustomerFormValues => ({
  customerCode: '',
  customerName: '',
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
  creditLimit: '0',
  paymentTerms: '',
  status: 'active',
});

export const customerToFormValues = (record: {
  customerCode: string;
  customerName: string;
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
  creditLimit?: number;
  paymentTerms?: string;
  status: 'active' | 'inactive';
}): CustomerFormValues => ({
  customerCode: record.customerCode ?? '',
  customerName: record.customerName ?? '',
  contactPerson: record.contactPerson ?? '',
  email: record.email ?? '',
  mobile: record.mobile ?? '',
  alternateMobile: record.alternateMobile ?? '',
  gstNumber: record.gstNumber ?? '',
  panNumber: record.panNumber ?? '',
  website: record.website ?? '',
  address1: record.address1 ?? '',
  address2: record.address2 ?? '',
  country: record.country ?? '',
  state: record.state ?? '',
  city: record.city ?? '',
  pincode: record.pincode ?? '',
  creditLimit: String(record.creditLimit ?? 0),
  paymentTerms: record.paymentTerms ?? '',
  status: record.status ?? 'active',
});

export const formValuesToPayload = (
  v: CustomerFormValues,
  opts?: { autoGenerateCustomerCode?: boolean }
) => ({
  ...(opts?.autoGenerateCustomerCode
    ? { autoGenerateCustomerCode: true }
    : { customerCode: v.customerCode.trim() }),
  customerName: v.customerName.trim(),
  contactPerson: v.contactPerson.trim() || undefined,
  email: v.email.trim() || undefined,
  mobile: v.mobile.trim() || undefined,
  alternateMobile: v.alternateMobile.trim() || undefined,
  gstNumber: v.gstNumber.trim() || undefined,
  panNumber: v.panNumber.trim() || undefined,
  website: v.website.trim() || undefined,
  address1: v.address1.trim() || undefined,
  address2: v.address2.trim() || undefined,
  country: v.country.trim() || undefined,
  state: v.state.trim() || undefined,
  city: v.city.trim() || undefined,
  pincode: v.pincode.trim() || undefined,
  creditLimit: parseFloat(v.creditLimit) || 0,
  paymentTerms: v.paymentTerms.trim() || undefined,
  status: v.status,
});

export const formValuesToUpdatePayload = (v: CustomerFormValues) =>
  formValuesToPayload(v);

export const CustomerForm = ({
  mode,
  value,
  errors,
  isSubmitting = false,
  autoCustomerCode = false,
  isGeneratingCode = false,
  onChange,
  onClearFieldError,
  onAutoGenerateCode,
  onCustomerCodeManualChange,
  onCancel,
  onSubmit,
  submitLabel,
}: CustomerFormProps) => {
  const set = (field: keyof CustomerFormValues, val: string) => {
    onChange({ ...value, [field]: val });
  };
  const touch = (field: keyof CustomerFormValues, val: string) => {
    if (onClearFieldError) onClearFieldError(field);
    set(field, val);
  };
  const fieldError = (field: keyof CustomerFormValues) => errors?.[field];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {/* Basic Information */}
      <SectionCard
        icon={<Users className="h-5 w-5" />}
        title="Basic information"
        description="Core customer identification and classification"
      >
        <div className={fieldGrid}>
          <FormField label="Customer code" required error={fieldError('customerCode')}>
            <div className="flex items-center gap-2">
              <Input
                value={value.customerCode}
                readOnly={autoCustomerCode || mode === 'edit'}
                placeholder={autoCustomerCode ? 'Auto-generated' : 'e.g. CUST0001'}
                error={Boolean(fieldError('customerCode'))}
                onChange={(e) => {
                  onCustomerCodeManualChange?.();
                  touch('customerCode', e.target.value.toUpperCase());
                }}
              />
              {mode === 'create' && onAutoGenerateCode ? (
                <button
                  type="button"
                  title="Auto-generate code"
                  disabled={isGeneratingCode}
                  onClick={onAutoGenerateCode}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                </button>
              ) : null}
            </div>
          </FormField>

          <FormField label="Customer name" required error={fieldError('customerName')}>
            <Input
              value={value.customerName}
              placeholder="Enter customer name"
              error={Boolean(fieldError('customerName'))}
              onChange={(e) => touch('customerName', e.target.value)}
            />
          </FormField>

          <FormField label="Contact person" error={fieldError('contactPerson')}>
            <Input
              value={value.contactPerson}
              placeholder="Enter contact person name"
              error={Boolean(fieldError('contactPerson'))}
              onChange={(e) => touch('contactPerson', e.target.value)}
            />
          </FormField>

          <FormField label="Email" error={fieldError('email')}>
            <Input
              type="email"
              value={value.email}
              placeholder="customer@example.com"
              error={Boolean(fieldError('email'))}
              onChange={(e) => touch('email', e.target.value)}
            />
          </FormField>

          <FormField label="Payment terms" error={fieldError('paymentTerms')}>
            <Input
              value={value.paymentTerms}
              placeholder="e.g. Net 30, Advance"
              error={Boolean(fieldError('paymentTerms'))}
              onChange={(e) => touch('paymentTerms', e.target.value)}
            />
          </FormField>

          <FormField label="Credit limit (₹)" error={fieldError('creditLimit')}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={value.creditLimit}
              placeholder="0.00"
              error={Boolean(fieldError('creditLimit'))}
              onChange={(e) => touch('creditLimit', e.target.value)}
            />
          </FormField>

          <StatusToggle
            checked={value.status === 'active'}
            onChange={(v) => onChange({ ...value, status: v ? 'active' : 'inactive' })}
          />
        </div>
      </SectionCard>

      {/* Contact Details */}
      <SectionCard
        icon={<Phone className="h-5 w-5" />}
        title="Contact details"
        description="Phone numbers and online presence"
      >
        <div className={fieldGrid}>
          <FormField label="Mobile" error={fieldError('mobile')}>
            <Input
              value={value.mobile}
              placeholder="10-digit mobile number"
              maxLength={10}
              error={Boolean(fieldError('mobile'))}
              onChange={(e) => touch('mobile', e.target.value)}
            />
          </FormField>

          <FormField label="Alternate mobile" error={fieldError('alternateMobile')}>
            <Input
              value={value.alternateMobile}
              placeholder="Alternate mobile number"
              maxLength={10}
              error={Boolean(fieldError('alternateMobile'))}
              onChange={(e) => touch('alternateMobile', e.target.value)}
            />
          </FormField>

          <FormField label="Website" error={fieldError('website')}>
            <Input
              value={value.website}
              placeholder="https://example.com"
              error={Boolean(fieldError('website'))}
              onChange={(e) => touch('website', e.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* Tax Information */}
      <SectionCard
        icon={<Building2 className="h-5 w-5" />}
        title="Tax information"
        description="GST and PAN details"
      >
        <div className={fieldGrid}>
          <FormField
            label="GST number"
            error={fieldError('gstNumber')}
          >
            <Input
              value={value.gstNumber}
              placeholder="e.g. 22AAAAA0000A1Z5"
              maxLength={15}
              error={Boolean(fieldError('gstNumber'))}
              onChange={(e) => touch('gstNumber', e.target.value.toUpperCase())}
            />
          </FormField>

          <FormField
            label="PAN number"
            error={fieldError('panNumber')}
          >
            <Input
              value={value.panNumber}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              error={Boolean(fieldError('panNumber'))}
              onChange={(e) => touch('panNumber', e.target.value.toUpperCase())}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard
        icon={<MapPin className="h-5 w-5" />}
        title="Address"
        description="Customer's billing and shipping address"
      >
        <div className="flex flex-col gap-5">
          <div className={fieldGrid}>
            <FormField label="Address line 1" error={fieldError('address1')} className={fullWidthField}>
              <Input
                value={value.address1}
                placeholder="Street address"
                error={Boolean(fieldError('address1'))}
                onChange={(e) => touch('address1', e.target.value)}
              />
            </FormField>
            <FormField label="Address line 2" error={fieldError('address2')} className={fullWidthField}>
              <Input
                value={value.address2}
                placeholder="Landmark, Area"
                error={Boolean(fieldError('address2'))}
                onChange={(e) => touch('address2', e.target.value)}
              />
            </FormField>
          </div>
          <div className={fieldGrid}>
            <FormField label="City" error={fieldError('city')}>
              <Input
                value={value.city}
                placeholder="City"
                error={Boolean(fieldError('city'))}
                onChange={(e) => touch('city', e.target.value)}
              />
            </FormField>
            <FormField label="State" error={fieldError('state')}>
              <Input
                value={value.state}
                placeholder="State"
                error={Boolean(fieldError('state'))}
                onChange={(e) => touch('state', e.target.value)}
              />
            </FormField>
            <FormField label="Pincode" error={fieldError('pincode')}>
              <Input
                value={value.pincode}
                placeholder="6-digit pincode"
                maxLength={6}
                error={Boolean(fieldError('pincode'))}
                onChange={(e) => touch('pincode', e.target.value)}
              />
            </FormField>
            <FormField label="Country" error={fieldError('country')}>
              <Input
                value={value.country}
                placeholder="Country"
                error={Boolean(fieldError('country'))}
                onChange={(e) => touch('country', e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 rounded-sm border border-base bg-surface px-6 py-4 shadow-sm">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="default" isLoading={isSubmitting}>
          {submitLabel ?? (mode === 'create' ? 'Create customer' : 'Update customer')}
        </Button>
      </div>
    </form>
  );
};
