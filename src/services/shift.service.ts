import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalShiftRecord } from '../shared/types/shift.types';

export const shiftService = {
  async getAll(): Promise<PortalShiftRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalShiftRecord[] }>>(
      API_ENDPOINTS.SHIFTS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<PortalShiftRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalShiftRecord[] }>>(
      API_ENDPOINTS.SHIFTS.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async create(payload: {
    name: string;
    code: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    lateAfterMinutes: number;
    halfDayHours: number;
    description?: string;
    status: 'active' | 'inactive';
    sortOrder: number;
  }): Promise<PortalShiftRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalShiftRecord }>>(
      API_ENDPOINTS.SHIFTS.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(
    id: string,
    payload: Partial<{
      name: string;
      code: string;
      startTime: string;
      endTime: string;
      breakMinutes: number;
      lateAfterMinutes: number;
      halfDayHours: number;
      description: string;
      status: 'active' | 'inactive';
      sortOrder: number;
    }>
  ): Promise<PortalShiftRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: PortalShiftRecord }>>(
      API_ENDPOINTS.SHIFTS.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.SHIFTS.BY_ID(id));
  },
};
