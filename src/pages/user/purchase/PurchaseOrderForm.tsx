import type { FormEvent, ReactNode } from 'react';
import { FileText, Package, RefreshCw } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { DateInput } from '../../../components/ui/DateInput';
import { TradingLinesEditor } from '../trading/TradingLinesEditor';
import type { PurchaseOrderFormValues, TradingLineFormValues } from '../../../shared/types/trading.types';
import type { InventorySupplierRecord, InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import type { InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';

interface PurchaseOrderFormProps {
  mode: 'create' | 'edit';
  value: PurchaseOrderFormValues;
  errors?: Partial<Record<keyof PurchaseOrderFormValues, string>>;
  isSubmitting?: boolean;
  autoPoNumber?: boolean;
  isGeneratingNumber?: boolean;
  suppliers: InventorySupplierRecord[];
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  taxes: InventoryTaxRecord[];
  onChange: (value: PurchaseOrderFormValues) => void;
  onClearFieldError?: (field: keyof PurchaseOrderFormValues) => void;
  onAutoGenerateNumber?: () => void;
  onPoNumberManualChange?: () => void;
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

export const emptyPurchaseOrderForm = (): PurchaseOrderFormValues => ({
  poNumber: '',
  poDate: new Date().toISOString().slice(0, 10),
  supplierId: '',
  warehouseId: '',
  expectedDate: '',
  referenceNo: '',
  notes: '',
  lines: [],
});

export const poToFormValues = (record: import('../../../shared/types/trading.types').PurchaseOrderRecord): PurchaseOrderFormValues => ({
  poNumber: record.poNumber,
  poDate: record.poDate?.slice(0, 10) ?? '',
  supplierId: record.supplierId,
  warehouseId: record.warehouseId,
  expectedDate: record.expectedDate?.slice(0, 10) ?? '',
  referenceNo: record.referenceNo ?? '',
  notes: record.notes ?? '',
  lines: record.lines.map((l): TradingLineFormValues => ({
    productId: l.productId,
    productName: l.productName,
    productCode: l.productCode,
    quantity: String(l.quantity),
    unitPrice: String(l.unitPrice),
    unitCost: String(l.unitPrice),
    taxId: l.taxId ?? '',
    taxRate: l.taxRate,
    notes: l.notes ?? '',
  })),
});

export const formValuesToPoPayload = (v: PurchaseOrderFormValues, opts?: { autoGeneratePoNumber?: boolean }) => ({
  ...(opts?.autoGeneratePoNumber ? { autoGeneratePoNumber: true } : { poNumber: v.poNumber.trim() }),
  poDate: v.poDate,
  supplierId: v.supplierId,
  warehouseId: v.warehouseId,
  expectedDate: v.expectedDate || undefined,
  referenceNo: v.referenceNo.trim() || undefined,
  notes: v.notes.trim() || undefined,
  lines: v.lines.map((l) => ({
    productId: l.productId,
    quantity: parseFloat(l.quantity) || 0,
    unitPrice: parseFloat(l.unitPrice || l.unitCost || '0') || 0,
    taxId: l.taxId || undefined,
    notes: l.notes.trim() || undefined,
  })),
});

export const PurchaseOrderForm = ({
  mode,
  value,
  errors,
  isSubmitting = false,
  autoPoNumber = false,
  isGeneratingNumber = false,
  suppliers,
  warehouses,
  products,
  taxes,
  onChange,
  onClearFieldError,
  onAutoGenerateNumber,
  onPoNumberManualChange,
  onCancel,
  onSubmit,
  submitLabel,
}: PurchaseOrderFormProps) => {
  const set = (field: keyof PurchaseOrderFormValues, val: string) => {
    if (onClearFieldError) onClearFieldError(field);
    onChange({ ...value, [field]: val });
  };
  const fieldError = (field: keyof PurchaseOrderFormValues) => errors?.[field];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <SectionCard
        icon={<FileText className="h-5 w-5" />}
        title="Purchase order details"
        description="Document information and supplier details"
      >
        <div className={fieldGrid}>
          <FormField label="PO Number" required error={fieldError('poNumber')}>
            <div className="flex items-center gap-2">
              <Input
                value={value.poNumber}
                readOnly={autoPoNumber || mode === 'edit'}
                placeholder={autoPoNumber ? 'Auto-generated' : 'e.g. PO00001'}
                error={Boolean(fieldError('poNumber'))}
                onChange={(e) => {
                  onPoNumberManualChange?.();
                  set('poNumber', e.target.value.toUpperCase());
                }}
              />
              {mode === 'create' && onAutoGenerateNumber ? (
                <button
                  type="button"
                  title="Auto-generate number"
                  disabled={isGeneratingNumber}
                  onClick={onAutoGenerateNumber}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-base bg-surface text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isGeneratingNumber ? 'animate-spin' : ''}`} />
                </button>
              ) : null}
            </div>
          </FormField>

          <FormField label="PO Date" required error={fieldError('poDate')}>
            <DateInput
              value={value.poDate}
              error={Boolean(fieldError('poDate'))}
              onChange={(e) => set('poDate', e.target.value)}
            />
          </FormField>

          <FormField label="Expected delivery date" error={fieldError('expectedDate')}>
            <DateInput
              value={value.expectedDate}
              error={Boolean(fieldError('expectedDate'))}
              onChange={(e) => set('expectedDate', e.target.value)}
            />
          </FormField>

          <FormField label="Supplier" required error={fieldError('supplierId')}>
            <Select
              value={value.supplierId}
              error={Boolean(fieldError('supplierId'))}
              onChange={(e) => set('supplierId', e.target.value)}
            >
              <option value="">— Select supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.supplierName}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Warehouse" required error={fieldError('warehouseId')}>
            <Select
              value={value.warehouseId}
              error={Boolean(fieldError('warehouseId'))}
              onChange={(e) => set('warehouseId', e.target.value)}
            >
              <option value="">— Select warehouse —</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Reference No." error={fieldError('referenceNo')}>
            <Input
              value={value.referenceNo}
              placeholder="Supplier ref / Quotation no."
              error={Boolean(fieldError('referenceNo'))}
              onChange={(e) => set('referenceNo', e.target.value)}
            />
          </FormField>

          <FormField label="Notes" error={fieldError('notes')} className="sm:col-span-2 xl:col-span-3">
            <Input
              value={value.notes}
              placeholder="Any additional notes"
              error={Boolean(fieldError('notes'))}
              onChange={(e) => set('notes', e.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Package className="h-5 w-5" />}
        title="Order lines"
        description="Add products to order"
      >
        <TradingLinesEditor
          lines={value.lines}
          products={products}
          taxes={taxes}
          onChange={(lines) => onChange({ ...value, lines })}
        />
      </SectionCard>

      <div className="flex items-center justify-end gap-3 rounded-sm border border-base bg-surface px-6 py-4 shadow-sm">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="default" isLoading={isSubmitting}>
          {submitLabel ?? (mode === 'create' ? 'Save draft' : 'Update PO')}
        </Button>
      </div>
    </form>
  );
};
