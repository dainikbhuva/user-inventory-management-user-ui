import { useState, useEffect, type ReactNode } from 'react';
import { UserSidebar } from './Sidebar';
import { UserHeader } from './Header';

interface UserLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const UserLayout = ({ children, title = 'Dashboard', subtitle }: UserLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleToggle = () => {
    if (isMobile) setMobileOpen((o) => !o);
    else setCollapsed((o) => !o);
  };

  return (
    <div
      style={{ backgroundColor: 'var(--color-background)' }}
      className="flex h-screen overflow-hidden"
    >
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={
          isMobile
            ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative z-10 flex-shrink-0'
        }
      >
        <UserSidebar collapsed={!isMobile && collapsed} onToggle={handleToggle} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <UserHeader title={title} subtitle={subtitle} onSidebarToggle={handleToggle} />
        <main
          style={{ backgroundColor: 'var(--color-background)' }}
          className="flex-1 overflow-y-auto p-4 sm:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
