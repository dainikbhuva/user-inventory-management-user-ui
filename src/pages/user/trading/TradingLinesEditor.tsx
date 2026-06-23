/**
 * Shared line-items editor used across PO, GRN, DC, Invoice, and Return forms.
 * Renders a table of editable product rows with quantity, price, and tax fields.
 */
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { TradingLineFormValues } from '../../../shared/types/trading.types';
import type { InventoryProductRecord } from '../../../shared/types/inventoryProduct.types';
import type { InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';
import {
  computeTradingDocumentTotals,
  computeTradingLineAmounts,
} from '../../../shared/utils/tradingCalculations';

interface TradingLinesEditorProps {
  lines: TradingLineFormValues[];
  products: InventoryProductRecord[];
  taxes: InventoryTaxRecord[];
  /** Show a Reason dropdown on each line (used for return documents). */
  showReason?: boolean;
  onChange: (lines: TradingLineFormValues[]) => void;
  readOnly?: boolean;
}

const RETURN_REASONS = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'wrong_item', label: 'Wrong item' },
  { value: 'excess_quantity', label: 'Excess quantity' },
  { value: 'quality_issue', label: 'Quality issue' },
  { value: 'other', label: 'Other' },
];

const emptyLine = (): TradingLineFormValues => ({
  productId: '',
  quantity: '',
  unitPrice: '',
  taxId: '',
  notes: '',
});

const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

export const TradingLinesEditor = ({
  lines,
  products,
  taxes,
  showReason = false,
  onChange,
  readOnly = false,
}: TradingLinesEditorProps) => {
  const updateLine = (index: number, patch: Partial<TradingLineFormValues>) => {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => onChange([...lines, showReason ? { ...emptyLine(), reason: '' } : emptyLine()]);
  const removeLine = (index: number) => onChange(lines.filter((_, i) => i !== index));

  const productMap = new Map(products.map((p) => [p.id, p]));
  const taxMap = new Map(taxes.map((t) => [t.id, t]));

  const applyProductToLine = (line: TradingLineFormValues, productId: string): TradingLineFormValues => {
    if (!productId) {
      return {
        ...line,
        productId: '',
        productName: undefined,
        productCode: undefined,
        taxId: '',
        taxRate: undefined,
      };
    }
    const prod = productMap.get(productId);
    if (!prod) return { ...line, productId };
    const taxId = prod.tax?.id ?? '';
    const taxRate = taxId ? (prod.tax?.taxRate ?? taxMap.get(taxId)?.taxRate) : undefined;
    return {
      ...line,
      productId,
      productName: prod.productName,
      productCode: prod.productCode,
      unitPrice: String(prod.salePrice ?? ''),
      unitCost: String(prod.purchasePrice ?? ''),
      taxId,
      taxRate,
    };
  };

  const applyTaxToLine = (line: TradingLineFormValues, taxId: string): TradingLineFormValues => {
    const tax = taxMap.get(taxId);
    return {
      ...line,
      taxId,
      taxRate: tax?.taxRate,
    };
  };

  const getLineTotal = (line: TradingLineFormValues): string => {
    const { qty, price, base } = computeTradingLineAmounts(line, taxes);
    if (qty <= 0 || price <= 0) return '—';
    return formatCurrency(base);
  };

  const docTotals = computeTradingDocumentTotals(lines, taxes);
  const labelColSpan = showReason ? 8 : 7;
  const showTaxBreakdown = taxes.length > 0 && !showReason;

  const totalsSummary = showTaxBreakdown ? (
    <>
      <tr className="border-t border-base bg-surface-2">
        <td colSpan={labelColSpan} className="px-3 py-2 text-right text-sm font-medium text-muted">
          Subtotal
        </td>
        <td className="px-3 py-2.5 text-right tabular-nums font-medium text-body">
          {formatCurrency(docTotals.subtotal)}
        </td>
        {!readOnly ? <td /> : null}
      </tr>
      <tr className="bg-surface-2">
        <td colSpan={labelColSpan} className="px-3 py-2 text-right text-sm font-medium text-muted">
          Tax
        </td>
        <td className="px-3 py-2.5 text-right tabular-nums font-medium text-body">
          {formatCurrency(docTotals.taxAmount)}
        </td>
        {!readOnly ? <td /> : null}
      </tr>
      <tr className="bg-surface-2">
        <td colSpan={labelColSpan} className="px-3 py-2 text-right text-sm font-semibold text-muted">
          Grand Total
        </td>
        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-body">
          {formatCurrency(docTotals.totalAmount)}
        </td>
        {!readOnly ? <td /> : null}
      </tr>
    </>
  ) : (
    <tr className="border-t border-base bg-surface-2">
      <td colSpan={labelColSpan} className="px-3 py-2.5 text-right text-sm font-medium text-muted">
        Total
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-body">
        {formatCurrency(docTotals.subtotal)}
      </td>
      {!readOnly ? <td /> : null}
    </tr>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base bg-surface-2">
              <th className="px-3 py-2.5 text-left font-medium text-muted w-6">#</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted min-w-[200px]">Product</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted w-28">Quantity</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted w-32">Unit price / cost</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted w-36">Tax</th>
              {showReason ? <th className="px-3 py-2.5 text-left font-medium text-muted w-24">Reason</th> : null}
              <th className="px-3 py-2.5 text-left font-medium text-muted w-24">Notes</th>
              <th className="px-3 py-2.5 text-right font-medium text-muted w-24">Amount</th>
              {!readOnly ? <th className="w-10" /> : null}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="border-b border-base last:border-0 hover:bg-surface-2/50">
                <td className="px-3 py-2.5 text-muted tabular-nums">{index + 1}</td>
                <td className="px-3 py-2.5">
                  <Select
                    value={line.productId}
                    disabled={readOnly}
                    onChange={(e) => updateLine(index, applyProductToLine(line, e.target.value))}
                  >
                    <option value="">— Select product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productCode} – {p.productName}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-2.5">
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={line.quantity}
                    placeholder="0"
                    disabled={readOnly}
                    onChange={(e) => updateLine(index, { quantity: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitPrice ?? line.unitCost ?? ''}
                    placeholder="0.00"
                    disabled={readOnly}
                    onChange={(e) =>
                      updateLine(index, { unitPrice: e.target.value, unitCost: e.target.value })
                    }
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Select
                    value={line.taxId}
                    disabled={readOnly}
                    onChange={(e) => updateLine(index, applyTaxToLine(line, e.target.value))}
                  >
                    <option value="">None</option>
                    {taxes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.taxRate}%)
                      </option>
                    ))}
                  </Select>
                </td>
                {showReason ? (
                  <td className="px-3 py-2.5">
                    <Select
                      value={line.reason ?? ''}
                      disabled={readOnly}
                      onChange={(e) => updateLine(index, { reason: e.target.value })}
                    >
                      <option value="">— Select —</option>
                      {RETURN_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </Select>
                  </td>
                ) : null}
                <td className="px-3 py-2.5">
                  <Input
                    value={line.notes}
                    placeholder="Optional"
                    disabled={readOnly}
                    onChange={(e) => updateLine(index, { notes: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-body">
                  {getLineTotal(line)}
                </td>
                {!readOnly ? (
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
            {lines.length === 0 ? (
              <tr>
                <td colSpan={showReason ? 10 : 9} className="py-8 text-center text-sm text-muted">
                  No items added yet. Click "Add line" to add a product.
                </td>
              </tr>
            ) : null}
          </tbody>
          {lines.length > 0 ? <tfoot>{totalsSummary}</tfoot> : null}
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {lines.map((line, index) => (
          <div key={index} className="rounded-sm border border-base bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Line {index + 1}</span>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted transition hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted">Product</label>
                <Select
                  value={line.productId}
                  disabled={readOnly}
                  onChange={(e) => updateLine(index, applyProductToLine(line, e.target.value))}
                >
                  <option value="">— Select product —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productCode} – {p.productName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Quantity</label>
                <Input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={line.quantity}
                  placeholder="0"
                  disabled={readOnly}
                  onChange={(e) => updateLine(index, { quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Price / Cost</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.unitPrice ?? line.unitCost ?? ''}
                  placeholder="0.00"
                  disabled={readOnly}
                  onChange={(e) =>
                    updateLine(index, { unitPrice: e.target.value, unitCost: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Tax</label>
                <Select
                  value={line.taxId}
                  disabled={readOnly}
                  onChange={(e) => updateLine(index, applyTaxToLine(line, e.target.value))}
                >
                  <option value="">None</option>
                  {taxes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.taxRate}%)
                    </option>
                  ))}
                </Select>
              </div>
              {showReason ? (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Reason</label>
                  <Select
                    value={line.reason ?? ''}
                    disabled={readOnly}
                    onChange={(e) => updateLine(index, { reason: e.target.value })}
                  >
                    <option value="">— Select —</option>
                    {RETURN_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                </div>
              ) : null}
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-xs text-muted">Amount</span>
                <span className="font-semibold text-body">{getLineTotal(line)}</span>
              </div>
            </div>
          </div>
        ))}
        {lines.length === 0 ? (
          <div className="rounded-sm border border-dashed border-base py-8 text-center text-sm text-muted">
            No items added yet.
          </div>
        ) : null}
        {lines.length > 0 && showTaxBreakdown ? (
          <div className="rounded-sm border border-base bg-surface-2 p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted">Subtotal</span>
              <span className="tabular-nums font-medium">{formatCurrency(docTotals.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Tax</span>
              <span className="tabular-nums font-medium">{formatCurrency(docTotals.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-base pt-2">
              <span className="font-semibold text-body">Grand Total</span>
              <span className="tabular-nums font-semibold text-body">
                {formatCurrency(docTotals.totalAmount)}
              </span>
            </div>
          </div>
        ) : lines.length > 0 ? (
          <div className="flex justify-between rounded-sm border border-base bg-surface-2 p-4 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(docTotals.subtotal)}</span>
          </div>
        ) : null}
      </div>

      {!readOnly ? (
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-2 rounded-sm border border-dashed border-base px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add line
        </button>
      ) : null}
    </div>
  );
};
