import { createExtendedMasterPage } from '../masters/createExtendedMasterPage';
import { WarehouseForm, type WarehouseFormData } from '../masters/WarehouseForm';
import { inventoryWarehouseService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { InventoryWarehouseRecord } from '../../../shared/types/inventoryMaster.types';

const toPayload = (data: WarehouseFormData) => ({
  name: data.name.trim(),
  code: data.code.trim(),
  description: data.description.trim() || undefined,
  address: data.address.trim() || undefined,
  status: data.status,
  sortOrder: Number(data.sortOrder || 0),
});

const warehouseConfig = {
  title: 'Warehouses / Locations',
  subtitle: 'Manage storage locations and warehouses for inventory.',
  addLabel: 'Add Warehouse',
  entityLabel: 'Warehouse',
  permission: PORTAL_PERMISSION_MODULES.inventoryWarehouses,
  loadItems: () => inventoryWarehouseService.getAll(),
  createItem: (payload: ReturnType<typeof toPayload>) => inventoryWarehouseService.create(payload),
  updateItem: (id: string, payload: ReturnType<typeof toPayload>) =>
    inventoryWarehouseService.update(id, payload),
  deleteItem: (id: string) => inventoryWarehouseService.delete(id),
  FormComponent: WarehouseForm,
  toFormValue: (item: InventoryWarehouseRecord): WarehouseFormData => ({
    name: item.name,
    code: item.code,
    description: item.description ?? '',
    address: item.address ?? '',
    status: item.status,
    sortOrder: String(item.sortOrder ?? 0),
  }),
  toCreatePayload: toPayload,
  toUpdatePayload: toPayload,
  searchFields: [
    (item: InventoryWarehouseRecord) => item.name,
    (item: InventoryWarehouseRecord) => item.code,
    (item: InventoryWarehouseRecord) => item.description,
    (item: InventoryWarehouseRecord) => item.address,
  ],
  extraColumns: [
    {
      header: 'Address',
      width: '22%',
      render: (row: InventoryWarehouseRecord) => (
        <span className="text-sm text-muted">{row.address || '—'}</span>
      ),
    },
    {
      header: 'Sort',
      width: '7%',
      sortable: true,
      sortKey: 'sortOrder',
      align: 'center' as const,
      render: (row: InventoryWarehouseRecord) => (
        <span className="tabular-nums text-sm text-muted">{row.sortOrder}</span>
      ),
    },
  ],
  exportExtraColumns: [
    { header: 'Address', getValue: (row) => row.address ?? '' },
    { header: 'Sort', getValue: (row) => row.sortOrder ?? 0 },
  ],
};

export const InventoryWarehousesPage = createExtendedMasterPage(warehouseConfig);
export const InventoryWarehousesSettingsPanel = createExtendedMasterPage({
  ...warehouseConfig,
  embedded: true,
});
