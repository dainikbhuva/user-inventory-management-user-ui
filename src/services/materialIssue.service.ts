import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { MaterialIssueRecord } from '../shared/types/manufacturing.types';

export interface MaterialIssueLinePayload {
  productId: string;
  requiredQty: number;
  issuedQty: number;
  notes?: string;
}

export interface MaterialIssuePayload {
  issueDate: string;
  workOrderId: string;
  warehouseId: string;
  notes?: string;
  lines: MaterialIssueLinePayload[];
}

export const materialIssueService = {
  async getAll(): Promise<MaterialIssueRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: MaterialIssueRecord[] }>>(API_ENDPOINTS.MATERIAL_ISSUES.LIST);
    return res.data.data?.items ?? [];
  },

  async getById(id: string): Promise<MaterialIssueRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: MaterialIssueRecord }>>(API_ENDPOINTS.MATERIAL_ISSUES.BY_ID(id));
    return res.data.data!.item;
  },

  async getNextIssueNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ issueNumber: string }>>(API_ENDPOINTS.MATERIAL_ISSUES.NEXT_NUMBER);
    return res.data.data!.issueNumber;
  },

  async create(payload: MaterialIssuePayload): Promise<MaterialIssueRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: MaterialIssueRecord }>>(API_ENDPOINTS.MATERIAL_ISSUES.LIST, payload);
    return res.data.data!.item;
  },

  async update(id: string, payload: Partial<MaterialIssuePayload>): Promise<MaterialIssueRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: MaterialIssueRecord }>>(API_ENDPOINTS.MATERIAL_ISSUES.BY_ID(id), payload);
    return res.data.data!.item;
  },

  async issue(id: string): Promise<MaterialIssueRecord> {
    const res = await axiosClient.patch<ApiResponse<{ item: MaterialIssueRecord }>>(API_ENDPOINTS.MATERIAL_ISSUES.ISSUE(id));
    return res.data.data!.item;
  },

  async cancel(id: string): Promise<MaterialIssueRecord> {
    const res = await axiosClient.patch<ApiResponse<{ item: MaterialIssueRecord }>>(API_ENDPOINTS.MATERIAL_ISSUES.CANCEL(id));
    return res.data.data!.item;
  },
};
