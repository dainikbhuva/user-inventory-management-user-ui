import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { BOMRecord } from '../shared/types/manufacturing.types';

export interface BOMPayload {
  bomCode?: string;
  autoGenerateBomCode?: boolean;
  bomName: string;
  finishedProductId: string;
  outputQty: number;
  outputUnitId?: string;
  components: { productId: string; quantity: number; unitId?: string; notes?: string }[];
  notes?: string;
  status?: 'active' | 'inactive';
}

export const bomService = {
  async getAll(): Promise<BOMRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: BOMRecord[] }>>(API_ENDPOINTS.BOMS.LIST);
    return res.data.data?.items ?? [];
  },

  async getActive(): Promise<BOMRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: BOMRecord[] }>>(API_ENDPOINTS.BOMS.ACTIVE);
    return res.data.data?.items ?? [];
  },

  async getById(id: string): Promise<BOMRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: BOMRecord }>>(API_ENDPOINTS.BOMS.BY_ID(id));
    return res.data.data!.item;
  },

  async getByFinishedProduct(productId: string): Promise<BOMRecord | null> {
    const res = await axiosClient.get<ApiResponse<{ item: BOMRecord | null }>>(
      API_ENDPOINTS.BOMS.BY_PRODUCT(productId)
    );
    return res.data.data?.item ?? null;
  },

  async getNextBomCode(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ bomCode: string }>>(API_ENDPOINTS.BOMS.NEXT_CODE);
    return res.data.data!.bomCode;
  },

  async create(payload: BOMPayload): Promise<BOMRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: BOMRecord }>>(API_ENDPOINTS.BOMS.LIST, payload);
    return res.data.data!.item;
  },

  async update(id: string, payload: Partial<BOMPayload>): Promise<BOMRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: BOMRecord }>>(API_ENDPOINTS.BOMS.BY_ID(id), payload);
    return res.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.BOMS.BY_ID(id));
  },
};
