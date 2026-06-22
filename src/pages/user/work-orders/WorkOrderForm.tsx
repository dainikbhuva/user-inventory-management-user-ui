import { type FormEvent } from 'react';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { WorkOrderFormValues } from '../../../shared/types/manufacturing.types';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';
import type { BOMRecord } from '../../../shared/types/manufacturing.types';

const today = () => new Date().toISOString().split('T')[0]!;

export const emptyWorkOrderForm = (): WorkOrderFormValues => ({
  workOrderDate: today(),
  bomId: '',
  warehouseId: '',
  plannedQty: 1,
  scheduledDate: '',
  notes: '',
});

interface Props {
  value: WorkOrderFormValues;
  onChange: (v: WorkOrderFormValues) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  boms: BOMRecord[];
  warehouses: InventoryWarehouseRecord[];
  /** Work order number to display (read-only) */
  workOrderNumber?: string;
  onWorkOrderNumberManualChange?: () => void;
}

export const WorkOrderForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save Work Order',
  isSubmitting = false,
  boms,
  warehouses,
  workOrderNumber,
}: Props) => {
  const selectedBom = boms.find((b) => b.id === value.bomId);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="rounded-sm border border-base bg-surface p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-body">Work Order Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workOrderNumber ? (
            <FormField label="Work Order #">
              <Input value={workOrderNumber} disabled />
            </FormField>
          ) : null}

          <FormField label="Work Order Date" required>
            <Input
              type="date"
              value={value.workOrderDate}
              onChange={(e) => onChange({ ...value, workOrderDate: e.target.value })}
            />
          </FormField>

          <FormField label="BOM" required>
            <Select value={value.bomId} onChange={(e) => onChange({ ...value, bomId: e.target.value })}>
              <option value="">Select BOM</option>
              {boms.map((b) => (
                <option key={b.id} value={b.id}>{b.bomName} ({b.bomCode})</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Warehouse" required>
            <Select value={value.warehouseId} onChange={(e) => onChange({ ...value, warehouseId: e.target.value })}>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Planned Quantity" required>
            <Input
              type="number"
              value={value.plannedQty}
              min={1}
              step={1}
              onChange={(e) => onChange({ ...value, plannedQty: parseInt(e.target.value, 10) || 1 })}
            />
          </FormField>

          <FormField label="Scheduled Date">
            <Input
              type="date"
              value={value.scheduledDate}
              onChange={(e) => onChange({ ...value, scheduledDate: e.target.value })}
            />
          </FormField>

          <FormField label="Notes">
            <Input
              value={value.notes}
              placeholder="Optional notes"
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
            />
          </FormField>
        </div>
      </section>

      {/* BOM Material Preview */}
      {selectedBom && selectedBom.components.length > 0 ? (
        <section className="rounded-sm border border-base bg-surface shadow-sm">
          <div className="border-b border-base px-5 py-4">
            <h2 className="text-sm font-semibold text-body">Required Materials (auto-calculated from BOM)</h2>
            <p className="mt-0.5 text-xs text-muted">
              Producing {value.plannedQty} × {selectedBom.bomName} (output: {selectedBom.outputQty} per run)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base bg-surface-2">
                  <th className="px-4 py-2.5 text-left font-medium text-muted">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted">Material</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted">Required Qty</th>
                </tr>
              </thead>
              <tbody>
                {selectedBom.components.map((comp, i) => (
                  <tr key={i} className="border-b border-base last:border-0">
                    <td className="px-4 py-2.5 text-muted">{i + 1}</td>
                    <td className="px-4 py-2.5 text-body">{comp.productId}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-body">
                      {+(comp.quantity * value.plannedQty / selectedBom.outputQty).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      </div>
    </form>
  );
};
