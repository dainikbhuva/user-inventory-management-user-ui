import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalMasterRecord } from '../shared/types/portal.types';

const createMasterService = (endpoints: {
  LIST: string;
  ACTIVE: string;
  BY_ID: (id: string) => string;
}) => ({
  async getAll(): Promise<PortalMasterRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalMasterRecord[] }>>(
      endpoints.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<PortalMasterRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalMasterRecord[] }>>(
      endpoints.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async create(payload: {
    name: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive';
    sortOrder: number;
  }): Promise<PortalMasterRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalMasterRecord }>>(
      endpoints.LIST,
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
      status: 'active' | 'inactive';
      sortOrder: number;
    }>
  ): Promise<PortalMasterRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: PortalMasterRecord }>>(
      endpoints.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(endpoints.BY_ID(id));
  },
});

export const departmentService = createMasterService(API_ENDPOINTS.DEPARTMENTS);
export const designationService = createMasterService(API_ENDPOINTS.DESIGNATIONS);
