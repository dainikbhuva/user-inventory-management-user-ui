import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalHolidayRecord } from '../shared/types/holiday.types';
import type { HolidayType } from '../shared/constants/holidayType';

export const holidayService = {
  async getAll(year?: number): Promise<PortalHolidayRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalHolidayRecord[] }>>(
      API_ENDPOINTS.HOLIDAYS.LIST,
      { params: year ? { year } : undefined }
    );
    return response.data.data?.items ?? [];
  },

  async getActive(year?: number): Promise<PortalHolidayRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalHolidayRecord[] }>>(
      API_ENDPOINTS.HOLIDAYS.ACTIVE,
      { params: year ? { year } : undefined }
    );
    return response.data.data?.items ?? [];
  },

  async create(payload: {
    name: string;
    date: string;
    holidayType: HolidayType;
    isRecurring: boolean;
    description?: string;
    status: 'active' | 'inactive';
  }): Promise<PortalHolidayRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalHolidayRecord }>>(
      API_ENDPOINTS.HOLIDAYS.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(
    id: string,
    payload: Partial<{
      name: string;
      date: string;
      holidayType: HolidayType;
      isRecurring: boolean;
      description: string;
      status: 'active' | 'inactive';
    }>
  ): Promise<PortalHolidayRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: PortalHolidayRecord }>>(
      API_ENDPOINTS.HOLIDAYS.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.HOLIDAYS.BY_ID(id));
  },
};
