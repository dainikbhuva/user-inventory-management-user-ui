import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { SETTINGS_NAV_SECTIONS, type SettingsNavItem } from '../../../shared/constants/settingsNav';
import { usePermissions } from '../../../shared/permissions/PermissionContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-start gap-3 rounded-sm px-3 py-2.5 transition-all ${
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted hover:bg-surface-2 hover:text-body'
  }`;

export const SettingsLayout = () => {
  const location = useLocation();
  const { can, isLoading: permsLoading } = usePermissions();

  const canSeeItem = (item: SettingsNavItem) => {
    if (!item.permission) return true;
    if (can(item.permission.moduleCode, 'view', item.permission.itemCode)) return true;
    return (item.altPermissions ?? []).some((alt) => can(alt.moduleCode, 'view', alt.itemCode));
  };

  const visibleSections = SETTINGS_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(canSeeItem),
  })).filter((section) => section.items.length > 0);

  const activeSection = visibleSections.find((section) =>
    section.items.some((item) => location.pathname === item.path)
  );

  const activeItem = activeSection?.items.find((item) => location.pathname === item.path);

  return (
    <UserLayout
      title="Settings"
      subtitle={activeItem?.description ?? 'Company configuration and master data'}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-sm border border-base bg-surface p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-base pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-soft">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-body">Configuration</p>
                <p className="text-xs text-muted">General & masters</p>
              </div>
            </div>

            <nav className="space-y-5">
              {!permsLoading &&
                visibleSections.map((section) => (
                <div key={section.id}>
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-2">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink key={item.id} to={item.path} className={navLinkClass}>
                          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium leading-tight">{item.label}</span>
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
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
