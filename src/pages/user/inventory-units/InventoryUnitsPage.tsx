import { createMasterPage } from '../masters/createMasterPage';
import { inventoryUnitService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const unitConfig = {
  title: 'Units',
  subtitle: 'Manage measurement units used for inventory items (e.g. pcs, kg, box).',
  addLabel: 'Add Unit',
  entityLabel: 'Unit',
  permission: PORTAL_PERMISSION_MODULES.inventoryUnits,
  loadItems: () => inventoryUnitService.getAll(),
  createItem: (payload: Parameters<typeof inventoryUnitService.create>[0]) =>
    inventoryUnitService.create(payload),
  updateItem: (id: string, payload: Parameters<typeof inventoryUnitService.update>[1]) =>
    inventoryUnitService.update(id, payload),
  deleteItem: (id: string) => inventoryUnitService.delete(id),
};

export const InventoryUnitsPage = createMasterPage(unitConfig);
export const InventoryUnitsSettingsPanel = createMasterPage({ ...unitConfig, embedded: true });
