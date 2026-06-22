import { createMasterPage } from '../masters/createMasterPage';
import { inventoryBrandService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const brandConfig = {
  title: 'Brands',
  subtitle: 'Manage product brands for your inventory catalog.',
  addLabel: 'Add Brand',
  entityLabel: 'Brand',
  permission: PORTAL_PERMISSION_MODULES.inventoryBrands,
  loadItems: () => inventoryBrandService.getAll(),
  createItem: (payload: Parameters<typeof inventoryBrandService.create>[0]) =>
    inventoryBrandService.create(payload),
  updateItem: (id: string, payload: Parameters<typeof inventoryBrandService.update>[1]) =>
    inventoryBrandService.update(id, payload),
  deleteItem: (id: string) => inventoryBrandService.delete(id),
};

export const InventoryBrandsPage = createMasterPage(brandConfig);
export const InventoryBrandsSettingsPanel = createMasterPage({ ...brandConfig, embedded: true });
