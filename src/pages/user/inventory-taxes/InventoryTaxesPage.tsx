import { createExtendedMasterPage } from '../masters/createExtendedMasterPage';
import { TaxForm, type TaxFormData } from '../masters/TaxForm';
import { inventoryTaxService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import type { InventoryTaxRecord } from '../../../shared/types/inventoryMaster.types';

const toPayload = (data: TaxFormData) => ({
  name: data.name.trim(),
  code: data.code.trim(),
  description: data.description.trim() || undefined,
  hsnCode: data.hsnCode.trim(),
  taxRate: Number(data.taxRate),
  status: data.status,
  sortOrder: Number(data.sortOrder || 0),
});

const taxConfig = {
  title: 'Tax / HSN',
  subtitle: 'Manage HSN codes and tax rates for inventory items.',
  addLabel: 'Add Tax / HSN',
  entityLabel: 'Tax',
  permission: PORTAL_PERMISSION_MODULES.inventoryTaxes,
  loadItems: () => inventoryTaxService.getAll(),
  createItem: (payload: ReturnType<typeof toPayload>) => inventoryTaxService.create(payload),
  updateItem: (id: string, payload: ReturnType<typeof toPayload>) =>
    inventoryTaxService.update(id, payload),
  deleteItem: (id: string) => inventoryTaxService.delete(id),
  FormComponent: TaxForm,
  toFormValue: (item: InventoryTaxRecord): TaxFormData => ({
    name: item.name,
    code: item.code,
    description: item.description ?? '',
    hsnCode: item.hsnCode,
    taxRate: String(item.taxRate),
    status: item.status,
    sortOrder: String(item.sortOrder ?? 0),
  }),
  toCreatePayload: toPayload,
  toUpdatePayload: toPayload,
  searchFields: [
    (item: InventoryTaxRecord) => item.name,
    (item: InventoryTaxRecord) => item.code,
    (item: InventoryTaxRecord) => item.hsnCode,
    (item: InventoryTaxRecord) => item.description,
  ],
  extraColumns: [
    {
      header: 'HSN',
      width: '10%',
      render: (row: InventoryTaxRecord) => (
        <span className="font-mono text-sm text-body">{row.hsnCode}</span>
      ),
    },
    {
      header: 'Rate %',
      width: '9%',
      align: 'center' as const,
      render: (row: InventoryTaxRecord) => (
        <span className="tabular-nums text-sm font-medium text-body">{row.taxRate}%</span>
      ),
    },
    {
      header: 'Sort',
      width: '7%',
      sortable: true,
      sortKey: 'sortOrder',
      align: 'center' as const,
      render: (row: InventoryTaxRecord) => (
        <span className="tabular-nums text-sm text-muted">{row.sortOrder}</span>
      ),
    },
  ],
  exportExtraColumns: [
    { header: 'HSN', getValue: (row: InventoryTaxRecord) => row.hsnCode },
    { header: 'Rate %', getValue: (row: InventoryTaxRecord) => row.taxRate },
    { header: 'Sort', getValue: (row: InventoryTaxRecord) => row.sortOrder ?? 0 },
  ],
};

export const InventoryTaxesPage = createExtendedMasterPage(taxConfig);
export const InventoryTaxesSettingsPanel = createExtendedMasterPage({
  ...taxConfig,
  embedded: true,
});
