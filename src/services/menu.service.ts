import { apiService } from './api';
import type { MenuData } from '../shared/types/menu.types';

let inflightMenu: Promise<MenuData> | null = null;

export const menuService = {
  async getMenu(): Promise<MenuData> {
    if (inflightMenu) {
      return inflightMenu;
    }

    inflightMenu = apiService
      .getMenu()
      .then((response) => {
        inflightMenu = null;
        return response.data;
      })
      .catch((error) => {
        inflightMenu = null;
        throw error;
      });

    return inflightMenu;
  },

  clearCache() {
    inflightMenu = null;
  },
};
