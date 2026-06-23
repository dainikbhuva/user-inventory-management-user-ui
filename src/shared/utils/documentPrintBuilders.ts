import type { PrintDocumentData, PrintDocumentParty } from '../types/documentPrint.types';
import type {
  PurchaseOrderRecord,
  PurchaseOrderFormValues,
  GRNRecord,
  GRNFormValues,
  PurchaseReturnRecord,
  PurchaseReturnFormValues,
  SalesOrderRecord,
  SalesOrderFormValues,
  DeliveryChallanRecord,
  DeliveryChallanFormValues,
  SalesInvoiceRecord,
  SalesInvoiceFormValues,
  SalesReturnRecord,
  SalesReturnFormValues,
  TradingLineFormValues,
  CustomerRecord,
} from '../types/trading.types';
import type {
  WorkOrderRecord,
  WorkOrderFormValues,
  MaterialIssueRecord,
  MaterialIssueFormValues,
  ProductionEntryRecord,
  ProductionEntryFormValues,
} from '../types/manufacturing.types';
import type { InventorySupplierRecord, InventoryWarehouseRecord, InventoryTaxRecord } from '../types/inventoryMaster.types';
import type { InventoryProductRecord, StockMovementRecord } from '../types/inventoryProduct.types';
import type { StockAdjustmentRecord } from '../types/inventoryStock.types';
import { computeTradingDocumentTotals } from './tradingCalculations';
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

const lineFromTradingForm = (line: TradingLineFormValues, index: number, products: InventoryProductRecord[]) => {
  const product = products.find((p) => p.id === line.productId);
  const qty = Number.parseFloat(line.quantity) || 0;
  const rate = Number.parseFloat(line.unitPrice || line.unitCost || '0') || 0;
  return {
    sno: index + 1,
    product: product?.productName || line.productName || '—',
    code: product?.productCode || line.productCode || '—',
    qty: formatPrintNumber(qty),
    rate: formatPrintCurrency(rate),
    amount: formatPrintCurrency(qty * rate),
  };
};

const sumFormLines = (lines: TradingLineFormValues[], taxes: InventoryTaxRecord[] = []) =>
  computeTradingDocumentTotals(lines, taxes);

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

export const buildPurchaseOrderPrintDataFromForm = (
  form: PurchaseOrderFormValues,
  masters: {
    suppliers: InventorySupplierRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
    taxes?: InventoryTaxRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const supplier = masters.suppliers.find((s) => s.id === form.supplierId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const totals = sumFormLines(form.lines, masters.taxes ?? []);
  return {
    documentTitle: 'Purchase Order (Preview)',
    documentNumber: form.poNumber || 'DRAFT',
    documentDate: formatPrintDate(form.poDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Expected Date', value: formatPrintDate(form.expectedDate) },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: supplierParty(supplier?.supplierName, supplier?.gstNumber, supplier?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'code', label: 'Code' },
      { key: 'qty', label: 'Qty', align: 'right' },
      { key: 'rate', label: 'Unit Price', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
    ],
    lines: form.lines.map((line, i) => lineFromTradingForm(line, i, masters.products)),
    totals: tradingTotals(totals.subtotal, totals.taxAmount, totals.totalAmount),
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildGRNPrintDataFromForm = (
  form: GRNFormValues,
  masters: {
    suppliers: InventorySupplierRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
    taxes?: InventoryTaxRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const supplier = masters.suppliers.find((s) => s.id === form.supplierId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const totals = sumFormLines(form.lines, masters.taxes ?? []);
  const lines = form.lines.map((line, i) => {
    const product = masters.products.find((p) => p.id === line.productId);
    const received = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitCost || line.unitPrice || '0') || 0;
    return {
      sno: i + 1,
      product: product?.productName || '—',
      ordered: '—',
      received: formatPrintNumber(received),
      rate: formatPrintCurrency(rate),
      amount: formatPrintCurrency(received * rate),
    };
  });
  return {
    documentTitle: 'Goods Receipt Note (Preview)',
    documentNumber: form.grnNumber || 'DRAFT',
    documentDate: formatPrintDate(form.grnDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: supplierParty(supplier?.supplierName, supplier?.gstNumber, supplier?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'ordered', label: 'Ordered', align: 'right' },
      { key: 'received', label: 'Received', align: 'right' },
      { key: 'rate', label: 'Unit Cost', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
    ],
    lines,
    totals: tradingTotals(totals.subtotal, totals.taxAmount, totals.totalAmount),
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildPurchaseReturnPrintDataFromForm = (
  form: PurchaseReturnFormValues,
  masters: {
    suppliers: InventorySupplierRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const supplier = masters.suppliers.find((s) => s.id === form.supplierId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const lines = form.lines.map((line, i) => {
    const product = masters.products.find((p) => p.id === line.productId);
    const qty = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitCost || '0') || 0;
    return {
      sno: i + 1,
      product: product?.productName || '—',
      qty: formatPrintNumber(qty),
      rate: formatPrintCurrency(rate),
      amount: formatPrintCurrency(qty * rate),
      reason: line.reason || '—',
    };
  });
  const total = form.lines.reduce((sum, line) => {
    const qty = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitCost || '0') || 0;
    return sum + qty * rate;
  }, 0);
  return {
    documentTitle: 'Purchase Return (Preview)',
    documentNumber: form.returnNumber || 'DRAFT',
    documentDate: formatPrintDate(form.returnDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: supplierParty(supplier?.supplierName, supplier?.gstNumber, supplier?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'qty', label: 'Qty', align: 'right' },
      { key: 'rate', label: 'Unit Cost', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'reason', label: 'Reason' },
    ],
    lines,
    totals: [{ label: 'Total', value: formatPrintCurrency(total), emphasis: true }],
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildSalesOrderPrintDataFromForm = (
  form: SalesOrderFormValues,
  masters: {
    customers: CustomerRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
    taxes?: InventoryTaxRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const customer = masters.customers.find((c) => c.id === form.customerId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const totals = sumFormLines(form.lines, masters.taxes ?? []);
  return {
    documentTitle: 'Sales Order (Preview)',
    documentNumber: form.soNumber || 'DRAFT',
    documentDate: formatPrintDate(form.soDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Delivery Date', value: formatPrintDate(form.deliveryDate) },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: customerParty(customer?.customerName, customer?.gstNumber, customer?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'code', label: 'Code' },
      { key: 'qty', label: 'Qty', align: 'right' },
      { key: 'rate', label: 'Unit Price', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
    ],
    lines: form.lines.map((line, i) => lineFromTradingForm(line, i, masters.products)),
    totals: tradingTotals(totals.subtotal, totals.taxAmount, totals.totalAmount),
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildDeliveryChallanPrintDataFromForm = (
  form: DeliveryChallanFormValues,
  masters: {
    customers: CustomerRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
    taxes?: InventoryTaxRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const customer = masters.customers.find((c) => c.id === form.customerId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const totals = sumFormLines(form.lines, masters.taxes ?? []);
  const lines = form.lines.map((line, i) => {
    const product = masters.products.find((p) => p.id === line.productId);
    const dispatched = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitPrice || '0') || 0;
    return {
      sno: i + 1,
      product: product?.productName || '—',
      ordered: '—',
      dispatched: formatPrintNumber(dispatched),
      rate: formatPrintCurrency(rate),
      amount: formatPrintCurrency(dispatched * rate),
    };
  });
  return {
    documentTitle: 'Delivery Challan (Preview)',
    documentNumber: form.dcNumber || 'DRAFT',
    documentDate: formatPrintDate(form.dcDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: customerParty(customer?.customerName, customer?.gstNumber, customer?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'ordered', label: 'Ordered', align: 'right' },
      { key: 'dispatched', label: 'Dispatched', align: 'right' },
      { key: 'rate', label: 'Unit Price', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
    ],
    lines,
    totals: tradingTotals(totals.subtotal, totals.taxAmount, totals.totalAmount),
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildSalesInvoicePrintDataFromForm = (
  form: SalesInvoiceFormValues,
  masters: {
    customers: CustomerRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
    taxes?: InventoryTaxRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const customer = masters.customers.find((c) => c.id === form.customerId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const totals = sumFormLines(form.lines, masters.taxes ?? []);
  const discount = Number.parseFloat(form.discount) || 0;
  const totalAmount = totals.totalAmount - discount;
  return {
    documentTitle: 'Tax Invoice (Preview)',
    documentNumber: form.invoiceNumber || 'DRAFT',
    documentDate: formatPrintDate(form.invoiceDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Due Date', value: formatPrintDate(form.dueDate) },
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: customerParty(customer?.customerName, customer?.gstNumber, customer?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'qty', label: 'Qty', align: 'right' },
      { key: 'rate', label: 'Unit Price', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
    ],
    lines: form.lines.map((line, i) => lineFromTradingForm(line, i, masters.products)),
    totals: tradingTotals(totals.subtotal, totals.taxAmount, totalAmount, [
      ...(discount > 0 ? [{ label: 'Discount', value: formatPrintCurrency(discount) }] : []),
    ]),
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildSalesReturnPrintDataFromForm = (
  form: SalesReturnFormValues,
  masters: {
    customers: CustomerRecord[];
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const customer = masters.customers.find((c) => c.id === form.customerId);
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const lines = form.lines.map((line, i) => {
    const product = masters.products.find((p) => p.id === line.productId);
    const qty = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitPrice || '0') || 0;
    return {
      sno: i + 1,
      product: product?.productName || '—',
      qty: formatPrintNumber(qty),
      rate: formatPrintCurrency(rate),
      amount: formatPrintCurrency(qty * rate),
      reason: line.reason || '—',
    };
  });
  const total = form.lines.reduce((sum, line) => {
    const qty = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitPrice || '0') || 0;
    return sum + qty * rate;
  }, 0);
  return {
    documentTitle: 'Sales Return (Preview)',
    documentNumber: form.returnNumber || 'DRAFT',
    documentDate: formatPrintDate(form.returnDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Reference', value: form.referenceNo },
    ],
    party: customerParty(customer?.customerName, customer?.gstNumber, customer?.mobile),
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'qty', label: 'Qty', align: 'right' },
      { key: 'rate', label: 'Unit Price', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'reason', label: 'Reason' },
    ],
    lines,
    totals: [{ label: 'Total', value: formatPrintCurrency(total), emphasis: true }],
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildWorkOrderPrintDataFromForm = (
  form: WorkOrderFormValues,
  masters: { warehouses: InventoryWarehouseRecord[]; boms: { id: string; bomName: string; bomCode: string }[] },
  workOrderNumber: string,
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const bom = masters.boms.find((b) => b.id === form.bomId);
  return {
    documentTitle: 'Work Order (Preview)',
    documentNumber: workOrderNumber || 'DRAFT',
    documentDate: formatPrintDate(form.workOrderDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'BOM', value: bom ? `${bom.bomName} (${bom.bomCode})` : undefined },
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Planned Qty', value: formatPrintNumber(form.plannedQty, 0) },
      { label: 'Scheduled', value: formatPrintDate(form.scheduledDate) },
    ],
    columns: [
      { key: 'info', label: 'Details' },
      { key: 'value', label: 'Value' },
    ],
    lines: [
      { info: 'Work Order Date', value: formatPrintDate(form.workOrderDate) },
      { info: 'Planned Quantity', value: formatPrintNumber(form.plannedQty, 0) },
      { info: 'BOM', value: bom?.bomName || '—' },
      { info: 'Warehouse', value: warehouse?.name || '—' },
    ],
    notes: form.notes,
    footerText: 'Draft preview — material requirements are calculated after save.',
  };
};

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

export const buildMaterialIssuePrintDataFromForm = (
  form: MaterialIssueFormValues,
  masters: { products: InventoryProductRecord[]; workOrders: { id: string; workOrderNumber: string }[] },
  issueNumber: string,
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const wo = masters.workOrders.find((w) => w.id === form.workOrderId);
  return {
    documentTitle: 'Material Issue (Preview)',
    documentNumber: issueNumber || 'DRAFT',
    documentDate: formatPrintDate(form.issueDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [{ label: 'Work Order', value: wo?.workOrderNumber }],
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Material' },
      { key: 'required', label: 'Required', align: 'right' },
      { key: 'issued', label: 'Issued', align: 'right' },
      { key: 'notes', label: 'Notes' },
    ],
    lines: form.lines.map((line, i) => {
      const product = masters.products.find((p) => p.id === line.productId);
      return {
        sno: i + 1,
        product: product?.productName || line.productId || '—',
        required: formatPrintNumber(line.requiredQty),
        issued: formatPrintNumber(line.issuedQty),
        notes: line.notes || '—',
      };
    }),
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildProductionEntryPrintDataFromForm = (
  form: ProductionEntryFormValues,
  masters: { products: InventoryProductRecord[]; workOrders: { id: string; workOrderNumber: string }[] },
  entryNumber: string,
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const wo = masters.workOrders.find((w) => w.id === form.workOrderId);
  return {
    documentTitle: 'Production Entry (Preview)',
    documentNumber: entryNumber || 'DRAFT',
    documentDate: formatPrintDate(form.entryDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Work Order', value: wo?.workOrderNumber },
      { label: 'Produced Qty', value: formatPrintNumber(form.producedQty) },
    ],
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Material' },
      { key: 'returned', label: 'Returned Qty', align: 'right' },
      { key: 'notes', label: 'Notes' },
    ],
    lines: form.materialReturns.length
      ? form.materialReturns.map((line, i) => {
          const product = masters.products.find((p) => p.id === line.productId);
          return {
            sno: i + 1,
            product: product?.productName || line.productId || '—',
            returned: formatPrintNumber(line.returnedQty),
            notes: line.notes || '—',
          };
        })
      : [{ sno: 1, product: 'Finished goods produced', returned: formatPrintNumber(form.producedQty), notes: '—' }],
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

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

export const buildStockMovementPrintDataFromForm = (
  form: import('../types/inventoryProduct.types').StockMovementFormValues,
  movementType: 'in' | 'out',
  masters: {
    warehouses: InventoryWarehouseRecord[];
    suppliers: InventorySupplierRecord[];
    products: InventoryProductRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const supplier = masters.suppliers.find((s) => s.id === form.supplierId);
  const lines = form.lines.map((line, i) => {
    const product = masters.products.find((p) => p.id === line.productId);
    const qty = Number.parseFloat(line.quantity) || 0;
    const rate = Number.parseFloat(line.unitCost) || 0;
    return {
      sno: i + 1,
      product: product?.productName || '—',
      code: product?.productCode || '—',
      qty: formatPrintNumber(qty),
      rate: formatPrintCurrency(rate),
      amount: formatPrintCurrency(qty * rate),
    };
  });
  const totalQty = form.lines.reduce((sum, line) => sum + (Number.parseFloat(line.quantity) || 0), 0);
  return {
    documentTitle: movementType === 'in' ? 'Stock In (Preview)' : 'Stock Out (Preview)',
    documentNumber: form.documentNo || 'DRAFT',
    documentDate: formatPrintDate(form.movementDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Supplier', value: supplier?.supplierName },
      { label: 'Reference', value: form.referenceNo },
      { label: 'Total Qty', value: formatPrintNumber(totalQty) },
    ],
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'code', label: 'Code' },
      { key: 'qty', label: 'Qty', align: 'right' },
      { key: 'rate', label: 'Unit Cost', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
    ],
    lines,
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};

export const buildStockAdjustmentPrintDataFromForm = (
  form: import('../types/inventoryStock.types').StockAdjustmentFormValues,
  masters: {
    warehouses: InventoryWarehouseRecord[];
    products: InventoryProductRecord[];
    warehouseStock: import('../types/inventoryStock.types').CurrentStockRecord[];
  },
  ctx: CompanyContext = {}
): PrintDocumentData => {
  const warehouse = masters.warehouses.find((w) => w.id === form.warehouseId);
  const getSystemQty = (productId: string) => {
    if (!form.warehouseId || !productId) return 0;
    const row = masters.warehouseStock.find(
      (item) => item.warehouse.id === form.warehouseId && item.product.id === productId
    );
    return row?.currentStock ?? 0;
  };
  const lines = form.lines.map((line, i) => {
    const product = masters.products.find((p) => p.id === line.productId);
    const system = getSystemQty(line.productId);
    const physical = Number.parseFloat(line.physicalQty) || 0;
    return {
      sno: i + 1,
      product: product?.productName || '—',
      system: formatPrintNumber(system),
      physical: formatPrintNumber(physical),
      difference: formatPrintNumber(physical - system),
      notes: line.reasonNote || '—',
    };
  });
  return {
    documentTitle: 'Stock Adjustment (Preview)',
    documentNumber: form.adjustmentNumber || 'DRAFT',
    documentDate: formatPrintDate(form.adjustmentDate),
    status: 'Draft Preview',
    companyName: ctx.companyName,
    meta: [
      { label: 'Warehouse', value: warehouse?.name },
      { label: 'Reason', value: form.reason || undefined },
    ],
    columns: [
      { key: 'sno', label: '#', align: 'center', width: '6%' },
      { key: 'product', label: 'Product' },
      { key: 'system', label: 'System Qty', align: 'right' },
      { key: 'physical', label: 'Physical Qty', align: 'right' },
      { key: 'difference', label: 'Difference', align: 'right' },
      { key: 'notes', label: 'Notes' },
    ],
    lines,
    notes: form.notes,
    footerText: 'Draft preview — values may change before save.',
  };
};
