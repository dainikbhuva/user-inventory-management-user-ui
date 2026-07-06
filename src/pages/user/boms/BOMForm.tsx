import { type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { StatusToggle } from '../../../components/common/StatusToggle';
import type { BOMFormValues, BOMComponentFormRow } from '../../../shared/types/manufacturing.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';

const emptyRow = (): BOMComponentFormRow => ({ productId: '', quantity: 1, unitId: '', notes: '' });

export const emptyBOMForm = (): BOMFormValues => ({
  bomCode: '',
  bomName: '',
  finishedProductId: '',
  outputQty: 1,
  outputUnitId: '',
  components: [emptyRow()],
  notes: '',
  status: 'active',
});

interface Props {
  value: BOMFormValues;
  onChange: (v: BOMFormValues) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  autoGenerateBomCode?: boolean;
  isGeneratingCode?: boolean;
  onBomCodeManualChange?: () => void;
  products: InventoryProductRecord[];
  warehouses: InventoryWarehouseRecord[];
}

export const BOMForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save BOM',
  isSubmitting = false,
  mode = 'create',
  autoGenerateBomCode = true,
  isGeneratingCode = false,
  onBomCodeManualChange,
  products,
}: Props) => {
  const finishedProducts = products.filter((p) =>
    ['finished_goods', 'semi_finished'].includes(p.productType ?? 'trading')
  );
  const rawProducts = products.filter((p) =>
    ['raw_material', 'semi_finished', 'trading'].includes(p.productType ?? 'trading')
  );

  const updateComponent = (index: number, patch: Partial<BOMComponentFormRow>) => {
    const updated = value.components.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange({ ...value, components: updated });
  };

  const addRow = () => onChange({ ...value, components: [...value.components, emptyRow()] });
  const removeRow = (index: number) => {
    if (value.components.length === 1) return;
    onChange({ ...value, components: value.components.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Header Info */}
      <section className="rounded-sm border border-base bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-body">BOM Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="BOM Code" required>
            <div className="flex gap-2">
              <Input
                value={value.bomCode}
                placeholder={isGeneratingCode ? 'Generating...' : 'e.g. BOM0001'}
                disabled={isGeneratingCode || (autoGenerateBomCode && mode === 'create')}
                onChange={(e) => { onChange({ ...value, bomCode: e.target.value }); onBomCodeManualChange?.(); }}
              />
            </div>
          </FormField>

          <FormField label="BOM Name" required>
            <Input
              value={value.bomName}
              placeholder="e.g. Wooden Chair BOM"
              onChange={(e) => onChange({ ...value, bomName: e.target.value })}
            />
          </FormField>

          <FormField label="Finished Product" required>
            <Select
              value={value.finishedProductId}
              onChange={(e) => onChange({ ...value, finishedProductId: e.target.value })}
            >
              <option value="">Select finished product</option>
              {finishedProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>
              ))}
            </Select>
            {finishedProducts.length === 0 ? (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                No finished products yet. Create a product with type &quot;Finished Goods&quot; or &quot;Semi Finished&quot; under Inventory → Products.
              </p>
            ) : null}
          </FormField>

          <FormField label="Output Quantity" required>
            <Input
              type="number"
              value={value.outputQty}
              min={0.001}
              step={0.001}
              onChange={(e) => onChange({ ...value, outputQty: parseFloat(e.target.value) || 1 })}
            />
          </FormField>

          <FormField label="Notes">
            <Input
              value={value.notes}
              placeholder="Optional notes"
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
            />
          </FormField>

          <StatusToggle
            checked={value.status === 'active'}
            onChange={(v) => onChange({ ...value, status: v ? 'active' : 'inactive' })}
          />
        </div>
      </section>

      {/* Components */}
      <section className="rounded-sm border border-base bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-base px-5 py-4">
          <h2 className="text-sm font-semibold text-body">Components (Raw Materials)</h2>
          <Button type="button" size="sm" variant="secondary" onClick={addRow}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
          </Button>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base bg-surface-2">
                <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted">Raw Material *</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted">Quantity *</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted">Notes</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {value.components.map((row, i) => (
                <tr key={i} className="border-b border-base last:border-0">
                  <td className="px-4 py-2 text-muted">{i + 1}</td>
                  <td className="px-4 py-2 min-w-[200px]">
                    <Select value={row.productId} onChange={(e) => updateComponent(i, { productId: e.target.value })}>
                      <option value="">Select product</option>
                      {rawProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-2 w-28">
                    <Input
                      type="number"
                      value={row.quantity}
                      min={0.001}
                      step={0.001}
                      onChange={(e) => updateComponent(i, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-4 py-2 min-w-[160px]">
                    <Input
                      value={row.notes}
                      placeholder="Optional"
                      onChange={(e) => updateComponent(i, { notes: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      title="Remove row"
                      disabled={value.components.length === 1}
                      onClick={() => removeRow(i)}
                      className="text-muted hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked */}
        <div className="flex flex-col gap-4 p-4 md:hidden">
          {value.components.map((row, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-sm border border-base bg-surface-2 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-body">Component #{i + 1}</span>
                <button
                  type="button"
                  title="Remove"
                  disabled={value.components.length === 1}
                  onClick={() => removeRow(i)}
                  className="text-muted hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <FormField label="Raw Material">
                <Select value={row.productId} onChange={(e) => updateComponent(i, { productId: e.target.value })}>
                  <option value="">Select product</option>
                  {rawProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>
                  ))}
                </Select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Quantity">
                  <Input
                    type="number"
                    value={row.quantity}
                    min={0.001}
                    step={0.001}
                    onChange={(e) => updateComponent(i, { quantity: parseFloat(e.target.value) || 0 })}
                  />
                </FormField>
                <FormField label="Notes">
                  <Input
                    value={row.notes}
                    placeholder="Optional"
                    onChange={(e) => updateComponent(i, { notes: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
