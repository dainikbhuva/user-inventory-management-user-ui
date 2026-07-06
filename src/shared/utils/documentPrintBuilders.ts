import type { PrintDocumentData, PrintDocumentParty } from '../types/documentPrint.types';
import type {
  PurchaseOrderRecord,
  GRNRecord,
  PurchaseReturnRecord,
  SalesOrderRecord,
  DeliveryChallanRecord,
  SalesInvoiceRecord,
  SalesReturnRecord,
} from '../types/trading.types';
import type {
  WorkOrderRecord,
  MaterialIssueRecord,
  ProductionEntryRecord,
} from '../types/manufacturing.types';
import type { StockMovementRecord } from '../types/inventoryProduct.types';
import type { StockAdjustmentRecord } from '../types/inventoryStock.types';
import { formatPrintCurrency, formatPrintDate, formatPrintNumber } from './documentPrintFormat';

type CompanyContext = { companyName?: string };

const formatStatus = (status?: string) =>
  status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : undefined;

const supplierParty = (name?: string, gst?: string, mobile?: string): PrintDocumentParty | undefined =>
  name
    ? {
        label: 'Supplier',
        name,
        details: [gst ? `GST: ${gst}` : '', mobile ? `Mobile: ${mobile}` : ''].filter(Boolean),
      }
    : undefined;

const customerParty = (name?: string, gst?: string, mobile?: string): PrintDocumentParty | undefined =>
  name
    ? {
        label: 'Customer',
        name,
        details: [gst ? `GST: ${gst}` : '', mobile ? `Mobile: ${mobile}` : ''].filter(Boolean),
      }
    : undefined;

const tradingTotals = (subtotal: number, taxAmount: number, totalAmount: number, extra?: { label: string; value: string }[]) => [
  { label: 'Subtotal', value: formatPrintCurrency(subtotal) },
  ...(taxAmount > 0 ? [{ label: 'Tax', value: formatPrintCurrency(taxAmount) }] : []),
  ...(extra ?? []),
  { label: 'Total', value: formatPrintCurrency(totalAmount), emphasis: true },
];

// ─── Purchase Order ───────────────────────────────────────────────────────────

export const buildPurchaseOrderPrintData = (
  item: PurchaseOrderRecord,
  ctx: CompanyContext = {}
): PrintDocumentData => ({
  documentTitle: 'Purchase Order',
  documentNumber: item.poNumber,
  documentDate: formatPrintDate(item.poDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Warehouse', value: item.warehouseName },
    { label: 'Expected Date', value: formatPrintDate(item.expectedDate) },
    { label: 'Reference', value: item.referenceNo },
  ],
  party: supplierParty(item.supplierName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'code', label: 'Code' },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'rate', label: 'Unit Price', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    code: line.productCode || '—',
    qty: formatPrintNumber(line.quantity),
    rate: formatPrintCurrency(line.unitPrice),
    amount: formatPrintCurrency(line.lineTotal),
  })),
  totals: tradingTotals(item.subtotal, item.taxAmount, item.totalAmount),
  notes: item.notes,
  footerText: 'This is a computer-generated purchase order.',
});

// ─── GRN ──────────────────────────────────────────────────────────────────────

export const buildGRNPrintData = (item: GRNRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Goods Receipt Note',
  documentNumber: item.grnNumber,
  documentDate: formatPrintDate(item.grnDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'PO Ref', value: item.poNumber },
    { label: 'Warehouse', value: item.warehouseName },
    { label: 'Reference', value: item.referenceNo },
  ],
  party: supplierParty(item.supplierName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'ordered', label: 'Ordered', align: 'right' },
    { key: 'received', label: 'Received', align: 'right' },
    { key: 'rate', label: 'Unit Cost', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    ordered: formatPrintNumber(line.orderedQty),
    received: formatPrintNumber(line.receivedQty),
    rate: formatPrintCurrency(line.unitCost),
    amount: formatPrintCurrency(line.lineTotal),
  })),
  totals: tradingTotals(item.subtotal, item.taxAmount, item.totalAmount),
  notes: item.notes,
  footerText: 'Goods receipt note for received stock.',
});

// ─── Purchase Return ────────────────────────────────────────────────────────────

export const buildPurchaseReturnPrintData = (item: PurchaseReturnRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Purchase Return',
  documentNumber: item.returnNumber,
  documentDate: formatPrintDate(item.returnDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'GRN Ref', value: item.grnNumber },
    { label: 'Warehouse', value: item.warehouseName },
    { label: 'Reference', value: item.referenceNo },
  ],
  party: supplierParty(item.supplierName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'rate', label: 'Unit Cost', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'reason', label: 'Reason' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    qty: formatPrintNumber(line.quantity),
    rate: formatPrintCurrency(line.unitCost),
    amount: formatPrintCurrency(line.lineTotal),
    reason: line.reason || '—',
  })),
  totals: [{ label: 'Total', value: formatPrintCurrency(item.totalAmount), emphasis: true }],
  notes: item.notes,
  footerText: 'Purchase return document.',
});

// ─── Sales Order ──────────────────────────────────────────────────────────────

export const buildSalesOrderPrintData = (item: SalesOrderRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Sales Order',
  documentNumber: item.soNumber,
  documentDate: formatPrintDate(item.soDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Warehouse', value: item.warehouseName },
    { label: 'Delivery Date', value: formatPrintDate(item.deliveryDate) },
    { label: 'Reference', value: item.referenceNo },
  ],
  party: customerParty(item.customerName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'code', label: 'Code' },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'rate', label: 'Unit Price', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    code: line.productCode || '—',
    qty: formatPrintNumber(line.quantity),
    rate: formatPrintCurrency(line.unitPrice),
    amount: formatPrintCurrency(line.lineTotal),
  })),
  totals: tradingTotals(item.subtotal, item.taxAmount, item.totalAmount),
  notes: item.notes,
  footerText: 'Sales order document.',
});

// ─── Delivery Challan ─────────────────────────────────────────────────────────

export const buildDeliveryChallanPrintData = (item: DeliveryChallanRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Delivery Challan',
  documentNumber: item.dcNumber,
  documentDate: formatPrintDate(item.dcDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'SO Ref', value: item.soNumber },
    { label: 'Warehouse', value: item.warehouseName },
    { label: 'Reference', value: item.referenceNo },
  ],
  party: customerParty(item.customerName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'ordered', label: 'Ordered', align: 'right' },
    { key: 'dispatched', label: 'Dispatched', align: 'right' },
    { key: 'rate', label: 'Unit Price', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    ordered: formatPrintNumber(line.orderedQty),
    dispatched: formatPrintNumber(line.dispatchedQty),
    rate: formatPrintCurrency(line.unitPrice),
    amount: formatPrintCurrency(line.lineTotal),
  })),
  totals: tradingTotals(item.subtotal, item.taxAmount, item.totalAmount),
  notes: item.notes,
  footerText: 'Delivery challan for dispatched goods.',
});

// ─── Sales Invoice ──────────────────────────────────────────────────────────────

export const buildSalesInvoicePrintData = (item: SalesInvoiceRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Tax Invoice',
  documentNumber: item.invoiceNumber,
  documentDate: formatPrintDate(item.invoiceDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Due Date', value: formatPrintDate(item.dueDate) },
    { label: 'DC Ref', value: item.dcNumber },
    { label: 'SO Ref', value: item.soNumber },
    { label: 'Warehouse', value: item.warehouseName },
  ],
  party: customerParty(item.customerName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'rate', label: 'Unit Price', align: 'right' },
    { key: 'tax', label: 'Tax', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    qty: formatPrintNumber(line.quantity),
    rate: formatPrintCurrency(line.unitPrice),
    tax: formatPrintCurrency(line.taxAmount),
    amount: formatPrintCurrency(line.lineTotal),
  })),
  totals: tradingTotals(item.subtotal, item.taxAmount, item.totalAmount, [
    ...(item.discount > 0 ? [{ label: 'Discount', value: formatPrintCurrency(item.discount) }] : []),
    { label: 'Paid', value: formatPrintCurrency(item.paidAmount) },
    { label: 'Balance', value: formatPrintCurrency(item.balanceAmount) },
  ]),
  notes: item.notes,
  footerText: 'This is a computer-generated tax invoice.',
});

// ─── Sales Return ─────────────────────────────────────────────────────────────

export const buildSalesReturnPrintData = (item: SalesReturnRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Sales Return',
  documentNumber: item.returnNumber,
  documentDate: formatPrintDate(item.returnDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Invoice Ref', value: item.invoiceNumber },
    { label: 'Warehouse', value: item.warehouseName },
    { label: 'Reference', value: item.referenceNo },
  ],
  party: customerParty(item.customerName),
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'rate', label: 'Unit Price', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'reason', label: 'Reason' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName || '—',
    qty: formatPrintNumber(line.quantity),
    rate: formatPrintCurrency(line.unitPrice),
    amount: formatPrintCurrency(line.lineTotal),
    reason: line.reason || '—',
  })),
  totals: [{ label: 'Total', value: formatPrintCurrency(item.totalAmount), emphasis: true }],
  notes: item.notes,
  footerText: 'Sales return document.',
});

// ─── Manufacturing ────────────────────────────────────────────────────────────

export const buildWorkOrderPrintData = (item: WorkOrderRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Work Order',
  documentNumber: item.workOrderNumber,
  documentDate: formatPrintDate(item.workOrderDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Planned Qty', value: formatPrintNumber(item.plannedQty, 0) },
    { label: 'Produced Qty', value: formatPrintNumber(item.producedQty, 0) },
    { label: 'Scheduled', value: formatPrintDate(item.scheduledDate) },
    { label: 'Completed', value: formatPrintDate(item.completedDate) },
  ],
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'material', label: 'Material' },
    { key: 'required', label: 'Required', align: 'right' },
    { key: 'issued', label: 'Issued', align: 'right' },
    { key: 'returned', label: 'Returned', align: 'right' },
  ],
  lines: item.materials.map((mat, i) => ({
    sno: i + 1,
    material: mat.productId,
    required: formatPrintNumber(mat.requiredQty),
    issued: formatPrintNumber(mat.issuedQty),
    returned: formatPrintNumber(mat.returnedQty),
  })),
  notes: item.notes,
  footerText: 'Work order for production planning.',
});

export const buildMaterialIssuePrintData = (item: MaterialIssueRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Material Issue',
  documentNumber: item.issueNumber,
  documentDate: formatPrintDate(item.issueDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [{ label: 'Work Order', value: item.workOrderId }],
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Material' },
    { key: 'required', label: 'Required', align: 'right' },
    { key: 'issued', label: 'Issued', align: 'right' },
    { key: 'notes', label: 'Notes' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productId,
    required: formatPrintNumber(line.requiredQty),
    issued: formatPrintNumber(line.issuedQty),
    notes: line.notes || '—',
  })),
  notes: item.notes,
  footerText: 'Material issue slip for production.',
});

export const buildProductionEntryPrintData = (item: ProductionEntryRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Production Entry',
  documentNumber: item.entryNumber,
  documentDate: formatPrintDate(item.entryDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Work Order', value: item.workOrderId },
    { label: 'Produced Qty', value: formatPrintNumber(item.producedQty) },
  ],
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Material' },
    { key: 'returned', label: 'Returned Qty', align: 'right' },
    { key: 'notes', label: 'Notes' },
  ],
  lines: item.materialReturns.length
    ? item.materialReturns.map((line, i) => ({
        sno: i + 1,
        product: line.productId,
        returned: formatPrintNumber(line.returnedQty),
        notes: line.notes || '—',
      }))
    : [{ sno: 1, product: 'Finished goods produced', returned: formatPrintNumber(item.producedQty), notes: '—' }],
  notes: item.notes,
  footerText: 'Production entry receipt.',
});

// ─── Stock ────────────────────────────────────────────────────────────────────

export const buildStockMovementPrintData = (item: StockMovementRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: item.movementType === 'in' ? 'Stock In' : 'Stock Out',
  documentNumber: item.documentNo,
  documentDate: formatPrintDate(item.movementDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Warehouse', value: item.warehouse.name },
    { label: 'Supplier', value: item.supplier?.name },
    { label: 'Reference', value: item.referenceNo },
    { label: 'Total Qty', value: formatPrintNumber(item.totalQuantity) },
  ],
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'code', label: 'Code' },
    { key: 'qty', label: 'Qty', align: 'right' },
    { key: 'rate', label: 'Unit Cost', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName,
    code: line.productCode,
    qty: formatPrintNumber(line.quantity),
    rate: formatPrintCurrency(line.unitCost),
    amount: formatPrintCurrency(line.quantity * (line.unitCost ?? 0)),
  })),
  notes: item.notes,
  footerText: 'Stock movement document.',
});

export const buildStockAdjustmentPrintData = (item: StockAdjustmentRecord, ctx: CompanyContext = {}): PrintDocumentData => ({
  documentTitle: 'Stock Adjustment',
  documentNumber: item.adjustmentNumber,
  documentDate: formatPrintDate(item.adjustmentDate),
  status: formatStatus(item.status),
  companyName: ctx.companyName,
  meta: [
    { label: 'Warehouse', value: item.warehouse.name },
    { label: 'Reason', value: item.reason },
  ],
  columns: [
    { key: 'sno', label: '#', align: 'center', width: '6%' },
    { key: 'product', label: 'Product' },
    { key: 'system', label: 'System Qty', align: 'right' },
    { key: 'physical', label: 'Physical Qty', align: 'right' },
    { key: 'difference', label: 'Difference', align: 'right' },
    { key: 'notes', label: 'Notes' },
  ],
  lines: item.lines.map((line, i) => ({
    sno: i + 1,
    product: line.productName,
    system: formatPrintNumber(line.systemQty),
    physical: formatPrintNumber(line.physicalQty),
    difference: formatPrintNumber(line.differenceQty),
    notes: line.reasonNote || '—',
  })),
  notes: item.notes,
  footerText: 'Physical stock adjustment document.',
});
