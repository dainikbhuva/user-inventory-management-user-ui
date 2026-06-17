import { useEffect } from 'react';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_THEME_COLOR,
  formatDocumentTitle,
  resolvePageMeta,
  type PageMeta,
} from '../shared/constants/appMeta';

const ensureMetaTag = (attr: 'name' | 'property', key: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
};

const applyPageMeta = (meta: PageMeta) => {
  const title = formatDocumentTitle(meta.title);
  const description = meta.description ?? APP_DESCRIPTION;
  const robots = meta.robots ?? 'noindex, nofollow';

  document.title = title;

  ensureMetaTag('name', 'description').content = description;
  ensureMetaTag('name', 'robots').content = robots;
  ensureMetaTag('property', 'og:title').content = title;
  ensureMetaTag('property', 'og:description').content = description;
  ensureMetaTag('property', 'og:site_name').content = APP_NAME;
  ensureMetaTag('name', 'twitter:title').content = title;
  ensureMetaTag('name', 'twitter:description').content = description;

  const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (theme) theme.content = APP_THEME_COLOR;
};

export const usePageMeta = (pathname: string) => {
  useEffect(() => {
    applyPageMeta(resolvePageMeta(pathname));
  }, [pathname]);
};

export const setPageMeta = (meta: Partial<PageMeta> & { title: string }) => {
  applyPageMeta({
    description: APP_DESCRIPTION,
    ...resolvePageMeta(window.location.pathname),
    ...meta,
  });
};
