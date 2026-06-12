import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';

interface UserSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export const UserSidebar = ({ collapsed, onToggle }: UserSidebarProps) => {
  const location = useLocation();
  const [tooltip, setTooltip] = useState<{ name: string; y: number } | null>(null);

  const handleMouseEnter = (name: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ name, y: rect.top + rect.height / 2 });
  };

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
              <p
                style={{ color: 'var(--color-text)' }}
                className="font-semibold text-sm leading-none tracking-tight truncate"
              >
                UserPortal
              </p>
              <p
                style={{ color: 'var(--color-muted)' }}
                className="text-xs mt-1 leading-none truncate"
              >
                User Panel
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <p
            style={{ color: 'var(--color-muted-2)' }}
            className="text-[10px] font-semibold uppercase tracking-widest px-5 pt-5 pb-2 flex-shrink-0"
          >
            Main Menu
          </p>
        )}

        <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-hidden flex flex-col justify-start">
          {collapsed && <div className="pt-4 flex-shrink-0" />}

          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = location.pathname === href;

            return (
              <Link
                key={name}
                to={href}
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
                    : { color: 'var(--color-muted)' }
                }
                className={`
                  relative flex items-center gap-3 rounded-sm px-3 py-2.5 flex-shrink-0
                  transition-all duration-150
                  ${!isActive ? 'hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]' : ''}
                `}
                onMouseEnter={collapsed ? (e) => handleMouseEnter(name, e) : undefined}
                onMouseLeave={collapsed ? () => setTooltip(null) : undefined}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium truncate">{name}</span>}
                {isActive && !collapsed && (
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary-foreground)', opacity: 0.7 }}
                  />
                )}
              </Link>
            );
          })}
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
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {collapsed && tooltip && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: 76,
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
    </>
  );
};
