import { LayoutDashboard, Package, ClipboardList, Bell } from 'lucide-react';
import { useAuth } from '../../../shared/auth/useAuth';
import { UserLayout } from '../../../components/layout/Layout';

const quickLinks = [
  {
    title: 'Inventory',
    description: 'View and manage your stock items',
    icon: Package,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    title: 'Orders',
    description: 'Track your recent orders',
    icon: ClipboardList,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    title: 'Notifications',
    description: 'Stay updated on account activity',
    icon: Bell,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
];

export const DashboardPage = () => {
  const { user } = useAuth();

  const greeting =
    new Date().getHours() < 12
      ? 'morning'
      : new Date().getHours() < 17
        ? 'afternoon'
        : 'evening';

  return (
    <UserLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || 'User'}`}>
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        }}
        className="rounded-sm p-5 mb-6 flex items-center justify-between gap-4 overflow-hidden relative"
      >
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-primary-foreground)' }}
        />
        <div className="relative z-10">
          <p style={{ color: 'var(--color-primary-foreground)', opacity: 0.75 }} className="text-sm font-medium">
            Good {greeting}
          </p>
          <h2 style={{ color: 'var(--color-primary-foreground)' }} className="text-xl font-bold mt-0.5">
            {user?.name || 'User'}
          </h2>
          <p style={{ color: 'var(--color-primary-foreground)', opacity: 0.65 }} className="text-sm mt-1">
            Your personal workspace for inventory and daily operations.
          </p>
        </div>
        <div className="relative z-10 hidden sm:flex items-center gap-2 flex-shrink-0">
          <div
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
            className="px-3 py-2 rounded-sm"
          >
            <p style={{ color: 'var(--color-primary-foreground)', opacity: 0.8 }} className="text-xs">Logged in as</p>
            <p style={{ color: 'var(--color-primary-foreground)' }} className="text-sm font-semibold truncate max-w-[160px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          className="rounded-sm p-5 flex flex-col gap-4"
        >
          <div
            style={{ backgroundColor: 'var(--color-primary-soft)' }}
            className="w-10 h-10 rounded-sm flex items-center justify-center"
          >
            <LayoutDashboard style={{ color: 'var(--color-primary)' }} className="w-5 h-5" />
          </div>
          <div>
            <p style={{ color: 'var(--color-text)' }} className="text-2xl font-bold tracking-tight">
              Active
            </p>
            <p style={{ color: 'var(--color-text)' }} className="text-sm font-medium mt-0.5">Account Status</p>
            <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5">You are signed in and ready to go</p>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        className="rounded-sm"
      >
        <div
          style={{ borderBottom: '1px solid var(--color-border)' }}
          className="px-5 py-4"
        >
          <h3 style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">Coming Soon</h3>
          <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-0.5">
            More modules will appear here as they are enabled for your account
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickLinks.map(({ title, description, icon: Icon, iconBg, iconColor }) => (
            <div
              key={title}
              style={{
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
              }}
              className="rounded-sm p-4 opacity-75"
            >
              <div
                style={{ backgroundColor: iconBg }}
                className="w-9 h-9 rounded-sm flex items-center justify-center mb-3"
              >
                <Icon style={{ color: iconColor }} className="w-4 h-4" />
              </div>
              <p style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">{title}</p>
              <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-1">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};
