import { createMasterPage } from '../masters/createMasterPage';
import { inventoryCategoryService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const categoryConfig = {
  title: 'Categories',
  subtitle: 'Manage product categories for your inventory.',
  addLabel: 'Add Category',
  entityLabel: 'Category',
  permission: PORTAL_PERMISSION_MODULES.inventoryCategories,
  loadItems: () => inventoryCategoryService.getAll(),
  createItem: (payload: Parameters<typeof inventoryCategoryService.create>[0]) =>
    inventoryCategoryService.create(payload),
  updateItem: (id: string, payload: Parameters<typeof inventoryCategoryService.update>[1]) =>
    inventoryCategoryService.update(id, payload),
  deleteItem: (id: string) => inventoryCategoryService.delete(id),
};

export const InventoryCategoriesPage = createMasterPage(categoryConfig);
export const InventoryCategoriesSettingsPanel = createMasterPage({ ...categoryConfig, embedded: true });
