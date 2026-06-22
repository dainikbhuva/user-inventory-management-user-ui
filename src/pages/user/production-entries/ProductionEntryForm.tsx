import { type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { ProductionEntryFormValues, MaterialReturnLine } from '../../../shared/types/manufacturing.types';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { WorkOrderRecord } from '../../../shared/types/manufacturing.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';

const today = () => new Date().toISOString().split('T')[0]!;
const emptyReturn = (): MaterialReturnLine => ({ productId: '', returnedQty: 0, notes: '' });

export const emptyProductionEntryForm = (): ProductionEntryFormValues => ({
  entryDate: today(),
  workOrderId: '',
  warehouseId: '',
  producedQty: 1,
  materialReturns: [],
  notes: '',
});

interface Props {
  value: ProductionEntryFormValues;
  onChange: (v: ProductionEntryFormValues) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  entryNumber?: string;
  workOrders: WorkOrderRecord[];
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
}

export const ProductionEntryForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isSubmitting = false,
  entryNumber,
  workOrders,
  warehouses,
  products,
}: Props) => {
  const updateReturn = (i: number, patch: Partial<MaterialReturnLine>) =>
    onChange({ ...value, materialReturns: value.materialReturns.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) });
  const addReturn = () => onChange({ ...value, materialReturns: [...value.materialReturns, emptyReturn()] });
  const removeReturn = (i: number) => onChange({ ...value, materialReturns: value.materialReturns.filter((_, idx) => idx !== i) });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="rounded-sm border border-base bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-body">Production Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entryNumber ? (
            <FormField label="Entry #"><Input value={entryNumber} disabled /></FormField>
          ) : null}
          <FormField label="Entry Date" required>
            <Input type="date" value={value.entryDate} onChange={(e) => onChange({ ...value, entryDate: e.target.value })} />
          </FormField>
          <FormField label="Work Order" required>
            <Select value={value.workOrderId} onChange={(e) => onChange({ ...value, workOrderId: e.target.value })}>
              <option value="">Select work order</option>
              {workOrders.filter((wo) => wo.status === 'in_progress').map((wo) => (
                <option key={wo.id} value={wo.id}>{wo.workOrderNumber} (Planned: {wo.plannedQty}, Produced: {wo.producedQty})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Warehouse" required>
            <Select value={value.warehouseId} onChange={(e) => onChange({ ...value, warehouseId: e.target.value })}>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
            </Select>
          </FormField>
          <FormField label="Produced Quantity" required>
            <Input type="number" value={value.producedQty} min={0.001} step={0.001}
              onChange={(e) => onChange({ ...value, producedQty: parseFloat(e.target.value) || 1 })} />
          </FormField>
          <FormField label="Notes">
            <Input value={value.notes} placeholder="Optional" onChange={(e) => onChange({ ...value, notes: e.target.value })} />
          </FormField>
        </div>
      </section>

      {/* Material Returns */}
      <section className="rounded-sm border border-base bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-base px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-body">Unused Material Returns (Optional)</h2>
            <p className="text-xs text-muted">Return any unused raw materials back to stock</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={addReturn}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Return
          </Button>
        </div>
        {value.materialReturns.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No material returns. Click "Add Return" to add unused materials.</p>
        ) : (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base bg-surface-2">
                  <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted">Material</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted">Return Qty</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted">Notes</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {value.materialReturns.map((ret, i) => (
                  <tr key={i} className="border-b border-base last:border-0">
                    <td className="px-4 py-2 text-muted">{i + 1}</td>
                    <td className="px-4 py-2 min-w-[200px]">
                      <Select value={ret.productId} onChange={(e) => updateReturn(i, { productId: e.target.value })}>
                        <option value="">Select product</option>
                        {products.map((p) => (<option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>))}
                      </Select>
                    </td>
                    <td className="px-4 py-2 w-28">
                      <Input type="number" value={ret.returnedQty} min={0} step={0.001}
                        onChange={(e) => updateReturn(i, { returnedQty: parseFloat(e.target.value) || 0 })} />
                    </td>
                    <td className="px-4 py-2 min-w-[140px]">
                      <Input value={ret.notes} placeholder="Optional" onChange={(e) => updateReturn(i, { notes: e.target.value })} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button type="button" onClick={() => removeReturn(i)} className="text-muted hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Mobile */}
        {value.materialReturns.length > 0 ? (
          <div className="flex flex-col gap-4 p-4 md:hidden">
            {value.materialReturns.map((ret, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-sm border border-base bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-body">Return #{i + 1}</span>
                  <button type="button" onClick={() => removeReturn(i)} className="text-muted hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <FormField label="Material">
                  <Select value={ret.productId} onChange={(e) => updateReturn(i, { productId: e.target.value })}>
                    <option value="">Select product</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.productName}</option>))}
                  </Select>
                </FormField>
                <FormField label="Return Qty">
                  <Input type="number" value={ret.returnedQty} min={0} step={0.001}
                    onChange={(e) => updateReturn(i, { returnedQty: parseFloat(e.target.value) || 0 })} />
                </FormField>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      </div>
    </form>
  );
};
