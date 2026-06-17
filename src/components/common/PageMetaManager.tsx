import { useLocation } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

/** Syncs document title and meta tags with the current route. */
export const PageMetaManager = () => {
  const { pathname } = useLocation();
  usePageMeta(pathname);
  return null;
};
