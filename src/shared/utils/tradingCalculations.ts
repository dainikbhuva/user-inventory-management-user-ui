import type { TradingLineFormValues } from '../types/trading.types';
import type { InventoryTaxRecord } from '../types/inventoryMaster.types';

export const resolveLineTaxRate = (
  line: TradingLineFormValues,
  taxes: InventoryTaxRecord[]
): number => {
  if (line.taxRate != null && !Number.isNaN(line.taxRate)) return line.taxRate;
  if (!line.taxId) return 0;
  return taxes.find((t) => t.id === line.taxId)?.taxRate ?? 0;
};

export const getLineUnitPrice = (line: TradingLineFormValues): number =>
  Number.parseFloat(line.unitPrice || line.unitCost || '0') || 0;

export const computeTradingLineAmounts = (
  line: TradingLineFormValues,
  taxes: InventoryTaxRecord[]
) => {
  const qty = Number.parseFloat(line.quantity) || 0;
  const price = getLineUnitPrice(line);
  const base = qty * price;
  const taxRate = resolveLineTaxRate(line, taxes);
  const taxAmount = base * (taxRate / 100);
  return { qty, price, base, taxRate, taxAmount, total: base + taxAmount };
};

export const computeTradingDocumentTotals = (
  lines: TradingLineFormValues[],
  taxes: InventoryTaxRecord[]
) => {
  let subtotal = 0;
  let taxAmount = 0;
  for (const line of lines) {
    const amounts = computeTradingLineAmounts(line, taxes);
    subtotal += amounts.base;
    taxAmount += amounts.taxAmount;
  }
  return { subtotal, taxAmount, totalAmount: subtotal + taxAmount };
};
