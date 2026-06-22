import type { PortalMasterRecord } from './portal.types';

export interface InventoryWarehouseRecord extends PortalMasterRecord {
  address?: string;
}

export interface InventorySupplierRecord {
  id: string;
  supplierCode: string;
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
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierFormValues {
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  alternateMobile: string;
  gstNumber: string;
  panNumber: string;
  website: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  status: 'active' | 'inactive';
}

export interface InventoryTaxRecord extends PortalMasterRecord {
  hsnCode: string;
  taxRate: number;
}
