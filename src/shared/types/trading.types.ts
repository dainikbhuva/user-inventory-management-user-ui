/** UI types for Phase 1 trading modules */

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface CustomerRecord {
  id: string;
  customerCode: string;
  customerName: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  creditLimit?: number;
  paymentTerms?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormValues {
  customerCode: string;
  customerName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  alternateMobile: string;
  gstNumber: string;
  panNumber: string;
  website: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  creditLimit: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
}

// ─── Trading document line ─────────────────────────────────────────────────────

export interface TradingLineFormValues {
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: string;
  unitPrice: string;
  unitCost?: string;
  taxId: string;
  taxRate?: number;
  dispatchedQty?: number;
  receivedQty?: number;
  reason?: string;
  notes: string;
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export type PurchaseOrderStatus = 'draft' | 'approved' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  poDate: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  expectedDate?: string;
  referenceNo?: string;
  notes?: string;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLineRecord[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface PurchaseOrderLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
  taxName?: string;
  taxRate?: number;
  receivedQty: number;
  lineTotal: number;
  notes?: string;
}

export interface PurchaseOrderFormValues {
  poNumber: string;
  poDate: string;
  supplierId: string;
  warehouseId: string;
  expectedDate: string;
  referenceNo: string;
  notes: string;
  lines: TradingLineFormValues[];
}

// ─── GRN ─────────────────────────────────────────────────────────────────────

export type GRNStatus = 'draft' | 'posted' | 'cancelled';

export interface GRNRecord {
  id: string;
  grnNumber: string;
  grnDate: string;
  purchaseOrderId?: string;
  poNumber?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  referenceNo?: string;
  notes?: string;
  status: GRNStatus;
  lines: GRNLineRecord[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  postedBy?: string;
  postedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface GRNLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  taxId?: string;
  taxRate?: number;
  lineTotal: number;
  notes?: string;
}

export interface GRNFormValues {
  grnNumber: string;
  grnDate: string;
  purchaseOrderId: string;
  supplierId: string;
  warehouseId: string;
  referenceNo: string;
  notes: string;
  lines: TradingLineFormValues[];
}

// ─── Purchase Return ──────────────────────────────────────────────────────────

export type PurchaseReturnStatus = 'draft' | 'posted' | 'cancelled';

export interface PurchaseReturnRecord {
  id: string;
  returnNumber: string;
  returnDate: string;
  grnId?: string;
  grnNumber?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  referenceNo?: string;
  notes?: string;
  status: PurchaseReturnStatus;
  lines: PurchaseReturnLineRecord[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  postedBy?: string;
  postedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface PurchaseReturnLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitCost: number;
  reason: string;
  lineTotal: number;
  notes?: string;
}

export interface PurchaseReturnFormValues {
  returnNumber: string;
  returnDate: string;
  grnId: string;
  supplierId: string;
  warehouseId: string;
  referenceNo: string;
  notes: string;
  lines: TradingLineFormValues[];
}

// ─── Sales Order ──────────────────────────────────────────────────────────────

export type SalesOrderStatus =
  | 'draft'
  | 'confirmed'
  | 'partially_dispatched'
  | 'dispatched'
  | 'invoiced'
  | 'cancelled';

export interface SalesOrderRecord {
  id: string;
  soNumber: string;
  soDate: string;
  customerId: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  deliveryDate?: string;
  referenceNo?: string;
  notes?: string;
  status: SalesOrderStatus;
  lines: SalesOrderLineRecord[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface SalesOrderLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
  taxRate?: number;
  dispatchedQty: number;
  lineTotal: number;
  notes?: string;
}

export interface SalesOrderFormValues {
  soNumber: string;
  soDate: string;
  customerId: string;
  warehouseId: string;
  deliveryDate: string;
  referenceNo: string;
  notes: string;
  lines: TradingLineFormValues[];
}

// ─── Delivery Challan ─────────────────────────────────────────────────────────

export type DeliveryChallanStatus = 'draft' | 'dispatched' | 'cancelled';

export interface DeliveryChallanRecord {
  id: string;
  dcNumber: string;
  dcDate: string;
  salesOrderId?: string;
  soNumber?: string;
  customerId: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  referenceNo?: string;
  notes?: string;
  status: DeliveryChallanStatus;
  lines: DeliveryChallanLineRecord[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  dispatchedBy?: string;
  dispatchedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface DeliveryChallanLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  orderedQty: number;
  dispatchedQty: number;
  unitPrice: number;
  taxId?: string;
  taxRate?: number;
  lineTotal: number;
  notes?: string;
}

export interface DeliveryChallanFormValues {
  dcNumber: string;
  dcDate: string;
  salesOrderId: string;
  customerId: string;
  warehouseId: string;
  referenceNo: string;
  notes: string;
  lines: TradingLineFormValues[];
}

// ─── Sales Invoice ────────────────────────────────────────────────────────────

export type SalesInvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'cancelled';

export interface SalesInvoiceRecord {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  deliveryChallanId?: string;
  dcNumber?: string;
  salesOrderId?: string;
  soNumber?: string;
  customerId: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  referenceNo?: string;
  notes?: string;
  status: SalesInvoiceStatus;
  lines: SalesInvoiceLineRecord[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  createdAt?: string;
  updatedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface SalesInvoiceLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  notes?: string;
}

export interface SalesInvoiceFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  deliveryChallanId: string;
  salesOrderId: string;
  customerId: string;
  warehouseId: string;
  referenceNo: string;
  notes: string;
  discount: string;
  lines: TradingLineFormValues[];
}

// ─── Sales Return ─────────────────────────────────────────────────────────────

export type SalesReturnStatus = 'draft' | 'posted' | 'cancelled';

export interface SalesReturnRecord {
  id: string;
  returnNumber: string;
  returnDate: string;
  salesInvoiceId?: string;
  invoiceNumber?: string;
  customerId: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  referenceNo?: string;
  notes?: string;
  status: SalesReturnStatus;
  lines: SalesReturnLineRecord[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  postedBy?: string;
  postedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface SalesReturnLineRecord {
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  lineTotal: number;
  notes?: string;
}

export interface SalesReturnFormValues {
  returnNumber: string;
  returnDate: string;
  salesInvoiceId: string;
  customerId: string;
  warehouseId: string;
  referenceNo: string;
  notes: string;
  lines: TradingLineFormValues[];
}
