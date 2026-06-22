import type { FormEvent, ReactNode } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import type { InventorySupplierRecord, InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord, StockMovementFormValues, StockMovementRecord, StockMovementType } from '../../../shared/types/inventoryProduct.types';
import type { StockMovementPayload } from '../../../services/stockMovement.service';

interface StockMovementFormProps {
  mode?: 'create' | 'edit';
  movementType: StockMovementType;
  value: StockMovementFormValues;
  errors?: Partial<Record<keyof StockMovementFormValues, string>>;
  warehouses: InventoryWarehouseRecord[];
  suppliers: InventorySupplierRecord[];
  products: InventoryProductRecord[];
  isSubmitting?: boolean;
  autoDocumentNo?: boolean;
  isGeneratingCode?: boolean;
  onChange: (value: StockMovementFormValues) => void;
  onClearFieldError?: (field: keyof StockMovementFormValues) => void;
  onAutoGenerateCode?: () => void;
  onDocumentNoManualChange?: () => void;
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

export const StockMovementForm = ({
  mode = 'create',
  movementType,
  value,
  errors,
  warehouses,
  suppliers,
  products,
  isSubmitting = false,
  autoDocumentNo = false,
  isGeneratingCode = false,
  onChange,
  onClearFieldError,
  onAutoGenerateCode,
  onDocumentNoManualChange,
  onCancel,
  onSubmit,
  submitLabel = 'Save draft',
}: StockMovementFormProps) => {
  const set = <K extends keyof StockMovementFormValues>(key: K, val: StockMovementFormValues[K]) =>
    onChange({ ...value, [key]: val });

  const touch = <K extends keyof StockMovementFormValues>(key: K, val: StockMovementFormValues[K]) => {
    onClearFieldError?.(key);
    set(key, val);
  };

  const fieldError = (key: keyof StockMovementFormValues) => errors?.[key];

  const setLine = (index: number, patch: Partial<StockMovementFormValues['lines'][number]>) => {
    const lines = value.lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
    onChange({ ...value, lines });
  };

  const addLine = () => {
    onChange({
      ...value,
      lines: [...value.lines, { productId: '', quantity: '1', unitCost: '' }],
    });
  };

  const removeLine = (index: number) => {
    if (value.lines.length <= 1) return;
    onChange({ ...value, lines: value.lines.filter((_, i) => i !== index) });
  };

  const title = movementType === 'in' ? 'Stock in' : 'Stock out';
  const Icon = movementType === 'in' ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SectionCard
        icon={<Icon className="h-4 w-4" />}
        title={`${title} details`}
        description="Document header. Save as draft, then post to update product quantities."
      >
        <div className={fieldGrid}>
          <FormField label="Document no." required error={fieldError('documentNo')}>
            <div className="flex gap-2">
              <Input
                value={value.documentNo}
                onChange={(e) => {
                  onDocumentNoManualChange?.();
                  touch('documentNo', e.target.value.toUpperCase());
                }}
                disabled={mode === 'edit' || autoDocumentNo}
                readOnly={mode === 'edit'}
                placeholder={movementType === 'in' ? 'SIN0001' : 'SOUT0001'}
                error={Boolean(fieldError('documentNo'))}
                className={mode === 'edit' ? 'bg-surface-2 font-mono' : undefined}
              />
              {mode === 'create' ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAutoGenerateCode}
                  disabled={isGeneratingCode || autoDocumentNo}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                  Auto
                </Button>
              ) : null}
            </div>
            {mode === 'edit' ? (
              <p className="mt-1 text-xs text-muted">Document number cannot be changed after creation.</p>
            ) : null}
          </FormField>

          <FormField label="Date" required error={fieldError('movementDate')}>
            <Input
              type="date"
              value={value.movementDate}
              onChange={(e) => touch('movementDate', e.target.value)}
              error={Boolean(fieldError('movementDate'))}
            />
          </FormField>

          <FormField label="Warehouse" required error={fieldError('warehouseId')}>
            <Select
              value={value.warehouseId}
              onChange={(e) => touch('warehouseId', e.target.value)}
              error={Boolean(fieldError('warehouseId'))}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormField>

          {movementType === 'in' ? (
            <FormField label="Supplier" error={fieldError('supplierId')}>
              <Select
                value={value.supplierId}
                onChange={(e) => touch('supplierId', e.target.value)}
                error={Boolean(fieldError('supplierId'))}
              >
                <option value="">None</option>
                {suppliers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.supplierName} ({item.supplierCode})
                  </option>
                ))}
              </Select>
            </FormField>
          ) : null}

          <FormField label="Reference no." error={fieldError('referenceNo')}>
            <Input
              value={value.referenceNo}
              onChange={(e) => touch('referenceNo', e.target.value)}
              placeholder="PO / invoice / challan no."
              error={Boolean(fieldError('referenceNo'))}
            />
          </FormField>

          <FormField label="Notes" className="sm:col-span-2 xl:col-span-3" error={fieldError('notes')}>
            <Input
              value={value.notes}
              onChange={(e) => touch('notes', e.target.value)}
              placeholder="Optional notes"
              error={Boolean(fieldError('notes'))}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Icon className="h-4 w-4" />}
        title="Line items"
        description="Add products and quantities. Stock updates when the document is posted."
      >
        <div className="space-y-4">
          {value.lines.map((line, index) => {
            const product = products.find((p) => p.id === line.productId);
            return (
              <div
                key={index}
                className="grid gap-4 rounded-sm border border-base bg-surface-2/40 p-4 sm:grid-cols-12"
              >
                <div className="sm:col-span-5">
                  <FormField label="Product" required>
                    <Select
                      value={line.productId}
                      onChange={(e) => setLine(index, { productId: e.target.value })}
                    >
                      <option value="">Select product</option>
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.productName} ({item.productCode}) — Qty: {item.quantityOnHand}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Quantity" required>
                    <Input
                      type="number"
                      min="0.0001"
                      step="any"
                      value={line.quantity}
                      onChange={(e) => setLine(index, { quantity: e.target.value })}
                    />
                  </FormField>
                </div>
                {movementType === 'in' ? (
                  <div className="sm:col-span-2">
                    <FormField label="Unit cost">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitCost}
                        onChange={(e) => setLine(index, { unitCost: e.target.value })}
                      />
                    </FormField>
                  </div>
                ) : (
                  <div className="sm:col-span-2 flex items-end pb-1">
                    {product ? (
                      <p className="text-xs text-muted">
                        Available: <span className="font-medium text-body">{product.quantityOnHand}</span>
                      </p>
                    ) : null}
                  </div>
                )}
                <div className="flex items-end justify-end sm:col-span-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeLine(index)}
                    disabled={value.lines.length <= 1}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}

          <Button type="button" variant="secondary" onClick={addLine}>
            <Plus className="mr-2 h-4 w-4" />
            Add line
          </Button>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export const emptyStockMovementForm = (): StockMovementFormValues => ({
  documentNo: '',
  movementDate: new Date().toISOString().slice(0, 10),
  warehouseId: '',
  supplierId: '',
  referenceNo: '',
  notes: '',
  lines: [{ productId: '', quantity: '1', unitCost: '' }],
});

export const recordToFormValues = (item: StockMovementRecord): StockMovementFormValues => ({
  documentNo: item.documentNo,
  movementDate: item.movementDate,
  warehouseId: item.warehouse.id,
  supplierId: item.supplier?.id ?? '',
  referenceNo: item.referenceNo ?? '',
  notes: item.notes ?? '',
  lines:
    item.lines.length > 0
      ? item.lines.map((line) => ({
          productId: line.productId,
          quantity: String(line.quantity),
          unitCost: line.unitCost !== undefined ? String(line.unitCost) : '',
        }))
      : [{ productId: '', quantity: '1', unitCost: '' }],
});

export const formValuesToUpdatePayload = (
  form: StockMovementFormValues
): Omit<StockMovementPayload, 'documentNo' | 'autoGenerateDocumentNo'> => ({
  movementDate: form.movementDate,
  warehouseId: form.warehouseId,
  supplierId: form.supplierId || undefined,
  referenceNo: form.referenceNo.trim() || undefined,
  notes: form.notes.trim() || undefined,
  lines: form.lines
    .filter((line) => line.productId && line.quantity)
    .map((line) => ({
      productId: line.productId,
      quantity: Number.parseFloat(line.quantity) || 0,
      ...(line.unitCost.trim()
        ? { unitCost: Number.parseFloat(line.unitCost) || 0 }
        : {}),
    })),
});

export const formValuesToPayload = (
  form: StockMovementFormValues,
  options?: { autoGenerateDocumentNo?: boolean }
): StockMovementPayload => ({
  ...(options?.autoGenerateDocumentNo
    ? { autoGenerateDocumentNo: true }
    : form.documentNo.trim()
      ? { documentNo: form.documentNo.trim().toUpperCase() }
      : {}),
  movementDate: form.movementDate,
  warehouseId: form.warehouseId,
  supplierId: form.supplierId || undefined,
  referenceNo: form.referenceNo.trim() || undefined,
  notes: form.notes.trim() || undefined,
  lines: form.lines
    .filter((line) => line.productId && line.quantity)
    .map((line) => ({
      productId: line.productId,
      quantity: Number.parseFloat(line.quantity) || 0,
      ...(line.unitCost.trim()
        ? { unitCost: Number.parseFloat(line.unitCost) || 0 }
        : {}),
    })),
});
