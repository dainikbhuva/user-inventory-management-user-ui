import axiosClient from './api/axiosClient'
import { API_ENDPOINTS } from './api/endpoints'
import type { ApiResponse } from '../shared/types/api.types'
import type { PortalUserRecord } from '../shared/types/portal.types'
import type { PortalAttendanceRecord, AttendanceListQuery } from '../shared/types/attendance.types'
import type {
  InventoryProductRecord,
  StockMovementRecord,
  StockMovementType,
} from '../shared/types/inventoryProduct.types'
import type {
  CurrentStockRecord,
  StockLedgerRecord,
  StockAdjustmentRecord,
} from '../shared/types/inventoryStock.types'

const getItems = async <T>(url: string): Promise<T[]> => {
  const response = await axiosClient.get<ApiResponse<{ items: T[] }>>(url)
  return response.data.data!.items
}

export const reportService = {
  getUserReport: () => getItems<PortalUserRecord>(API_ENDPOINTS.REPORTS.USERS),

  async getAttendanceReport(filters: AttendanceListQuery = {}): Promise<PortalAttendanceRecord[]> {
    const params = new URLSearchParams()
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.userId) params.set('userId', filters.userId)
    if (filters.status) params.set('status', filters.status)
    const query = params.toString()
    return getItems<PortalAttendanceRecord>(
      `${API_ENDPOINTS.REPORTS.ATTENDANCE}${query ? `?${query}` : ''}`
    )
  },

  getProductReport: () => getItems<InventoryProductRecord>(API_ENDPOINTS.REPORTS.PRODUCTS),

  getStockMovementReport: (movementType: StockMovementType) =>
    getItems<StockMovementRecord>(
      movementType === 'in' ? API_ENDPOINTS.REPORTS.STOCK_IN : API_ENDPOINTS.REPORTS.STOCK_OUT
    ),

  getCurrentStockReport: () =>
    getItems<CurrentStockRecord>(API_ENDPOINTS.REPORTS.CURRENT_STOCK),

  getStockLedgerReport: () => getItems<StockLedgerRecord>(API_ENDPOINTS.REPORTS.STOCK_LEDGER),

  getStockAdjustmentReport: () =>
    getItems<StockAdjustmentRecord>(API_ENDPOINTS.REPORTS.STOCK_ADJUSTMENTS),
}
