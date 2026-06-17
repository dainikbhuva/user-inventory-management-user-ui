import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/auth/useAuth';
import { useNotifications } from '../../shared/notifications/NotificationContext';
import { useSubscription } from '../../shared/subscription/SubscriptionContext';
import { formatNotificationTime } from '../../shared/utils/notificationTime';
import { Menu, Bell, Settings, ChevronDown, User, KeyRound, LogOut, CreditCard } from 'lucide-react';

interface UserHeaderProps {
  title?: string;
  subtitle?: string;
  onSidebarToggle: () => void;
}

export const UserHeader = ({ title = 'Dashboard', subtitle, onSidebarToggle }: UserHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items, unreadCount, isLoading, refresh, markAsRead, markAllAsRead } = useNotifications();
  const { subscription } = useSubscription();

  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setUserOpen(false);
    logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setNotifOpen((open) => {
      const next = !open;
      if (next) void refresh();
      return next;
    });
    setUserOpen(false);
  };

  const handleNotificationClick = async (id: string, link?: string) => {
    const item = items.find((n) => n.id === id);
    if (item && !item.isRead) {
      await markAsRead(id);
    }
    setNotifOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const iconBtn = `
    w-9 h-9 flex items-center justify-center rounded-sm cursor-pointer
    transition-colors duration-150
  `;

  const previewItems = items.slice(0, 8);

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

      <div className="flex items-center gap-1">
        {subscription ? (
          <button
            type="button"
            onClick={() => navigate('/settings/billing')}
            className="hidden md:flex max-w-[220px] items-center gap-2 rounded-sm border border-base bg-surface-2/60 px-3 py-1.5 text-left hover:bg-[var(--color-surface-2)] transition-colors"
            title="View plan & billing"
          >
            <CreditCard className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p style={{ color: 'var(--color-text)' }} className="truncate text-xs font-semibold leading-none">
                {subscription.plan.name}
              </p>
              <p style={{ color: 'var(--color-muted)' }} className="mt-0.5 truncate text-[10px]">
                {subscription.isExpired
                  ? 'Expired · Renew'
                  : subscription.isTrial
                    ? `Trial · ${subscription.daysRemaining}d left`
                    : `${subscription.activeUserCount}/${subscription.seatCount} users · ${subscription.daysRemaining}d left`}
              </p>
            </div>
          </button>
        ) : null}

        <button
          onClick={() => navigate('/settings/general')}
          style={{ color: 'var(--color-muted)' }}
          className={`${iconBtn} hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]`}
          aria-label="Settings"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={toggleNotifications}
            style={{
              color: notifOpen ? 'var(--color-primary)' : 'var(--color-muted)',
              backgroundColor: notifOpen ? 'var(--color-primary-soft)' : 'transparent',
            }}
            className={`${iconBtn} relative hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]`}
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span
                style={{ borderColor: 'var(--color-surface)' }}
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2"
              />
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                zIndex: 200,
              }}
              className="absolute right-0 top-full mt-2 w-80 rounded-sm overflow-hidden"
            >
              <div
                style={{ borderBottom: '1px solid var(--color-border)' }}
                className="flex items-center justify-between px-4 py-3"
              >
                <p style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleMarkAllRead()}
                    style={{ color: 'var(--color-primary)' }}
                    className="text-xs font-semibold hover:opacity-80"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="theme-scrollbar max-h-64 overflow-y-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
                {isLoading ? (
                  <p style={{ color: 'var(--color-muted)' }} className="px-4 py-6 text-center text-sm">
                    Loading...
                  </p>
                ) : previewItems.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)' }} className="px-4 py-6 text-center text-sm">
                    No notifications yet
                  </p>
                ) : (
                  previewItems.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => void handleNotificationClick(n.id, n.link)}
                      style={{
                        backgroundColor: !n.isRead ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors text-left"
                    >
                      <div
                        style={{ backgroundColor: !n.isRead ? 'var(--color-primary)' : 'var(--color-border)' }}
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p style={{ color: 'var(--color-text)' }} className="text-sm font-medium leading-snug truncate">
                          {n.title}
                        </p>
                        <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-1">
                          {formatNotificationTime(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
                className="px-4 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/notifications');
                  }}
                  style={{ color: 'var(--color-primary)' }}
                  className="w-full text-xs font-semibold text-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          style={{ backgroundColor: 'var(--color-border)' }}
          className="w-px h-6 mx-1.5 flex-shrink-0"
        />

        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
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
              <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5 truncate max-w-[140px]">
                {user?.companyName || user?.email || ''}
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

              <div style={{ backgroundColor: 'var(--color-surface)' }} className="py-1.5">
                {[
                  { label: 'Profile', sub: 'View your profile', icon: User, path: '/profile' },
                  { label: 'Change Password', sub: 'Update your password', icon: KeyRound, path: '/change-password' },
                ].map(({ label, sub, icon: Icon, path }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setUserOpen(false); navigate(path); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5
                      hover:bg-[var(--color-surface-2)] transition-colors text-left cursor-pointer"
                  >
                    <div
                      style={{
                        backgroundColor: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                      }}
                      className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                    >
                      <Icon style={{ color: 'var(--color-muted)' }} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--color-text)' }} className="text-sm font-medium leading-none">
                        {label}
                      </p>
                      <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
                className="p-2"
              >
                <button
                  type="button"
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
      </div>
    </header>
  );
};

