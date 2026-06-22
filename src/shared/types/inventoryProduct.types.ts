export type InventoryProductStockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryProductRef {
  id: string;
  name: string;
  code?: string;
}

export interface InventoryProductRecord {
  id: string;
  productCode: string;
  productName: string;
  description?: string;
  category: InventoryProductRef;
  unit: InventoryProductRef;
  brand?: InventoryProductRef;
  tax?: InventoryProductRef & { taxRate?: number; hsnCode?: string };
  defaultWarehouse?: InventoryProductRef;
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  maxStock: number;
  quantityOnHand: number;
  stockLevel: InventoryProductStockLevel;
  barcode?: string;
  productType?: 'trading' | 'raw_material' | 'semi_finished' | 'finished_goods';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormValues {
  productCode: string;
  productName: string;
  description: string;
  categoryId: string;
  unitId: string;
  brandId: string;
  taxId: string;
  defaultWarehouseId: string;
  purchasePrice: string;
  salePrice: string;
  minStock: string;
  maxStock: string;
  barcode: string;
  status: 'active' | 'inactive';
}

export type StockMovementType = 'in' | 'out';
export type StockMovementStatus = 'draft' | 'posted' | 'cancelled';

export interface StockMovementLineRecord {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitCost?: number;
}

export interface StockMovementRecord {
  id: string;
  documentNo: string;
  movementType: StockMovementType;
  movementDate: string;
  warehouse: InventoryProductRef;
  supplier?: InventoryProductRef;
  referenceNo?: string;
  notes?: string;
  status: StockMovementStatus;
  lines: StockMovementLineRecord[];
  totalQuantity: number;
  createdBy: InventoryProductRef & { employeeCode?: string };
  postedBy?: InventoryProductRef;
  postedAt?: string;
  cancelledBy?: InventoryProductRef;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovementLineFormValues {
  productId: string;
  quantity: string;
  unitCost: string;
}

export interface StockMovementFormValues {
  documentNo: string;
  movementDate: string;
  warehouseId: string;
  supplierId: string;
  referenceNo: string;
  notes: string;
  lines: StockMovementLineFormValues[];
}
