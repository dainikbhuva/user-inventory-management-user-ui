import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type {
  CreateLeaveRequestPayload,
  PortalLeaveBalanceRecord,
  PortalLeaveListMeta,
  PortalLeaveRequestRecord,
  ReviewLeaveRequestPayload,
  UpdateLeaveRequestPayload,
} from '../shared/types/leave.types';

export const leaveService = {
  async getAll(): Promise<{ items: PortalLeaveRequestRecord[]; meta: PortalLeaveListMeta }> {
    const response = await axiosClient.get<
      ApiResponse<{ items: PortalLeaveRequestRecord[]; meta: PortalLeaveListMeta }>
    >(API_ENDPOINTS.LEAVE.LIST);
    return {
      items: response.data.data?.items ?? [],
      meta: response.data.data?.meta ?? { isApprover: false, pendingApprovalCount: 0 },
    };
  },

  async create(payload: CreateLeaveRequestPayload): Promise<PortalLeaveRequestRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalLeaveRequestRecord }>>(
      API_ENDPOINTS.LEAVE.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(id: string, payload: UpdateLeaveRequestPayload): Promise<PortalLeaveRequestRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: PortalLeaveRequestRecord }>>(
      API_ENDPOINTS.LEAVE.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async review(id: string, payload: ReviewLeaveRequestPayload): Promise<PortalLeaveRequestRecord> {
    const response = await axiosClient.patch<ApiResponse<{ item: PortalLeaveRequestRecord }>>(
      API_ENDPOINTS.LEAVE.REVIEW(id),
      payload
    );
    return response.data.data!.item;
  },

  async cancel(id: string): Promise<PortalLeaveRequestRecord> {
    const response = await axiosClient.patch<ApiResponse<{ item: PortalLeaveRequestRecord }>>(
      API_ENDPOINTS.LEAVE.CANCEL(id)
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.LEAVE.BY_ID(id));
  },

  async getBalances(): Promise<PortalLeaveBalanceRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalLeaveBalanceRecord[] }>>(
      API_ENDPOINTS.LEAVE.BALANCES
    );
    return response.data.data?.items ?? [];
  },
};
