import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalMasterRecord } from '../shared/types/portal.types';
import type {
  InventoryWarehouseRecord,
  InventoryTaxRecord,
} from '../shared/types/inventoryMaster.types';

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
export const inventoryCategoryService = createMasterService(API_ENDPOINTS.INVENTORY_CATEGORIES);
export const inventoryUnitService = createMasterService(API_ENDPOINTS.INVENTORY_UNITS);
export const inventoryBrandService = createMasterService(API_ENDPOINTS.INVENTORY_BRANDS);

const createExtendedMasterService = <TRecord extends PortalMasterRecord, TCreate, TUpdate>(
  endpoints: {
    LIST: string;
    ACTIVE: string;
    BY_ID: (id: string) => string;
  }
) => ({
  async getAll(): Promise<TRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: TRecord[] }>>(endpoints.LIST);
    return response.data.data?.items ?? [];
  },

  async getActive(): Promise<TRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: TRecord[] }>>(endpoints.ACTIVE);
    return response.data.data?.items ?? [];
  },

  async create(payload: TCreate): Promise<TRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: TRecord }>>(
      endpoints.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(id: string, payload: TUpdate): Promise<TRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: TRecord }>>(
      endpoints.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(endpoints.BY_ID(id));
  },
});

type MasterPayload = {
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
};

export const inventoryWarehouseService = createExtendedMasterService<
  InventoryWarehouseRecord,
  MasterPayload & { address?: string },
  Partial<MasterPayload & { address?: string }>
>(API_ENDPOINTS.INVENTORY_WAREHOUSES);

export const inventoryTaxService = createExtendedMasterService<
  InventoryTaxRecord,
  MasterPayload & { hsnCode: string; taxRate: number },
  Partial<MasterPayload & { hsnCode?: string; taxRate?: number }>
>(API_ENDPOINTS.INVENTORY_TAXES);

