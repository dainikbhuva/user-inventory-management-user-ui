import { type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { MaterialIssueFormValues, MaterialIssueLine } from '../../../shared/types/manufacturing.types';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { WorkOrderRecord } from '../../../shared/types/manufacturing.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';

const today = () => new Date().toISOString().split('T')[0]!;
const emptyLine = (): MaterialIssueLine => ({ productId: '', requiredQty: 0, issuedQty: 0, notes: '' });

export const emptyMaterialIssueForm = (): MaterialIssueFormValues => ({
  issueDate: today(),
  workOrderId: '',
  warehouseId: '',
  notes: '',
  lines: [emptyLine()],
});

interface Props {
  value: MaterialIssueFormValues;
  onChange: (v: MaterialIssueFormValues) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  issueNumber?: string;
  workOrders: WorkOrderRecord[];
  warehouses: InventoryWarehouseRecord[];
  products: InventoryProductRecord[];
  onIssueNumberManualChange?: () => void;
}

export const MaterialIssueForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isSubmitting = false,
  issueNumber,
  workOrders,
  warehouses,
  products,
}: Props) => {
  const selectedWO = workOrders.find((wo) => wo.id === value.workOrderId);

  const updateLine = (index: number, patch: Partial<MaterialIssueLine>) => {
    onChange({ ...value, lines: value.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)) });
  };
  const addLine = () => onChange({ ...value, lines: [...value.lines, emptyLine()] });
  const removeLine = (i: number) => {
    if (value.lines.length === 1) return;
    onChange({ ...value, lines: value.lines.filter((_, idx) => idx !== i) });
  };

  const loadFromWO = () => {
    if (!selectedWO) return;
    onChange({
      ...value,
      warehouseId: selectedWO.warehouseId,
      lines: selectedWO.materials.map((m) => ({
        productId: m.productId,
        requiredQty: m.requiredQty,
        issuedQty: Math.max(0, m.requiredQty - m.issuedQty),
        notes: '',
      })),
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="rounded-sm border border-base bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-body">Issue Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issueNumber ? (
            <FormField label="Issue #">
              <Input value={issueNumber} disabled />
            </FormField>
          ) : null}

          <FormField label="Issue Date" required>
            <Input type="date" value={value.issueDate} onChange={(e) => onChange({ ...value, issueDate: e.target.value })} />
          </FormField>

          <FormField label="Work Order" required>
            <div className="flex gap-2">
              <Select value={value.workOrderId} onChange={(e) => onChange({ ...value, workOrderId: e.target.value })}>
                <option value="">Select work order</option>
                {workOrders.filter((wo) => wo.status === 'in_progress').map((wo) => (
                  <option key={wo.id} value={wo.id}>{wo.workOrderNumber}</option>
                ))}
              </Select>
              {selectedWO ? (
                <Button type="button" size="sm" variant="secondary" onClick={loadFromWO} title="Auto-fill from WO">
                  Fill
                </Button>
              ) : null}
            </div>
          </FormField>

          <FormField label="Warehouse" required>
            <Select value={value.warehouseId} onChange={(e) => onChange({ ...value, warehouseId: e.target.value })}>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Notes">
            <Input value={value.notes} placeholder="Optional" onChange={(e) => onChange({ ...value, notes: e.target.value })} />
          </FormField>
        </div>
      </section>

      {/* Lines */}
      <section className="rounded-sm border border-base bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-base px-5 py-4">
          <h2 className="text-sm font-semibold text-body">Materials to Issue</h2>
          <Button type="button" size="sm" variant="secondary" onClick={addLine}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
          </Button>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base bg-surface-2">
                <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted">Material *</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted">Required Qty</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted">Issue Qty *</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted">Notes</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {value.lines.map((line, i) => (
                <tr key={i} className="border-b border-base last:border-0">
                  <td className="px-4 py-2 text-muted">{i + 1}</td>
                  <td className="px-4 py-2 min-w-[200px]">
                    <Select value={line.productId} onChange={(e) => updateLine(i, { productId: e.target.value })}>
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.productName} ({p.productCode})</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-2 w-28">
                    <Input type="number" value={line.requiredQty} min={0} step={0.001} onChange={(e) => updateLine(i, { requiredQty: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="px-4 py-2 w-28">
                    <Input type="number" value={line.issuedQty} min={0.001} step={0.001} onChange={(e) => updateLine(i, { issuedQty: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="px-4 py-2 min-w-[140px]">
                    <Input value={line.notes} placeholder="Optional" onChange={(e) => updateLine(i, { notes: e.target.value })} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button type="button" disabled={value.lines.length === 1} onClick={() => removeLine(i)} className="text-muted hover:text-red-600 disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="flex flex-col gap-4 p-4 md:hidden">
          {value.lines.map((line, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-sm border border-base bg-surface-2 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-body">Material #{i + 1}</span>
                <button type="button" disabled={value.lines.length === 1} onClick={() => removeLine(i)} className="text-muted hover:text-red-600 disabled:opacity-30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <FormField label="Material">
                <Select value={line.productId} onChange={(e) => updateLine(i, { productId: e.target.value })}>
                  <option value="">Select product</option>
                  {products.map((p) => (<option key={p.id} value={p.id}>{p.productName}</option>))}
                </Select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Required Qty">
                  <Input type="number" value={line.requiredQty} min={0} step={0.001} onChange={(e) => updateLine(i, { requiredQty: parseFloat(e.target.value) || 0 })} />
                </FormField>
                <FormField label="Issue Qty">
                  <Input type="number" value={line.issuedQty} min={0.001} step={0.001} onChange={(e) => updateLine(i, { issuedQty: parseFloat(e.target.value) || 0 })} />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      </div>
    </form>
  );
};
