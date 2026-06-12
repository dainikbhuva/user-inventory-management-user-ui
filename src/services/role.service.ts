import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalRole } from '../shared/types/portal.types';

export const roleService = {
  async getRoles(): Promise<PortalRole[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalRole[] }>>(
      API_ENDPOINTS.ROLES.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActiveRoles(): Promise<PortalRole[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalRole[] }>>(
      API_ENDPOINTS.ROLES.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async createRole(payload: {
    name: string;
    code: string;
    status: 'active' | 'inactive';
  }): Promise<PortalRole> {
    const response = await axiosClient.post<ApiResponse<{ role: PortalRole }>>(
      API_ENDPOINTS.ROLES.LIST,
      payload
    );
    return response.data.data!.role;
  },

  async updateRole(
    id: string,
    payload: Partial<{ name: string; code: string; status: 'active' | 'inactive' }>
  ): Promise<PortalRole> {
    const response = await axiosClient.put<ApiResponse<{ role: PortalRole }>>(
      API_ENDPOINTS.ROLES.BY_ID(id),
      payload
    );
    return response.data.data!.role;
  },

  async deleteRole(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.ROLES.BY_ID(id));
  },
};
