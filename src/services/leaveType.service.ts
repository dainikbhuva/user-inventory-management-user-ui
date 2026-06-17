import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalLeaveTypeRecord } from '../shared/types/leave.types';

export const leaveTypeService = {
  async getAll(): Promise<PortalLeaveTypeRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalLeaveTypeRecord[] }>>(
      API_ENDPOINTS.LEAVE_TYPES.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<PortalLeaveTypeRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalLeaveTypeRecord[] }>>(
      API_ENDPOINTS.LEAVE_TYPES.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async create(payload: {
    name: string;
    code: string;
    description?: string;
    maxDaysPerYear: number;
    status: 'active' | 'inactive';
    sortOrder: number;
  }): Promise<PortalLeaveTypeRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalLeaveTypeRecord }>>(
      API_ENDPOINTS.LEAVE_TYPES.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(
    id: string,
    payload: Partial<{
      name: string;
      code: string;
      description: string;
      maxDaysPerYear: number;
      status: 'active' | 'inactive';
      sortOrder: number;
    }>
  ): Promise<PortalLeaveTypeRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: PortalLeaveTypeRecord }>>(
      API_ENDPOINTS.LEAVE_TYPES.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.LEAVE_TYPES.BY_ID(id));
  },
};
