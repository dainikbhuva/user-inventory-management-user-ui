import { createMasterPage } from '../masters/createMasterPage';
import { designationService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const designationConfig = {
  title: 'Designations',
  subtitle: 'Manage job designations linked to employee profiles.',
  addLabel: 'Add Designation',
  entityLabel: 'Designation',
  permission: PORTAL_PERMISSION_MODULES.designations,
  loadItems: () => designationService.getAll(),
  createItem: (payload: Parameters<typeof designationService.create>[0]) => designationService.create(payload),
  updateItem: (id: string, payload: Parameters<typeof designationService.update>[1]) =>
    designationService.update(id, payload),
  deleteItem: (id: string) => designationService.delete(id),
};

export const DesignationsPage = createMasterPage(designationConfig);
export const DesignationsSettingsPanel = createMasterPage({ ...designationConfig, embedded: true });
