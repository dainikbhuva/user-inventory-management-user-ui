import { apiService } from './api';
import type { MenuData } from '../shared/types/menu.types';

export const menuService = {
  async getMenu(): Promise<MenuData> {
    const response = await apiService.getMenu();
    return response.data;
  },
};
