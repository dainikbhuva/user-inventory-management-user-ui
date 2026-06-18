import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { menuService } from '../../services/menu.service';
import type { MenuGroup, MenuMeta } from '../types/menu.types';
import { useAuth } from '../auth/useAuth';
import { sortMenuGroups } from '../utils/sortMenu';

const emptyMeta: MenuMeta = {
  planId: '',
  planName: '',
  includedModuleGroups: [],
};

export interface MenuContextValue {
  groups: MenuGroup[];
  meta: MenuMeta;
  isLoading: boolean;
  error: string;
  reload: (force?: boolean) => Promise<void>;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [meta, setMeta] = useState<MenuMeta>(emptyMeta);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMenu = useCallback(async (force = false) => {
    if (!isAuthenticated) {
      menuService.clearCache();
      setGroups([]);
      setMeta(emptyMeta);
      setError('');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const menu = await menuService.getMenu({ force });
      setGroups(sortMenuGroups(menu.groups));
      setMeta(menu.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
      setGroups([]);
      setMeta(emptyMeta);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    const handleFocus = () => {
      // Refresh only when cache is stale — avoid hammering /app/menu on every tab click
      if (menuService.isStale(2 * 60 * 1000)) {
        void loadMenu();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadMenu]);

  const value = useMemo(
    () => ({ groups, meta, isLoading, error, reload: loadMenu }),
    [groups, meta, isLoading, error, loadMenu]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenuContext = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};
