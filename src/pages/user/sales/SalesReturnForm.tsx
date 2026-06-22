import type { FormEvent, ReactNode } from 'react';
import { ClipboardList, Package, RefreshCw } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { DateInput } from '../../../components/ui/DateInput';
import { TradingLinesEditor } from '../trading/TradingLinesEditor';
import type { SalesReturnFormValues, SalesReturnRecord, TradingLineFormValues, CustomerRecord } from '../../../shared/types/trading.types';
import type { InventoryWarehouseRecord, InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';

interface SalesReturnFormProps {
  mode: 'create' | 'edit';
  value: SalesReturnFormValues;
  errors?: Partial<Record<keyof SalesReturnFormValues, string>>;
  isSubmitting?: boolean;
  autoReturnNumber?: boolean;
  isGeneratingNumber?: boolean;
  customers: CustomerRecord[];
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  taxes: InventoryTaxRecord[];
  onChange: (value: SalesReturnFormValues) => void;
  onClearFieldError?: (field: keyof SalesReturnFormValues) => void;
  onAutoGenerateNumber?: () => void;
  onReturnNumberManualChange?: () => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  submitLabel?: string;
}

const SectionCard = ({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) => (
  <section className="w-full rounded-sm border border-base bg-surface shadow-sm">
    <div className="flex items-start gap-3 border-b border-base px-6 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">{icon}</div>
      <div>
        <h2 className="text-base font-semibold text-body">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const fieldGrid = 'grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3';

export const emptySalesReturnForm = (): SalesReturnFormValues => ({
  returnNumber: '',
  returnDate: new Date().toISOString().slice(0, 10),
  salesInvoiceId: '',
  customerId: '',
  warehouseId: '',
  referenceNo: '',
  notes: '',
  lines: [],
});

export const salesReturnToFormValues = (record: SalesReturnRecord): SalesReturnFormValues => ({
  returnNumber: record.returnNumber,
  returnDate: record.returnDate?.slice(0, 10) ?? '',
  salesInvoiceId: record.salesInvoiceId ?? '',
  customerId: record.customerId,
  warehouseId: record.warehouseId,
  referenceNo: record.referenceNo ?? '',
  notes: record.notes ?? '',
  lines: record.lines.map((l): TradingLineFormValues => ({
    productId: l.productId,
    productName: l.productName,
    productCode: l.productCode,
    quantity: String(l.quantity),
    unitPrice: String(l.unitPrice),
    taxId: '',
    notes: l.notes ?? '',
    reason: l.reason,
  })),
});

export const formValuesToSalesReturnPayload = (v: SalesReturnFormValues, opts?: { autoGenerateReturnNumber?: boolean }) => ({
  ...(opts?.autoGenerateReturnNumber ? { autoGenerateReturnNumber: true } : { returnNumber: v.returnNumber.trim() }),
  returnDate: v.returnDate,
  salesInvoiceId: v.salesInvoiceId || undefined,
  customerId: v.customerId,
  warehouseId: v.warehouseId,
  referenceNo: v.referenceNo.trim() || undefined,
  notes: v.notes.trim() || undefined,
  lines: v.lines.map((l) => ({
    productId: l.productId,
    quantity: parseFloat(l.quantity) || 0,
    unitPrice: parseFloat(l.unitPrice) || 0,
    reason: l.reason?.trim() || 'Return',
    notes: l.notes.trim() || undefined,
  })),
});

export const SalesReturnForm = ({
  mode, value, errors, isSubmitting = false, autoReturnNumber = false, isGeneratingNumber = false,
  customers, warehouses, products, taxes, onChange, onClearFieldError, onAutoGenerateNumber,
  onReturnNumberManualChange, onCancel, onSubmit, submitLabel,
}: SalesReturnFormProps) => {
  const set = (field: keyof SalesReturnFormValues, val: string) => {
    if (onClearFieldError) onClearFieldError(field);
    onChange({ ...value, [field]: val });
  };
  const fieldError = (field: keyof SalesReturnFormValues) => errors?.[field];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <SectionCard icon={<ClipboardList className="h-5 w-5" />} title="Return details" description="Sales return document information">
        <div className={fieldGrid}>
          <FormField label="Return Number" required error={fieldError('returnNumber')}>
            <div className="flex items-center gap-2">
              <Input value={value.returnNumber} readOnly={autoReturnNumber || mode === 'edit'} placeholder={autoReturnNumber ? 'Auto-generated' : 'e.g. SR00001'}
                error={Boolean(fieldError('returnNumber'))}
                onChange={(e) => { onReturnNumberManualChange?.(); set('returnNumber', e.target.value.toUpperCase()); }} />
              {mode === 'create' && onAutoGenerateNumber ? (
                <button type="button" title="Auto-generate" disabled={isGeneratingNumber} onClick={onAutoGenerateNumber}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${isGeneratingNumber ? 'animate-spin' : ''}`} />
                </button>
              ) : null}
            </div>
          </FormField>
          <FormField label="Return Date" required error={fieldError('returnDate')}>
            <DateInput value={value.returnDate} error={Boolean(fieldError('returnDate'))} onChange={(e) => set('returnDate', e.target.value)} />
          </FormField>
          <FormField label="Customer" required error={fieldError('customerId')}>
            <Select value={value.customerId} error={Boolean(fieldError('customerId'))} onChange={(e) => set('customerId', e.target.value)}>
              <option value="">— Select customer —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.customerName}</option>)}
            </Select>
          </FormField>
          <FormField label="Warehouse" required error={fieldError('warehouseId')}>
            <Select value={value.warehouseId} error={Boolean(fieldError('warehouseId'))} onChange={(e) => set('warehouseId', e.target.value)}>
              <option value="">— Select warehouse —</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Sales Invoice (optional)" error={fieldError('salesInvoiceId')}>
            <Input value={value.salesInvoiceId} placeholder="Invoice ID" error={Boolean(fieldError('salesInvoiceId'))} onChange={(e) => set('salesInvoiceId', e.target.value)} />
          </FormField>
          <FormField label="Reference No." error={fieldError('referenceNo')}>
            <Input value={value.referenceNo} placeholder="Customer ref" error={Boolean(fieldError('referenceNo'))} onChange={(e) => set('referenceNo', e.target.value)} />
          </FormField>
          <FormField label="Notes" error={fieldError('notes')} className="sm:col-span-2 xl:col-span-3">
            <Input value={value.notes} placeholder="Any additional notes" error={Boolean(fieldError('notes'))} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
        </div>
      </SectionCard>
      <SectionCard icon={<Package className="h-5 w-5" />} title="Returned items" description="Products returned by the customer. Each line requires a reason.">
        <TradingLinesEditor lines={value.lines} products={products} taxes={taxes} showReason onChange={(lines) => onChange({ ...value, lines })} />
      </SectionCard>
      <div className="flex items-center justify-end gap-3 rounded-sm border border-base bg-surface px-6 py-4 shadow-sm">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="default" isLoading={isSubmitting}>{submitLabel ?? (mode === 'create' ? 'Save draft' : 'Update Return')}</Button>
      </div>
    </form>
  );
};
