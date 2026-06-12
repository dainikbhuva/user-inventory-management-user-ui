import type { MenuChild, MenuGroup, MenuItem } from '../types/menu.types';

const bySortOrder = <T extends { sortOrder: number; name: string }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);

const sortChildren = (children?: MenuChild[]) =>
  children ? [...children].sort(bySortOrder) : undefined;

const sortModules = (modules: MenuItem[]) =>
  [...modules]
    .sort(bySortOrder)
    .map((module) => ({
      ...module,
      children: sortChildren(module.children),
    }));

export const sortMenuGroups = (groups: MenuGroup[]): MenuGroup[] =>
  [...groups]
    .sort(bySortOrder)
    .map((group) => ({
      ...group,
      modules: sortModules(group.modules),
    }));
