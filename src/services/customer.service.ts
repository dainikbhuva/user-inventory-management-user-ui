import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { CustomerRecord } from '../shared/types/trading.types';

export interface CustomerPayload {
  customerCode?: string;
  autoGenerateCustomerCode?: boolean;
  customerName: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  creditLimit?: number;
  paymentTerms?: string;
  status?: 'active' | 'inactive';
}

export const customerService = {
  async getAll(): Promise<CustomerRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: CustomerRecord[] }>>(
      API_ENDPOINTS.CUSTOMERS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<CustomerRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: CustomerRecord[] }>>(
      API_ENDPOINTS.CUSTOMERS.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async getById(id: string): Promise<CustomerRecord> {
    const response = await axiosClient.get<ApiResponse<{ item: CustomerRecord }>>(
      API_ENDPOINTS.CUSTOMERS.BY_ID(id)
    );
    return response.data.data!.item;
  },

  async getNextCustomerCode(): Promise<string> {
    const response = await axiosClient.get<ApiResponse<{ customerCode: string }>>(
      API_ENDPOINTS.CUSTOMERS.NEXT_CODE
    );
    return response.data.data!.customerCode;
  },

  async create(payload: CustomerPayload): Promise<CustomerRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: CustomerRecord }>>(
      API_ENDPOINTS.CUSTOMERS.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(id: string, payload: Partial<CustomerPayload>): Promise<CustomerRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: CustomerRecord }>>(
      API_ENDPOINTS.CUSTOMERS.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.CUSTOMERS.BY_ID(id));
  },
};
