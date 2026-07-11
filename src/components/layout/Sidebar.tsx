import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChevronLeft, ChevronRight, UserCircle, ChevronDown } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';
import { getModuleIcon } from '../../shared/utils/moduleIcons';
import { filterMenuGroupsForSidebar } from '../../shared/utils/sidebarMenu';
import type { MenuItem } from '../../shared/types/menu.types';

interface UserSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navLinkClass = (isActive: boolean) => `
  relative flex items-center gap-3 rounded-sm px-3 py-2.5 flex-shrink-0
  transition-all duration-150
  ${!isActive ? 'hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]' : ''}
`;

const navStyle = (isActive: boolean) =>
  isActive
    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
    : { color: 'var(--color-muted)' };

const FLYOUT_LEFT = 64;
const HEADER_OFFSET = 72;

const clampFlyoutTop = (centerY: number, itemCount: number) => {
  const estimatedHeight = 36 + itemCount * 36;
  const half = estimatedHeight / 2;
  const minCenter = HEADER_OFFSET + half;
  const maxCenter = window.innerHeight - 12 - half;
  return Math.min(Math.max(centerY, minCenter), Math.max(minCenter, maxCenter));
};

export const UserSidebar = ({ collapsed, onToggle }: UserSidebarProps) => {
  const location = useLocation();
  const { groups, isLoading } = useMenu();
  const sidebarGroups = useMemo(() => filterMenuGroupsForSidebar(groups), [groups]);
  const [tooltip, setTooltip] = useState<{ name: string; y: number } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [flyout, setFlyout] = useState<{ item: MenuItem; y: number } | null>(null);
  const hideFlyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isModuleActive = (item: MenuItem) => {
    if (item.linkType === 'dropdown' && item.children?.length) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return isPathActive(item.path);
  };

  useEffect(() => {
    let singleChildId: string | null = null;
    for (const group of sidebarGroups) {
      for (const item of group.modules) {
        if (item.linkType !== 'dropdown' || !item.children?.length) continue;
        if (item.children.some((c) => location.pathname === c.path)) {
          setOpenDropdown(item.id);
          return;
        }
        if (item.children.length === 1 && !singleChildId) {
          singleChildId = item.id;
        }
      }
    }
    if (singleChildId) {
      setOpenDropdown(singleChildId);
    }
  }, [location.pathname, sidebarGroups]);

  useEffect(() => {
    if (!collapsed) {
      setTooltip(null);
      setFlyout(null);
    }
  }, [collapsed]);

  const clearHideFlyoutTimer = () => {
    if (hideFlyoutTimer.current) {
      clearTimeout(hideFlyoutTimer.current);
      hideFlyoutTimer.current = null;
    }
  };

  const showFlyout = (item: MenuItem, e: React.MouseEvent<HTMLElement>) => {
    clearHideFlyoutTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip(null);
    setFlyout({ item, y: rect.top + rect.height / 2 });
  };

  const scheduleHideFlyout = () => {
    clearHideFlyoutTimer();
    hideFlyoutTimer.current = setTimeout(() => setFlyout(null), 120);
  };

  const showTooltip = (name: string, e: React.MouseEvent<HTMLElement>) => {
    clearHideFlyoutTimer();
    setFlyout(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ name, y: rect.top + rect.height / 2 });
  };

  const hideTooltip = () => setTooltip(null);

  const renderModule = (item: MenuItem) => {
    const Icon = getModuleIcon(item.code);
    const hasChildren = item.linkType === 'dropdown' && item.children?.length;
    const isActive = isModuleActive(item);
    const isOpen = openDropdown === item.id;

    if (hasChildren && collapsed) {
      return (
        <button
          key={item.id}
          type="button"
          style={navStyle(isActive)}
          className={`${navLinkClass(isActive)} w-full cursor-pointer`}
          onMouseEnter={(e) => showFlyout(item, e)}
          onMouseLeave={scheduleHideFlyout}
          aria-label={item.name}
          aria-haspopup="true"
        >
          <Icon className="w-[18px] h-[18px] flex-shrink-0 mx-auto" />
        </button>
      );
    }

    if (hasChildren && !collapsed) {
      return (
        <div key={item.id}>
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : item.id)}
            style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted)' }}
            className="w-full relative flex items-center gap-3 rounded-sm px-3 py-2.5 flex-shrink-0
              transition-all duration-150 hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] cursor-pointer"
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span className="text-sm font-medium truncate flex-1 text-left">{item.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-[var(--color-border)] pl-2">
              {item.children!.map((child) => {
                const childActive = location.pathname === child.path;
                return (
                  <Link
                    key={child.id}
                    to={child.path}
                    style={navStyle(childActive)}
                    className={`
                      flex items-center gap-2 rounded-sm px-3 py-2 text-sm
                      ${!childActive ? 'hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]' : ''}
                    `}
                  >
                    {child.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        style={navStyle(isActive)}
        className={navLinkClass(isActive)}
        onMouseEnter={collapsed ? (e) => showTooltip(item.name, e) : undefined}
        onMouseLeave={collapsed ? hideTooltip : undefined}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium truncate">{item.name}</span>}
      </Link>
    );
  };

  const dashboardActive = location.pathname === '/dashboard';

  return (
    <>
      <aside
        style={{
          backgroundColor: 'var(--color-surface-3)',
          borderRight: '1px solid var(--color-border)',
        }}
        className={`
          h-screen flex flex-col flex-shrink-0 overflow-hidden
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-60'}
        `}
      >
        <div
          style={{ borderBottom: '1px solid var(--color-border)' }}
          className="flex items-center gap-3 px-4 h-16 flex-shrink-0 overflow-hidden"
        >
          <div
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
          >
            <UserCircle className="w-4 h-4" style={{ color: 'var(--color-primary-foreground)' }} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p style={{ color: 'var(--color-text)' }} className="font-semibold text-sm leading-none tracking-tight truncate">
                UserPortal
              </p>
              <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-1 leading-none truncate">
                User Panel
              </p>
            </div>
          )}
        </div>

        <nav className="theme-scrollbar flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto flex flex-col justify-start">
          {collapsed && <div className="pt-4 flex-shrink-0" />}

          <Link
            to="/dashboard"
            style={navStyle(dashboardActive)}
            className={navLinkClass(dashboardActive)}
            onMouseEnter={collapsed ? (e) => showTooltip('Dashboard', e) : undefined}
            onMouseLeave={collapsed ? hideTooltip : undefined}
          >
            <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium truncate">Dashboard</span>}
          </Link>

          {isLoading && !collapsed && (
            <p className="px-3 py-2 text-xs text-muted">Loading menu...</p>
          )}

          {sidebarGroups.map((group) => (
            <div key={group.id} className="pt-3">
              {!collapsed && (
                <p
                  style={{ color: 'var(--color-muted-2)' }}
                  className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2 flex-shrink-0"
                >
                  {group.name}
                </p>
              )}
              <div className="space-y-0.5">
                {group.modules.map((item) => renderModule(item))}
              </div>
            </div>
          ))}

        </nav>

        <div
          style={{ borderTop: '1px solid var(--color-border)' }}
          className="px-2 py-3 flex-shrink-0"
        >
          <button
            onClick={onToggle}
            style={{ color: 'var(--color-muted)' }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm
              hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]
              transition-all duration-150 cursor-pointer"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {collapsed && tooltip && !flyout && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: FLYOUT_LEFT + 12,
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap"
        >
          {tooltip.name}
        </div>
      )}

      {collapsed && flyout?.item.children?.length && (
        <div
          style={{
            position: 'fixed',
            top: clampFlyoutTop(flyout.y, flyout.item.children.length),
            left: FLYOUT_LEFT,
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            zIndex: 10000,
            minWidth: '10rem',
          }}
          className="rounded-sm py-1.5"
          onMouseEnter={clearHideFlyoutTimer}
          onMouseLeave={scheduleHideFlyout}
        >
          <p
            style={{
              color: 'var(--color-muted-2)',
              borderBottom: '1px solid var(--color-border)',
            }}
            className="px-3 pb-2 mb-1 text-[10px] font-semibold uppercase tracking-widest truncate"
          >
            {flyout.item.name}
          </p>
          {flyout.item.children.map((child) => {
            const childActive = location.pathname === child.path;
            return (
              <Link
                key={child.id}
                to={child.path}
                onClick={() => setFlyout(null)}
                style={
                  childActive
                    ? { backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }
                    : { color: 'var(--color-text)' }
                }
                className="block px-3 py-2 text-sm font-medium hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors"
              >
                {child.name}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};
