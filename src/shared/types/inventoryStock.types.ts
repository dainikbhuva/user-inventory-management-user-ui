export interface StockRefRecord {
  id: string;
  name: string;
  code?: string;
  employeeCode?: string;
}

export interface CurrentStockRecord {
  id: string;
  product: { id: string; name: string; code: string };
  warehouse: StockRefRecord;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  stockValue: number;
  isLowStock: boolean;
  lastUpdated?: string;
}

export interface StockLedgerRecord {
  id: string;
  transactionDate: string;
  product: { id: string; name: string; code: string };
  warehouse: StockRefRecord;
  transactionType: string;
  referenceNumber: string;
  qtyIn: number;
  qtyOut: number;
  balanceQty: number;
  unitPrice?: number;
  createdBy: StockRefRecord;
  createdAt?: string;
}

export interface StockAdjustmentRecord {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: string;
  warehouse: StockRefRecord;
  reason: string;
  notes?: string;
  status: 'draft' | 'approved' | 'cancelled';
  lines: Array<{
    productId: string;
    productCode: string;
    productName: string;
    systemQty: number;
    physicalQty: number;
    differenceQty: number;
    reasonNote?: string;
  }>;
  createdBy: StockRefRecord;
  approvedBy?: StockRefRecord;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StockAdjustmentReason =
  | 'damage'
  | 'theft'
  | 'expiry'
  | 'physical_count'
  | 'other';

export interface StockAdjustmentLineFormValues {
  productId: string;
  physicalQty: string;
  reasonNote: string;
}

export interface StockAdjustmentFormValues {
  adjustmentNumber: string;
  adjustmentDate: string;
  warehouseId: string;
  reason: StockAdjustmentReason | '';
  notes: string;
  lines: StockAdjustmentLineFormValues[];
}
