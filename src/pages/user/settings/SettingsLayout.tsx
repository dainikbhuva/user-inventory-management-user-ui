import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { SETTINGS_NAV_SECTIONS, type SettingsNavItem } from '../../../shared/constants/settingsNav';
import { usePermissions } from '../../../shared/permissions/PermissionContext';

const isSettingsPathActive = (pathname: string, itemPath: string) =>
  pathname === itemPath || pathname.startsWith(`${itemPath}/`);

const settingsNavClass = (isActive: boolean) =>
  `relative flex items-center gap-3 rounded-sm px-3 py-2.5 transition-all duration-150 ${
    isActive ? '' : 'hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
  }`;

const settingsNavStyle = (isActive: boolean): CSSProperties =>
  isActive
    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
    : { color: 'var(--color-muted)' };

export const SettingsLayout = () => {
  const location = useLocation();
  const { can, isLoading: permsLoading } = usePermissions();

  const canSeeItem = (item: SettingsNavItem) => {
    if (!item.permission) return true;
    if (can(item.permission.moduleCode, 'view', item.permission.itemCode)) return true;
    return (item.altPermissions ?? []).some((alt) => can(alt.moduleCode, 'view', alt.itemCode));
  };

  const visibleSections = useMemo(
    () =>
      SETTINGS_NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(canSeeItem),
      })).filter((section) => section.items.length > 0),
    [can]
  );

  const activeSection = visibleSections.find((section) =>
    section.items.some((item) => isSettingsPathActive(location.pathname, item.path))
  );

  const activeItem = activeSection?.items.find((item) =>
    isSettingsPathActive(location.pathname, item.path)
  );

  const [openSectionId, setOpenSectionId] = useState<string | null>(activeSection?.id ?? null);

  useEffect(() => {
    if (activeSection) {
      setOpenSectionId(activeSection.id);
    }
  }, [activeSection?.id]);

  return (
    <UserLayout
      title="Settings"
      subtitle={activeItem?.description ?? 'Company configuration and master data'}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-0 lg:w-60 lg:self-start">
          <div
            style={{ backgroundColor: 'var(--color-surface)' }}
            className="overflow-hidden rounded-sm shadow-sm ring-1 ring-[var(--color-border)]"
          >
            <div className="flex items-center gap-3 px-4 pb-3 pt-4">
              <div
                style={{ backgroundColor: 'var(--color-primary-soft)' }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
              >
                <Settings style={{ color: 'var(--color-primary)' }} className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p style={{ color: 'var(--color-text)' }} className="text-sm font-semibold leading-none">
                  Configuration
                </p>
                <p style={{ color: 'var(--color-muted)' }} className="mt-1 text-xs leading-none">
                  General & masters
                </p>
              </div>
            </div>

            <nav className="theme-scrollbar max-h-[calc(100vh-12rem)] space-y-0 overflow-y-auto px-2 pb-4">
              {!permsLoading &&
                visibleSections.map((section, index) => {
                  const isOpen = openSectionId === section.id;
                  const sectionActive = section.items.some((item) =>
                    isSettingsPathActive(location.pathname, item.path)
                  );

                  return (
                    <div key={section.id} className={index > 0 ? 'pt-3' : 'pt-1'}>
                      <button
                        type="button"
                        onClick={() => setOpenSectionId(section.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-[var(--color-surface-2)]"
                      >
                        <span
                          style={{
                            color: sectionActive
                              ? 'var(--color-primary)'
                              : 'var(--color-muted-2)',
                          }}
                          className="text-[10px] font-semibold uppercase tracking-widest"
                        >
                          {section.label}
                        </span>
                        <ChevronDown
                          style={{ color: 'var(--color-muted)' }}
                          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isOpen ? (
                        <div className="mt-1 space-y-0.5 pb-1">
                          {section.items.map((item) => {
                            const Icon = item.icon;

                            return (
                              <NavLink
                                key={item.id}
                                to={item.path}
                                end
                                className={({ isActive }) => settingsNavClass(isActive)}
                                style={({ isActive }) => settingsNavStyle(isActive)}
                              >
                                <Icon className="h-[18px] w-[18px] shrink-0" />
                                <span className="truncate text-sm font-medium">{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </UserLayout>
  );
};
