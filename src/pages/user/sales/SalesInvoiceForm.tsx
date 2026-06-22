import type { FormEvent, ReactNode } from 'react';
import { ClipboardList, Package, RefreshCw } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { DateInput } from '../../../components/ui/DateInput';
import { TradingLinesEditor } from '../trading/TradingLinesEditor';
import type { SalesInvoiceFormValues, SalesInvoiceRecord, TradingLineFormValues, CustomerRecord } from '../../../shared/types/trading.types';
import type { InventoryWarehouseRecord, InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';

interface SalesInvoiceFormProps {
  mode: 'create' | 'edit';
  value: SalesInvoiceFormValues;
  errors?: Partial<Record<keyof SalesInvoiceFormValues, string>>;
  isSubmitting?: boolean;
  autoInvoiceNumber?: boolean;
  isGeneratingNumber?: boolean;
  customers: CustomerRecord[];
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  taxes: InventoryTaxRecord[];
  onChange: (value: SalesInvoiceFormValues) => void;
  onClearFieldError?: (field: keyof SalesInvoiceFormValues) => void;
  onAutoGenerateNumber?: () => void;
  onInvoiceNumberManualChange?: () => void;
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

export const emptySalesInvoiceForm = (): SalesInvoiceFormValues => ({
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  deliveryChallanId: '',
  salesOrderId: '',
  customerId: '',
  warehouseId: '',
  referenceNo: '',
  notes: '',
  discount: '0',
  lines: [],
});

export const salesInvoiceToFormValues = (record: SalesInvoiceRecord): SalesInvoiceFormValues => ({
  invoiceNumber: record.invoiceNumber,
  invoiceDate: record.invoiceDate?.slice(0, 10) ?? '',
  dueDate: record.dueDate?.slice(0, 10) ?? '',
  deliveryChallanId: record.deliveryChallanId ?? '',
  salesOrderId: record.salesOrderId ?? '',
  customerId: record.customerId,
  warehouseId: record.warehouseId,
  referenceNo: record.referenceNo ?? '',
  notes: record.notes ?? '',
  discount: String(record.discount ?? 0),
  lines: record.lines.map((l): TradingLineFormValues => ({
    productId: l.productId,
    productName: l.productName,
    productCode: l.productCode,
    quantity: String(l.quantity),
    unitPrice: String(l.unitPrice),
    taxId: l.taxId ?? '',
    notes: l.notes ?? '',
  })),
});

export const formValuesToSalesInvoicePayload = (v: SalesInvoiceFormValues, opts?: { autoGenerateInvoiceNumber?: boolean }) => ({
  ...(opts?.autoGenerateInvoiceNumber ? { autoGenerateInvoiceNumber: true } : { invoiceNumber: v.invoiceNumber.trim() }),
  invoiceDate: v.invoiceDate,
  dueDate: v.dueDate || undefined,
  deliveryChallanId: v.deliveryChallanId || undefined,
  salesOrderId: v.salesOrderId || undefined,
  customerId: v.customerId,
  warehouseId: v.warehouseId,
  referenceNo: v.referenceNo.trim() || undefined,
  notes: v.notes.trim() || undefined,
  discount: parseFloat(v.discount) || 0,
  lines: v.lines.map((l) => ({
    productId: l.productId,
    quantity: parseFloat(l.quantity) || 0,
    unitPrice: parseFloat(l.unitPrice) || 0,
    taxId: l.taxId || undefined,
    notes: l.notes.trim() || undefined,
  })),
});

export const SalesInvoiceForm = ({
  mode, value, errors, isSubmitting = false, autoInvoiceNumber = false, isGeneratingNumber = false,
  customers, warehouses, products, taxes, onChange, onClearFieldError, onAutoGenerateNumber,
  onInvoiceNumberManualChange, onCancel, onSubmit, submitLabel,
}: SalesInvoiceFormProps) => {
  const set = (field: keyof SalesInvoiceFormValues, val: string) => {
    if (onClearFieldError) onClearFieldError(field);
    onChange({ ...value, [field]: val });
  };
  const fieldError = (field: keyof SalesInvoiceFormValues) => errors?.[field];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <SectionCard icon={<ClipboardList className="h-5 w-5" />} title="Invoice details" description="Sales invoice document information">
        <div className={fieldGrid}>
          <FormField label="Invoice Number" required error={fieldError('invoiceNumber')}>
            <div className="flex items-center gap-2">
              <Input value={value.invoiceNumber} readOnly={autoInvoiceNumber || mode === 'edit'} placeholder={autoInvoiceNumber ? 'Auto-generated' : 'e.g. INV00001'}
                error={Boolean(fieldError('invoiceNumber'))}
                onChange={(e) => { onInvoiceNumberManualChange?.(); set('invoiceNumber', e.target.value.toUpperCase()); }} />
              {mode === 'create' && onAutoGenerateNumber ? (
                <button type="button" title="Auto-generate" disabled={isGeneratingNumber} onClick={onAutoGenerateNumber}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${isGeneratingNumber ? 'animate-spin' : ''}`} />
                </button>
              ) : null}
            </div>
          </FormField>
          <FormField label="Invoice Date" required error={fieldError('invoiceDate')}>
            <DateInput value={value.invoiceDate} error={Boolean(fieldError('invoiceDate'))} onChange={(e) => set('invoiceDate', e.target.value)} />
          </FormField>
          <FormField label="Due Date" error={fieldError('dueDate')}>
            <DateInput value={value.dueDate} error={Boolean(fieldError('dueDate'))} onChange={(e) => set('dueDate', e.target.value)} />
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
          <FormField label="Discount (₹)" error={fieldError('discount')}>
            <Input type="number" min="0" step="0.01" value={value.discount} placeholder="0.00" error={Boolean(fieldError('discount'))} onChange={(e) => set('discount', e.target.value)} />
          </FormField>
          <FormField label="Delivery Challan (optional)" error={fieldError('deliveryChallanId')}>
            <Input value={value.deliveryChallanId} placeholder="DC ID" error={Boolean(fieldError('deliveryChallanId'))} onChange={(e) => set('deliveryChallanId', e.target.value)} />
          </FormField>
          <FormField label="Sales Order (optional)" error={fieldError('salesOrderId')}>
            <Input value={value.salesOrderId} placeholder="SO ID" error={Boolean(fieldError('salesOrderId'))} onChange={(e) => set('salesOrderId', e.target.value)} />
          </FormField>
          <FormField label="Reference No." error={fieldError('referenceNo')}>
            <Input value={value.referenceNo} placeholder="PO / ref" error={Boolean(fieldError('referenceNo'))} onChange={(e) => set('referenceNo', e.target.value)} />
          </FormField>
          <FormField label="Notes" error={fieldError('notes')} className="sm:col-span-2 xl:col-span-3">
            <Input value={value.notes} placeholder="Any additional notes" error={Boolean(fieldError('notes'))} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
        </div>
      </SectionCard>
      <SectionCard icon={<Package className="h-5 w-5" />} title="Invoice items" description="Products billed to the customer">
        <TradingLinesEditor lines={value.lines} products={products} taxes={taxes} onChange={(lines) => onChange({ ...value, lines })} />
      </SectionCard>
      <div className="flex items-center justify-end gap-3 rounded-sm border border-base bg-surface px-6 py-4 shadow-sm">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="default" isLoading={isSubmitting}>{submitLabel ?? (mode === 'create' ? 'Save draft' : 'Update Invoice')}</Button>
      </div>
    </form>
  );
};
