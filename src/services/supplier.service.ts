import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { InventorySupplierRecord } from '../shared/types/inventoryMaster.types';

export type SupplierPayload = {
  supplierCode?: string;
  autoGenerateSupplierCode?: boolean;
  supplierName: string;
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
  status?: 'active' | 'inactive';
};

export const inventorySupplierService = {
  async getAll(): Promise<InventorySupplierRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: InventorySupplierRecord[] }>>(
      API_ENDPOINTS.INVENTORY_SUPPLIERS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<InventorySupplierRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: InventorySupplierRecord[] }>>(
      API_ENDPOINTS.INVENTORY_SUPPLIERS.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async getById(id: string): Promise<InventorySupplierRecord> {
    const response = await axiosClient.get<ApiResponse<{ item: InventorySupplierRecord }>>(
      API_ENDPOINTS.INVENTORY_SUPPLIERS.BY_ID(id)
    );
    return response.data.data!.item;
  },

  async getNextSupplierCode(): Promise<string> {
    const response = await axiosClient.get<ApiResponse<{ supplierCode: string }>>(
      API_ENDPOINTS.INVENTORY_SUPPLIERS.NEXT_CODE
    );
    return response.data.data!.supplierCode;
  },

  async create(payload: SupplierPayload): Promise<InventorySupplierRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: InventorySupplierRecord }>>(
      API_ENDPOINTS.INVENTORY_SUPPLIERS.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(id: string, payload: Partial<SupplierPayload>): Promise<InventorySupplierRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: InventorySupplierRecord }>>(
      API_ENDPOINTS.INVENTORY_SUPPLIERS.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.INVENTORY_SUPPLIERS.BY_ID(id));
  },
};
