import { apiService } from './api';
import type { MenuData } from '../shared/types/menu.types';

const MENU_CACHE_MS = 5 * 60 * 1000;

let cachedMenu: MenuData | null = null;
let cachedAt = 0;
let inflightMenu: Promise<MenuData> | null = null;

export const menuService = {
  async getMenu(options?: { force?: boolean }): Promise<MenuData> {
    const now = Date.now();
    if (!options?.force && cachedMenu && now - cachedAt < MENU_CACHE_MS) {
      return cachedMenu;
    }

    if (inflightMenu) {
      return inflightMenu;
    }

    inflightMenu = apiService
      .getMenu()
      .then((response) => {
        cachedMenu = response.data;
        cachedAt = Date.now();
        inflightMenu = null;
        return response.data;
      })
      .catch((error) => {
        inflightMenu = null;
        throw error;
      });

    return inflightMenu;
  },

  isStale(maxAgeMs = MENU_CACHE_MS): boolean {
    return !cachedMenu || Date.now() - cachedAt >= maxAgeMs;
  },

  clearCache() {
    cachedMenu = null;
    cachedAt = 0;
    inflightMenu = null;
  },
};
