import type { FormEvent, ReactNode } from 'react';
import { ClipboardList, Package, RefreshCw } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { DateInput } from '../../../components/ui/DateInput';
import { TradingLinesEditor } from '../trading/TradingLinesEditor';
import type { GRNFormValues, TradingLineFormValues } from '../../../shared/types/trading.types';
import type { InventorySupplierRecord, InventoryWarehouseRecord, InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';

interface GRNFormProps {
  mode: 'create' | 'edit';
  value: GRNFormValues;
  errors?: Partial<Record<keyof GRNFormValues, string>>;
  isSubmitting?: boolean;
  autoGrnNumber?: boolean;
  isGeneratingNumber?: boolean;
  suppliers: InventorySupplierRecord[];
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  taxes: InventoryTaxRecord[];
  onChange: (value: GRNFormValues) => void;
  onClearFieldError?: (field: keyof GRNFormValues) => void;
  onAutoGenerateNumber?: () => void;
  onGrnNumberManualChange?: () => void;
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

export const emptyGRNForm = (): GRNFormValues => ({
  grnNumber: '',
  grnDate: new Date().toISOString().slice(0, 10),
  purchaseOrderId: '',
  supplierId: '',
  warehouseId: '',
  referenceNo: '',
  notes: '',
  lines: [],
});

export const grnToFormValues = (record: import('../../../shared/types/trading.types').GRNRecord): GRNFormValues => ({
  grnNumber: record.grnNumber,
  grnDate: record.grnDate?.slice(0, 10) ?? '',
  purchaseOrderId: record.purchaseOrderId ?? '',
  supplierId: record.supplierId,
  warehouseId: record.warehouseId,
  referenceNo: record.referenceNo ?? '',
  notes: record.notes ?? '',
  lines: record.lines.map((l): TradingLineFormValues => ({
    productId: l.productId,
    productName: l.productName,
    productCode: l.productCode,
    quantity: String(l.receivedQty),
    unitPrice: String(l.unitCost),
    unitCost: String(l.unitCost),
    taxId: l.taxId ?? '',
    notes: l.notes ?? '',
  })),
});

export const formValuesToGrnPayload = (v: GRNFormValues, opts?: { autoGenerateGrnNumber?: boolean }) => ({
  ...(opts?.autoGenerateGrnNumber ? { autoGenerateGrnNumber: true } : { grnNumber: v.grnNumber.trim() }),
  grnDate: v.grnDate,
  purchaseOrderId: v.purchaseOrderId || undefined,
  supplierId: v.supplierId,
  warehouseId: v.warehouseId,
  referenceNo: v.referenceNo.trim() || undefined,
  notes: v.notes.trim() || undefined,
  lines: v.lines.map((l) => ({
    productId: l.productId,
    receivedQty: parseFloat(l.quantity) || 0,
    unitCost: parseFloat(l.unitCost ?? l.unitPrice ?? '0') || 0,
    taxId: l.taxId || undefined,
    notes: l.notes.trim() || undefined,
  })),
});

export const GRNForm = ({
  mode, value, errors, isSubmitting = false, autoGrnNumber = false, isGeneratingNumber = false,
  suppliers, warehouses, products, taxes, onChange, onClearFieldError, onAutoGenerateNumber,
  onGrnNumberManualChange, onCancel, onSubmit, submitLabel,
}: GRNFormProps) => {
  const set = (field: keyof GRNFormValues, val: string) => {
    if (onClearFieldError) onClearFieldError(field);
    onChange({ ...value, [field]: val });
  };
  const fieldError = (field: keyof GRNFormValues) => errors?.[field];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <SectionCard icon={<ClipboardList className="h-5 w-5" />} title="GRN details" description="Goods receipt document information">
        <div className={fieldGrid}>
          <FormField label="GRN Number" required error={fieldError('grnNumber')}>
            <div className="flex items-center gap-2">
              <Input value={value.grnNumber} readOnly={autoGrnNumber || mode === 'edit'} placeholder={autoGrnNumber ? 'Auto-generated' : 'e.g. GRN00001'}
                error={Boolean(fieldError('grnNumber'))}
                onChange={(e) => { onGrnNumberManualChange?.(); set('grnNumber', e.target.value.toUpperCase()); }} />
              {mode === 'create' && onAutoGenerateNumber ? (
                <button type="button" title="Auto-generate" disabled={isGeneratingNumber} onClick={onAutoGenerateNumber}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${isGeneratingNumber ? 'animate-spin' : ''}`} />
                </button>
              ) : null}
            </div>
          </FormField>
          <FormField label="GRN Date" required error={fieldError('grnDate')}>
            <DateInput value={value.grnDate} error={Boolean(fieldError('grnDate'))} onChange={(e) => set('grnDate', e.target.value)} />
          </FormField>
          <FormField label="Supplier" required error={fieldError('supplierId')}>
            <Select value={value.supplierId} error={Boolean(fieldError('supplierId'))} onChange={(e) => set('supplierId', e.target.value)}>
              <option value="">— Select supplier —</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
            </Select>
          </FormField>
          <FormField label="Warehouse" required error={fieldError('warehouseId')}>
            <Select value={value.warehouseId} error={Boolean(fieldError('warehouseId'))} onChange={(e) => set('warehouseId', e.target.value)}>
              <option value="">— Select warehouse —</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Purchase Order (optional)" error={fieldError('purchaseOrderId')}>
            <Input value={value.purchaseOrderId} placeholder="Purchase order ID" error={Boolean(fieldError('purchaseOrderId'))} onChange={(e) => set('purchaseOrderId', e.target.value)} />
          </FormField>
          <FormField label="Reference No." error={fieldError('referenceNo')}>
            <Input value={value.referenceNo} placeholder="Invoice / Bill ref" error={Boolean(fieldError('referenceNo'))} onChange={(e) => set('referenceNo', e.target.value)} />
          </FormField>
          <FormField label="Notes" error={fieldError('notes')} className="sm:col-span-2 xl:col-span-3">
            <Input value={value.notes} placeholder="Any additional notes" error={Boolean(fieldError('notes'))} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
        </div>
      </SectionCard>
      <SectionCard icon={<Package className="h-5 w-5" />} title="Received items" description="List of products received">
        <TradingLinesEditor lines={value.lines} products={products} taxes={taxes} onChange={(lines) => onChange({ ...value, lines })} />
      </SectionCard>
      <div className="flex items-center justify-end gap-3 rounded-sm border border-base bg-surface px-6 py-4 shadow-sm">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="default" isLoading={isSubmitting}>{submitLabel ?? (mode === 'create' ? 'Save draft' : 'Update GRN')}</Button>
      </div>
    </form>
  );
};
