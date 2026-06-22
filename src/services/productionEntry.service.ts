import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { ProductionEntryRecord } from '../shared/types/manufacturing.types';

export interface MaterialReturnPayload {
  productId: string;
  returnedQty: number;
  notes?: string;
}

export interface ProductionEntryPayload {
  entryDate: string;
  workOrderId: string;
  warehouseId: string;
  producedQty: number;
  materialReturns?: MaterialReturnPayload[];
  notes?: string;
}

export const productionEntryService = {
  async getAll(): Promise<ProductionEntryRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: ProductionEntryRecord[] }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.LIST);
    return res.data.data?.items ?? [];
  },

  async getById(id: string): Promise<ProductionEntryRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: ProductionEntryRecord }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.BY_ID(id));
    return res.data.data!.item;
  },

  async getNextEntryNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ entryNumber: string }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.NEXT_NUMBER);
    return res.data.data!.entryNumber;
  },

  async create(payload: ProductionEntryPayload): Promise<ProductionEntryRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: ProductionEntryRecord }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.LIST, payload);
    return res.data.data!.item;
  },

  async update(id: string, payload: Partial<ProductionEntryPayload>): Promise<ProductionEntryRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: ProductionEntryRecord }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.BY_ID(id), payload);
    return res.data.data!.item;
  },

  async post(id: string): Promise<ProductionEntryRecord> {
    const res = await axiosClient.patch<ApiResponse<{ item: ProductionEntryRecord }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.POST(id));
    return res.data.data!.item;
  },

  async cancel(id: string): Promise<ProductionEntryRecord> {
    const res = await axiosClient.patch<ApiResponse<{ item: ProductionEntryRecord }>>(API_ENDPOINTS.PRODUCTION_ENTRIES.CANCEL(id));
    return res.data.data!.item;
  },
};
