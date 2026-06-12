export interface MenuChild {
  id: string;
  name: string;
  code: string;
  path: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  linkType: 'direct' | 'dropdown';
  path: string;
  sortOrder: number;
  children?: MenuChild[];
}

export interface MenuGroup {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  modules: MenuItem[];
}

export interface MenuMeta {
  planId: string;
  planName: string;
  includedModuleGroups: Array<{ id: string; name: string; code: string }>;
}

export interface MenuData {
  groups: MenuGroup[];
  meta: MenuMeta;
}
