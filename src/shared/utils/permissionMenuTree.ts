import { SETTINGS_NAV_SECTIONS } from '../constants/settingsNav';
import type { MenuGroup, MenuItem } from '../types/menu.types';
import type { PermissionOption } from '../types/portal.types';
import { filterMenuGroupsForSidebar } from './sidebarMenu';

export interface PermissionTreeChild {
  key: string;
  label: string;
  moduleCode: string;
  itemCode?: string;
}

export interface PermissionTreeModule {
  moduleCode: string;
  label: string;
  linkType: 'direct' | 'dropdown';
  /** Permission key for direct modules */
  permissionKey: string;
  children?: PermissionTreeChild[];
}

export interface PermissionTreeGroup {
  id: string;
  name: string;
  sortOrder: number;
  modules: PermissionTreeModule[];
}

export const PERMISSION_TREE_ROOT_GROUP_ID = '__root__';

const SETTINGS_GROUP = 'settings';

const normalizeGroupKey = (name: string) => name.trim().toLowerCase();

const isSettingsGroup = (name: string) => normalizeGroupKey(name).includes(SETTINGS_GROUP);

const resolvePermissionKey = (
  options: PermissionOption[],
  moduleCode: string,
  itemCode?: string
): string => {
  const match = options.find((option) => {
    if (option.moduleCode !== moduleCode) return false;
    if (itemCode) {
      return option.itemCode === itemCode || option.key === `${moduleCode}/${itemCode}`;
    }
    return option.linkType === 'module-direct' || option.key === moduleCode;
  });

  if (match) return match.key;
  return itemCode ? `${moduleCode}/${itemCode}` : moduleCode;
};

const menuItemToModule = (item: MenuItem, options: PermissionOption[]): PermissionTreeModule => {
  if (item.linkType === 'dropdown' && item.children?.length) {
    const children = [...item.children]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((child) => ({
        key: resolvePermissionKey(options, item.code, child.code),
        label: child.name,
        moduleCode: item.code,
        itemCode: child.code,
      }));

    return {
      moduleCode: item.code,
      label: item.name,
      linkType: 'dropdown',
      permissionKey: item.code,
      children,
    };
  }

  return {
    moduleCode: item.code,
    label: item.name,
    linkType: 'direct',
    permissionKey: resolvePermissionKey(options, item.code),
  };
};

const collectKeys = (modules: PermissionTreeModule[]): Set<string> => {
  const keys = new Set<string>();
  for (const mod of modules) {
    if (mod.linkType === 'direct') {
      keys.add(mod.permissionKey);
    } else {
      mod.children?.forEach((child) => keys.add(child.key));
    }
  }
  return keys;
};

const settingsSortOrder = (() => {
  const order = new Map<string, number>();
  let index = 0;
  for (const section of SETTINGS_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.permission) {
        order.set(`${item.permission.moduleCode}/${item.permission.itemCode}`, index);
        order.set(item.permission.moduleCode, index);
      }
      index += 1;
    }
  }
  return order;
})();

const sortSettingsModules = (modules: PermissionTreeModule[]) =>
  [...modules].sort((a, b) => {
    const ao = settingsSortOrder.get(a.permissionKey) ?? settingsSortOrder.get(a.moduleCode) ?? 999;
    const bo = settingsSortOrder.get(b.permissionKey) ?? settingsSortOrder.get(b.moduleCode) ?? 999;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label);
  });

export const buildPermissionMenuTree = (
  options: PermissionOption[],
  menuGroups: MenuGroup[] = []
): PermissionTreeGroup[] => {
  const sidebarGroups = filterMenuGroupsForSidebar(menuGroups);
  const treeGroups: PermissionTreeGroup[] = [];
  const keysInTree = new Set<string>();

  const dashboardOption = options.find(
    (option) =>
      option.moduleCode === 'dashboard' ||
      option.key === 'dashboard' ||
      option.key === 'dashboard/dashboard'
  );
  const dashboardKey = dashboardOption?.key ?? 'dashboard/dashboard';

  treeGroups.push({
    id: PERMISSION_TREE_ROOT_GROUP_ID,
    name: '',
    sortOrder: -1,
    modules: [
      {
        moduleCode: 'dashboard',
        label: dashboardOption?.label ?? 'Dashboard',
        linkType: 'direct',
        permissionKey: dashboardKey,
      },
    ],
  });
  keysInTree.add(dashboardKey);

  for (const menuGroup of sidebarGroups) {
    const modules = menuGroup.modules.map((item) => menuItemToModule(item, options));
    for (const key of collectKeys(modules)) {
      keysInTree.add(key);
    }

    treeGroups.push({
      id: menuGroup.id,
      name: menuGroup.name,
      sortOrder: menuGroup.sortOrder,
      modules,
    });
  }

  const settingsModules: PermissionTreeModule[] = [];
  for (const option of options) {
    if (!isSettingsGroup(option.groupName) || option.linkType !== 'module-direct') continue;
    if (keysInTree.has(option.key)) continue;

    settingsModules.push({
      moduleCode: option.moduleCode,
      label: option.label,
      linkType: 'direct',
      permissionKey: option.key,
    });
    keysInTree.add(option.key);
  }

  if (settingsModules.length > 0) {
    treeGroups.push({
      id: 'settings',
      name: 'Settings',
      sortOrder: 9000,
      modules: sortSettingsModules(settingsModules),
    });
  }

  return treeGroups;
};

export const collectPermissionBasesFromTree = (tree: PermissionTreeGroup[]): string[] => {
  const bases: string[] = [];
  for (const group of tree) {
    for (const mod of group.modules) {
      if (mod.linkType === 'direct') {
        bases.push(mod.permissionKey);
      } else {
        mod.children?.forEach((child) => bases.push(child.key));
      }
    }
  }
  return bases;
};

export const flattenPermissionTree = (tree: PermissionTreeGroup[]): PermissionOption[] => {
  const rows: PermissionOption[] = [];
  for (const group of tree) {
    for (const mod of group.modules) {
      if (mod.linkType === 'direct') {
        rows.push({
          key: mod.permissionKey,
          label: mod.label,
          moduleCode: mod.moduleCode,
          moduleName: mod.label,
          groupName: group.name || 'Dashboard',
          linkType: 'module-direct',
          itemCode: mod.permissionKey.includes('/') ? mod.permissionKey.split('/')[1] : undefined,
        });
      } else if (mod.children?.length) {
        for (const child of mod.children) {
          rows.push({
            key: child.key,
            label: child.label,
            moduleCode: child.moduleCode,
            moduleName: mod.label,
            itemCode: child.itemCode,
            groupName: group.name,
            linkType: 'dropdown-item',
          });
        }
      }
    }
  }
  return rows;
};
