import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/auth/useAuth';
import { Menu, ChevronDown, LogOut } from 'lucide-react';

interface UserHeaderProps {
  title?: string;
  subtitle?: string;
  onSidebarToggle: () => void;
}

export const UserHeader = ({ title = 'Dashboard', subtitle, onSidebarToggle }: UserHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setUserOpen(false);
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const iconBtn = `
    w-9 h-9 flex items-center justify-center rounded-sm cursor-pointer
    transition-colors duration-150
  `;

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        zIndex: 40,
      }}
      className="h-16 flex items-center px-4 gap-3 flex-shrink-0"
    >
      <button
        onClick={onSidebarToggle}
        style={{ color: 'var(--color-muted)' }}
        className={`${iconBtn} hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]`}
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 style={{ color: 'var(--color-text)' }} className="text-base font-semibold truncate leading-none">
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div ref={userRef} className="relative">
        <button
          onClick={() => setUserOpen((o) => !o)}
          style={{
            backgroundColor: userOpen ? 'var(--color-surface-2)' : 'transparent',
          }}
          className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-sm
            hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
        >
          <div
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
          >
            <span style={{ color: 'var(--color-primary-foreground)' }} className="text-xs font-bold">
              {initials}
            </span>
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p style={{ color: 'var(--color-text)' }} className="text-sm font-semibold leading-none truncate max-w-[120px]">
              {user?.name || 'User'}
            </p>
            <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5 truncate max-w-[120px]">
              {user?.email || ''}
            </p>
          </div>
          <ChevronDown
            style={{ color: 'var(--color-muted)' }}
            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {userOpen && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              zIndex: 200,
            }}
            className="absolute right-0 top-full mt-2 w-60 rounded-sm overflow-hidden"
          >
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              }}
              className="px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
              className="p-2"
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5
                  rounded-sm hover:bg-red-50 transition-colors text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-sm bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-100 transition-colors">
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 leading-none">Logout</p>
                  <p className="text-xs text-red-400 mt-0.5">Sign out of account</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
