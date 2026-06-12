// Inventory related types
export interface InventoryItem {
  id: string
  name: string
  description?: string
  sku: string
  category: string
  price: number
  quantity: number
  minStock: number
  maxStock: number
  unit: string
  status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'discontinued'
  location?: string
  supplier?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryData {
  name: string
  description?: string
  sku: string
  category: string
  price: number
  quantity: number
  minStock: number
  maxStock: number
  unit: string
  location?: string
  supplier?: string
}

export interface UpdateInventoryData {
  name?: string
  description?: string
  sku?: string
  category?: string
  price?: number
  quantity?: number
  minStock?: number
  maxStock?: number
  unit?: string
  status?: 'in_stock' | 'out_of_stock' | 'low_stock' | 'discontinued'
  location?: string
  supplier?: string
}

export interface StockAdjustment {
  id: string
  inventoryId: string
  type: 'increase' | 'decrease'
  quantity: number
  reason: string
  previousQuantity: number
  newQuantity: number
  adjustedBy: string
  createdAt: string
}

export interface CreateStockAdjustment {
  inventoryId: string
  type: 'increase' | 'decrease'
  quantity: number
  reason: string
}

export interface InventoryFilters {
  search: string
  category: string
  status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'discontinued' | 'all'
  dateRange: {
    start: string | null
    end: string | null
  }
  location?: string
  supplier?: string
}

export interface InventoryStats {
  total: number
  inStock: number
  outOfStock: number
  lowStock: number
  discontinued: number
  totalValue: number
  categories: Array<{
    name: string
    count: number
    value: number
  }>
  recentAdjustments: number
}

export interface InventoryCategory {
  id: string
  name: string
  description?: string
  itemCount: number
  totalValue: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  description?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
}
