import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type {
  CurrentStockRecord,
  StockAdjustmentRecord,
  StockLedgerRecord,
} from '../shared/types/inventoryStock.types';

export type StockAdjustmentPayload = {
  adjustmentNumber?: string;
  autoGenerateAdjustmentNumber?: boolean;
  adjustmentDate: string;
  warehouseId: string;
  reason: 'damage' | 'theft' | 'expiry' | 'physical_count' | 'other';
  notes?: string;
  lines: Array<{ productId: string; physicalQty: number; reasonNote?: string }>;
};

export const inventoryStockService = {
  async getCurrentStock(): Promise<CurrentStockRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: CurrentStockRecord[] }>>(
      API_ENDPOINTS.INVENTORY_STOCK.CURRENT
    );
    return response.data.data?.items ?? [];
  },

  async getLowStock(): Promise<CurrentStockRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: CurrentStockRecord[] }>>(
      API_ENDPOINTS.INVENTORY_STOCK.LOW_STOCK
    );
    return response.data.data?.items ?? [];
  },

  async getStockLedger(): Promise<StockLedgerRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: StockLedgerRecord[] }>>(
      API_ENDPOINTS.INVENTORY_STOCK.LEDGER
    );
    return response.data.data?.items ?? [];
  },

  async getAdjustments(): Promise<StockAdjustmentRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: StockAdjustmentRecord[] }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENTS
    );
    return response.data.data?.items ?? [];
  },

  async getAdjustmentById(id: string): Promise<StockAdjustmentRecord> {
    const response = await axiosClient.get<ApiResponse<{ item: StockAdjustmentRecord }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENT_BY_ID(id)
    );
    return response.data.data!.item;
  },

  async getNextAdjustmentNumber(): Promise<string> {
    const response = await axiosClient.get<ApiResponse<{ adjustmentNumber: string }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENT_NEXT
    );
    return response.data.data!.adjustmentNumber;
  },

  async createAdjustment(payload: StockAdjustmentPayload): Promise<StockAdjustmentRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: StockAdjustmentRecord }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENTS,
      payload
    );
    return response.data.data!.item;
  },

  async updateAdjustment(
    id: string,
    payload: Omit<StockAdjustmentPayload, 'adjustmentNumber' | 'autoGenerateAdjustmentNumber'>
  ): Promise<StockAdjustmentRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: StockAdjustmentRecord }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENT_BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async approveAdjustment(id: string): Promise<StockAdjustmentRecord> {
    const response = await axiosClient.patch<ApiResponse<{ item: StockAdjustmentRecord }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENT_APPROVE(id)
    );
    return response.data.data!.item;
  },

  async cancelAdjustment(id: string): Promise<StockAdjustmentRecord> {
    const response = await axiosClient.patch<ApiResponse<{ item: StockAdjustmentRecord }>>(
      API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENT_CANCEL(id)
    );
    return response.data.data!.item;
  },

  async deleteAdjustment(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.INVENTORY_STOCK.ADJUSTMENT_BY_ID(id));
  },
};
