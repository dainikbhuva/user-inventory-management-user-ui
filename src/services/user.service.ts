import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type {
  CreatePortalUserPayload,
  CreatePortalUserResult,
  PortalUserRecord,
  UpdatePortalUserPayload,
} from '../shared/types/portal.types';

export const portalUserService = {
  async getUsers(): Promise<PortalUserRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalUserRecord[] }>>(
      API_ENDPOINTS.USERS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getUser(id: string): Promise<PortalUserRecord> {
    const response = await axiosClient.get<ApiResponse<{ user: PortalUserRecord }>>(
      API_ENDPOINTS.USERS.BY_ID(id)
    );
    return response.data.data!.user;
  },

  async getNextEmployeeCode(): Promise<string> {
    const response = await axiosClient.get<ApiResponse<{ employeeCode: string }>>(
      API_ENDPOINTS.USERS.NEXT_EMPLOYEE_CODE
    );
    return response.data.data!.employeeCode;
  },

  async createUser(payload: CreatePortalUserPayload): Promise<CreatePortalUserResult> {
    const response = await axiosClient.post<
      ApiResponse<{ user: PortalUserRecord; emailSent: boolean; emailWarning?: string }>
    >(API_ENDPOINTS.USERS.LIST, payload);
    const data = response.data.data!;
    return {
      user: data.user,
      emailSent: data.emailSent ?? false,
      ...(data.emailWarning ? { emailWarning: data.emailWarning } : {}),
    };
  },

  async updateUser(id: string, payload: UpdatePortalUserPayload): Promise<PortalUserRecord> {
    const response = await axiosClient.put<ApiResponse<{ user: PortalUserRecord }>>(
      API_ENDPOINTS.USERS.BY_ID(id),
      payload
    );
    return response.data.data!.user;
  },

  async deleteUser(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },
};
