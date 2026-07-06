import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { InventoryProductRecord } from '../shared/types/inventoryProduct.types';

export type ProductPayload = {
  productCode?: string;
  autoGenerateProductCode?: boolean;
  productName: string;
  description?: string;
  categoryId: string;
  unitId: string;
  brandId?: string;
  taxId?: string;
  defaultWarehouseId?: string;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  barcode?: string;
  productType?: ProductType;
  status?: 'active' | 'inactive';
};

export const inventoryProductService = {
  async getAll(): Promise<InventoryProductRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: InventoryProductRecord[] }>>(
      API_ENDPOINTS.PRODUCTS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<InventoryProductRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: InventoryProductRecord[] }>>(
      API_ENDPOINTS.PRODUCTS.ACTIVE
    );
    return response.data.data?.items ?? [];
  },

  async getById(id: string): Promise<InventoryProductRecord> {
    const response = await axiosClient.get<ApiResponse<{ item: InventoryProductRecord }>>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id)
    );
    return response.data.data!.item;
  },

  async getNextProductCode(): Promise<string> {
    const response = await axiosClient.get<ApiResponse<{ productCode: string }>>(
      API_ENDPOINTS.PRODUCTS.NEXT_CODE
    );
    return response.data.data!.productCode;
  },

  async create(payload: ProductPayload): Promise<InventoryProductRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: InventoryProductRecord }>>(
      API_ENDPOINTS.PRODUCTS.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(id: string, payload: Partial<ProductPayload>): Promise<InventoryProductRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: InventoryProductRecord }>>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },
};
