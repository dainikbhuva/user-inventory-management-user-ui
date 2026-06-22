import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { WorkOrderRecord } from '../shared/types/manufacturing.types';

export interface WorkOrderPayload {
  workOrderDate: string;
  bomId: string;
  warehouseId: string;
  plannedQty: number;
  scheduledDate?: string;
  notes?: string;
}

export const workOrderService = {
  async getAll(): Promise<WorkOrderRecord[]> {
    const res = await axiosClient.get<ApiResponse<{ items: WorkOrderRecord[] }>>(API_ENDPOINTS.WORK_ORDERS.LIST);
    return res.data.data?.items ?? [];
  },

  async getById(id: string): Promise<WorkOrderRecord> {
    const res = await axiosClient.get<ApiResponse<{ item: WorkOrderRecord }>>(API_ENDPOINTS.WORK_ORDERS.BY_ID(id));
    return res.data.data!.item;
  },

  async getNextWorkOrderNumber(): Promise<string> {
    const res = await axiosClient.get<ApiResponse<{ workOrderNumber: string }>>(API_ENDPOINTS.WORK_ORDERS.NEXT_NUMBER);
    return res.data.data!.workOrderNumber;
  },

  async create(payload: WorkOrderPayload): Promise<WorkOrderRecord> {
    const res = await axiosClient.post<ApiResponse<{ item: WorkOrderRecord }>>(API_ENDPOINTS.WORK_ORDERS.LIST, payload);
    return res.data.data!.item;
  },

  async update(id: string, payload: Partial<WorkOrderPayload>): Promise<WorkOrderRecord> {
    const res = await axiosClient.put<ApiResponse<{ item: WorkOrderRecord }>>(API_ENDPOINTS.WORK_ORDERS.BY_ID(id), payload);
    return res.data.data!.item;
  },

  async start(id: string): Promise<WorkOrderRecord> {
    const res = await axiosClient.patch<ApiResponse<{ item: WorkOrderRecord }>>(API_ENDPOINTS.WORK_ORDERS.START(id));
    return res.data.data!.item;
  },

  async cancel(id: string): Promise<WorkOrderRecord> {
    const res = await axiosClient.patch<ApiResponse<{ item: WorkOrderRecord }>>(API_ENDPOINTS.WORK_ORDERS.CANCEL(id));
    return res.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.WORK_ORDERS.BY_ID(id));
  },
};
