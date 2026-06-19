import { SETTINGS_SIDEBAR_HIDDEN_CODES } from '../constants/settingsNav';
import type { MenuGroup, MenuItem } from '../types/menu.types';

const isHiddenCode = (code: string) => SETTINGS_SIDEBAR_HIDDEN_CODES.has(code.toLowerCase());

const filterModule = (item: MenuItem): MenuItem | null => {
  if (isHiddenCode(item.code)) {
    return null;
  }

  if (item.linkType === 'dropdown' && item.children?.length) {
    const children = item.children.filter((child) => !isHiddenCode(child.code));
    if (children.length === 0) {
      return null;
    }
    return { ...item, children };
  }

  return item;
};

export const filterMenuGroupsForSidebar = (groups: MenuGroup[]): MenuGroup[] =>
  groups
    .map((group) => {
      if (isHiddenCode(group.code)) {
        return null;
      }
      const modules = group.modules
        .map(filterModule)
        .filter((item): item is MenuItem => item !== null);
      if (modules.length === 0) {
        return null;
      }
      return { ...group, modules };
    })
    .filter((group): group is MenuGroup => group !== null);
