import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PermissionOption } from '../shared/types/portal.types';

export const permissionService = {
  async getOptions(): Promise<PermissionOption[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PermissionOption[] }>>(
      API_ENDPOINTS.PERMISSIONS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getRolePermissions(roleId: string): Promise<string[]> {
    const response = await axiosClient.get<ApiResponse<{ roleId: string; permissions: string[] }>>(
      API_ENDPOINTS.PERMISSIONS.ROLE(roleId)
    );
    return response.data.data?.permissions ?? [];
  },

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<string[]> {
    const response = await axiosClient.put<ApiResponse<{ permissions: string[] }>>(
      API_ENDPOINTS.PERMISSIONS.ROLE(roleId),
      { permissions }
    );
    return response.data.data?.permissions ?? [];
  },
};
