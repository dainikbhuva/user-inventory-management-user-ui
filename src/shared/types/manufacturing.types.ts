/** UI types for Phase 2 manufacturing modules */

// ─── BOM ─────────────────────────────────────────────────────────────────────

export interface BOMComponent {
  productId: string;
  quantity: number;
  unitId?: string;
  notes?: string;
}

export interface BOMRecord {
  id: string;
  bomCode: string;
  bomName: string;
  finishedProductId: string;
  outputQty: number;
  outputUnitId?: string;
  components: BOMComponent[];
  notes?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface BOMFormValues {
  bomCode: string;
  bomName: string;
  finishedProductId: string;
  outputQty: number;
  outputUnitId: string;
  components: BOMComponentFormRow[];
  notes: string;
  status: 'active' | 'inactive';
}

export interface BOMComponentFormRow {
  productId: string;
  quantity: number;
  unitId: string;
  notes: string;
}

// ─── Work Order ───────────────────────────────────────────────────────────────

export interface WorkOrderMaterial {
  productId: string;
  requiredQty: number;
  issuedQty: number;
  returnedQty: number;
  unitId?: string;
}

export interface WorkOrderRecord {
  id: string;
  workOrderNumber: string;
  workOrderDate: string;
  bomId: string;
  finishedProductId: string;
  warehouseId: string;
  plannedQty: number;
  producedQty: number;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  materials: WorkOrderMaterial[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrderFormValues {
  workOrderDate: string;
  bomId: string;
  warehouseId: string;
  plannedQty: number;
  scheduledDate: string;
  notes: string;
}

// ─── Material Issue ───────────────────────────────────────────────────────────

export interface MaterialIssueLine {
  productId: string;
  requiredQty: number;
  issuedQty: number;
  notes: string;
}

export interface MaterialIssueRecord {
  id: string;
  issueNumber: string;
  issueDate: string;
  workOrderId: string;
  warehouseId: string;
  notes?: string;
  status: 'draft' | 'issued' | 'cancelled';
  lines: MaterialIssueLine[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialIssueFormValues {
  issueDate: string;
  workOrderId: string;
  warehouseId: string;
  notes: string;
  lines: MaterialIssueLine[];
}

// ─── Production Entry ─────────────────────────────────────────────────────────

export interface MaterialReturnLine {
  productId: string;
  returnedQty: number;
  notes: string;
}

export interface ProductionEntryRecord {
  id: string;
  entryNumber: string;
  entryDate: string;
  workOrderId: string;
  finishedProductId: string;
  warehouseId: string;
  producedQty: number;
  materialReturns: MaterialReturnLine[];
  notes?: string;
  status: 'draft' | 'posted' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionEntryFormValues {
  entryDate: string;
  workOrderId: string;
  warehouseId: string;
  producedQty: number;
  materialReturns: MaterialReturnLine[];
  notes: string;
}
