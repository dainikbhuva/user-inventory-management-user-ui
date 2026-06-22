import type { FormEvent, ReactNode } from 'react';
import { ClipboardList, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import type {
  CurrentStockRecord,
  StockAdjustmentFormValues,
  StockAdjustmentReason,
  StockAdjustmentRecord,
} from '../../../shared/types/inventoryStock.types';
import type { StockAdjustmentPayload } from '../../../services/inventoryStock.service';

export const ADJUSTMENT_REASON_OPTIONS: Array<{ value: StockAdjustmentReason; label: string }> = [
  { value: 'physical_count', label: 'Physical count' },
  { value: 'damage', label: 'Damage' },
  { value: 'expiry', label: 'Expiry' },
  { value: 'theft', label: 'Theft / loss' },
  { value: 'other', label: 'Other' },
];

interface StockAdjustmentFormProps {
  mode?: 'create' | 'edit';
  value: StockAdjustmentFormValues;
  errors?: Partial<Record<keyof StockAdjustmentFormValues, string>>;
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  warehouseStock: CurrentStockRecord[];
  isSubmitting?: boolean;
  autoAdjustmentNumber?: boolean;
  isGeneratingNumber?: boolean;
  onChange: (value: StockAdjustmentFormValues) => void;
  onClearFieldError?: (field: keyof StockAdjustmentFormValues) => void;
  onAutoGenerateNumber?: () => void;
  onAdjustmentNumberManualChange?: () => void;
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

const getSystemQty = (
  warehouseStock: CurrentStockRecord[],
  warehouseId: string,
  productId: string
) => {
  if (!warehouseId || !productId) return 0;
  const row = warehouseStock.find(
    (item) => item.warehouse.id === warehouseId && item.product.id === productId
  );
  return row?.currentStock ?? 0;
};

export const StockAdjustmentForm = ({
  mode = 'create',
  value,
  errors,
  warehouses,
  products,
  warehouseStock,
  isSubmitting = false,
  autoAdjustmentNumber = false,
  isGeneratingNumber = false,
  onChange,
  onClearFieldError,
  onAutoGenerateNumber,
  onAdjustmentNumberManualChange,
  onCancel,
  onSubmit,
  submitLabel = 'Save draft',
}: StockAdjustmentFormProps) => {
  const set = <K extends keyof StockAdjustmentFormValues>(key: K, val: StockAdjustmentFormValues[K]) =>
    onChange({ ...value, [key]: val });

  const touch = <K extends keyof StockAdjustmentFormValues>(key: K, val: StockAdjustmentFormValues[K]) => {
    onClearFieldError?.(key);
    set(key, val);
  };

  const fieldError = (key: keyof StockAdjustmentFormValues) => errors?.[key];

  const setLine = (index: number, patch: Partial<StockAdjustmentFormValues['lines'][number]>) => {
    const lines = value.lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
    onChange({ ...value, lines });
  };

  const addLine = () => {
    onChange({
      ...value,
      lines: [...value.lines, { productId: '', physicalQty: '0', reasonNote: '' }],
    });
  };

  const removeLine = (index: number) => {
    if (value.lines.length <= 1) return;
    onChange({ ...value, lines: value.lines.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SectionCard
        icon={<ClipboardList className="h-4 w-4" />}
        title="Adjustment details"
        description="Record physical count vs system stock. Approve to update warehouse quantities."
      >
        <div className={fieldGrid}>
          <FormField label="Document no." required error={fieldError('adjustmentNumber')}>
            <div className="flex gap-2">
              <Input
                value={value.adjustmentNumber}
                onChange={(e) => {
                  onAdjustmentNumberManualChange?.();
                  touch('adjustmentNumber', e.target.value.toUpperCase());
                }}
                disabled={mode === 'edit' || autoAdjustmentNumber}
                readOnly={mode === 'edit'}
                placeholder="ADJ0001"
                error={Boolean(fieldError('adjustmentNumber'))}
                className={mode === 'edit' ? 'bg-surface-2 font-mono' : 'font-mono'}
              />
              {mode === 'create' ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAutoGenerateNumber}
                  disabled={isGeneratingNumber || autoAdjustmentNumber}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGeneratingNumber ? 'animate-spin' : ''}`} />
                  Auto
                </Button>
              ) : null}
            </div>
            {mode === 'edit' ? (
              <p className="mt-1 text-xs text-muted">Document number cannot be changed after creation.</p>
            ) : null}
          </FormField>

          <FormField label="Date" required error={fieldError('adjustmentDate')}>
            <Input
              type="date"
              value={value.adjustmentDate}
              onChange={(e) => touch('adjustmentDate', e.target.value)}
              disabled={isSubmitting}
              error={Boolean(fieldError('adjustmentDate'))}
            />
          </FormField>

          <FormField label="Warehouse" required error={fieldError('warehouseId')}>
            <Select
              value={value.warehouseId}
              onChange={(e) => touch('warehouseId', e.target.value)}
              disabled={isSubmitting}
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

          <FormField label="Reason" required error={fieldError('reason')}>
            <Select
              value={value.reason}
              onChange={(e) => touch('reason', e.target.value as StockAdjustmentReason)}
              disabled={isSubmitting}
              error={Boolean(fieldError('reason'))}
            >
              <option value="">Select reason</option>
              {ADJUSTMENT_REASON_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Notes" className="sm:col-span-2 xl:col-span-2" error={fieldError('notes')}>
            <Input
              value={value.notes}
              onChange={(e) => touch('notes', e.target.value)}
              placeholder="Optional notes"
              disabled={isSubmitting}
              error={Boolean(fieldError('notes'))}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={<ClipboardList className="h-4 w-4" />}
        title="Product lines"
        description="Enter physical quantity counted. Difference is calculated on save."
      >
        {!value.warehouseId ? (
          <p className="text-sm text-muted">Select a warehouse to see system stock per product.</p>
        ) : null}
        <div className="space-y-4">
          {value.lines.map((line, index) => {
            const systemQty = getSystemQty(warehouseStock, value.warehouseId, line.productId);
            const physicalQty = Number.parseFloat(line.physicalQty) || 0;
            const difference = line.productId ? physicalQty - systemQty : 0;

            return (
              <div
                key={index}
                className="grid gap-4 rounded-sm border border-base bg-surface-2/40 p-4 sm:grid-cols-12"
              >
                <div className="sm:col-span-4">
                  <FormField label="Product" required>
                    <Select
                      value={line.productId}
                      onChange={(e) => setLine(index, { productId: e.target.value })}
                      disabled={isSubmitting || !value.warehouseId}
                    >
                      <option value="">Select product</option>
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.productName} ({item.productCode})
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField label="System qty">
                    <Input value={line.productId ? String(systemQty) : '—'} disabled readOnly className="bg-surface-2" />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Physical qty" required>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={line.physicalQty}
                      onChange={(e) => setLine(index, { physicalQty: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2 flex flex-col justify-end pb-1">
                  {line.productId ? (
                    <p className="text-xs text-muted">
                      Difference:{' '}
                      <span
                        className={`font-medium tabular-nums ${
                          difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-body'
                        }`}
                      >
                        {difference > 0 ? `+${difference}` : difference}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Line note">
                    <Input
                      value={line.reasonNote}
                      onChange={(e) => setLine(index, { reasonNote: e.target.value })}
                      placeholder="Optional"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>
                <div className="flex items-end justify-end sm:col-span-12 lg:col-span-1 lg:col-start-12">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeLine(index)}
                    disabled={value.lines.length <= 1 || isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          <Button type="button" variant="secondary" onClick={addLine} disabled={isSubmitting}>
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

export const emptyStockAdjustmentForm = (): StockAdjustmentFormValues => ({
  adjustmentNumber: '',
  adjustmentDate: new Date().toISOString().slice(0, 10),
  warehouseId: '',
  reason: '',
  notes: '',
  lines: [{ productId: '', physicalQty: '0', reasonNote: '' }],
});

export const recordToFormValues = (item: StockAdjustmentRecord): StockAdjustmentFormValues => ({
  adjustmentNumber: item.adjustmentNumber,
  adjustmentDate: item.adjustmentDate,
  warehouseId: item.warehouse.id,
  reason: item.reason as StockAdjustmentReason,
  notes: item.notes ?? '',
  lines:
    item.lines.length > 0
      ? item.lines.map((line) => ({
          productId: line.productId,
          physicalQty: String(line.physicalQty),
          reasonNote: line.reasonNote ?? '',
        }))
      : [{ productId: '', physicalQty: '0', reasonNote: '' }],
});

export const formValuesToPayload = (
  form: StockAdjustmentFormValues,
  options?: { autoGenerateAdjustmentNumber?: boolean }
): StockAdjustmentPayload => ({
  ...(options?.autoGenerateAdjustmentNumber
    ? { autoGenerateAdjustmentNumber: true }
    : form.adjustmentNumber.trim()
      ? { adjustmentNumber: form.adjustmentNumber.trim().toUpperCase() }
      : {}),
  adjustmentDate: form.adjustmentDate,
  warehouseId: form.warehouseId,
  reason: form.reason as StockAdjustmentReason,
  notes: form.notes.trim() || undefined,
  lines: form.lines
    .filter((line) => line.productId && line.physicalQty.trim() !== '')
    .map((line) => ({
      productId: line.productId,
      physicalQty: Number.parseFloat(line.physicalQty) || 0,
      reasonNote: line.reasonNote.trim() || undefined,
    })),
});

export const formValuesToUpdatePayload = (
  form: StockAdjustmentFormValues
): Omit<StockAdjustmentPayload, 'adjustmentNumber' | 'autoGenerateAdjustmentNumber'> => ({
  adjustmentDate: form.adjustmentDate,
  warehouseId: form.warehouseId,
  reason: form.reason as StockAdjustmentReason,
  notes: form.notes.trim() || undefined,
  lines: form.lines
    .filter((line) => line.productId && line.physicalQty.trim() !== '')
    .map((line) => ({
      productId: line.productId,
      physicalQty: Number.parseFloat(line.physicalQty) || 0,
      reasonNote: line.reasonNote.trim() || undefined,
    })),
});
