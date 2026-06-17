import { createMasterPage } from '../masters/createMasterPage';
import { departmentService } from '../../../services/master.service';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const departmentConfig = {
  title: 'Departments',
  subtitle: 'Manage company departments used in employee profiles.',
  addLabel: 'Add Department',
  entityLabel: 'Department',
  permission: PORTAL_PERMISSION_MODULES.departments,
  loadItems: () => departmentService.getAll(),
  createItem: (payload: Parameters<typeof departmentService.create>[0]) => departmentService.create(payload),
  updateItem: (id: string, payload: Parameters<typeof departmentService.update>[1]) =>
    departmentService.update(id, payload),
  deleteItem: (id: string) => departmentService.delete(id),
};

export const DepartmentsPage = createMasterPage(departmentConfig);
export const DepartmentsSettingsPanel = createMasterPage({ ...departmentConfig, embedded: true });
