import { useCallback, useEffect, useState } from 'react';
import { menuService } from '../services/menu.service';
import type { MenuGroup, MenuMeta } from '../shared/types/menu.types';
import { useAuth } from '../shared/auth/useAuth';
import { sortMenuGroups } from '../shared/utils/sortMenu';

const emptyMeta: MenuMeta = {
  planId: '',
  planName: '',
  includedModuleGroups: [],
};

export const useMenu = () => {
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [meta, setMeta] = useState<MenuMeta>(emptyMeta);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMenu = useCallback(async () => {
    if (!isAuthenticated) {
      setGroups([]);
      setMeta(emptyMeta);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const menu = await menuService.getMenu();
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
    loadMenu();
  }, [loadMenu]);

  return { groups, meta, isLoading, error, reload: loadMenu };
};
