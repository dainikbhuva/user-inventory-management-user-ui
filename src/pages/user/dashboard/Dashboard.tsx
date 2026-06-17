import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../../shared/auth/useAuth';
import { useMenu } from '../../../hooks/useMenu';
import { UserLayout } from '../../../components/layout/Layout';
import { DashboardAnnouncements } from './DashboardAnnouncements';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { groups, meta } = useMenu();

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
            {user?.companyName
              ? `${user.companyName} workspace`
              : 'Your personal workspace for inventory and daily operations.'}
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

      <DashboardAnnouncements />

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

      {meta.planName && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          className="rounded-sm p-5 mb-6"
        >
          <h3 style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">Your plan: {meta.planName}</h3>
          <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-1 mb-3">
            Sidebar shows module groups assigned to this plan. If a group shows &quot;(no sidebar items)&quot;, either no modules exist under it or your role lacks view permission — open Role to Permission and enable View for those items.
          </p>
          {meta.includedModuleGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {meta.includedModuleGroups.map((group) => {
                const visible = groups.some((g) => g.id === group.id);
                return (
                  <span
                    key={group.id}
                    style={{
                      backgroundColor: visible ? 'var(--color-primary-soft)' : 'var(--color-surface-2)',
                      color: visible ? 'var(--color-primary)' : 'var(--color-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                    className="text-xs font-medium px-2.5 py-1 rounded-sm"
                  >
                    {group.name}{!visible ? ' (no sidebar items)' : ''}
                  </span>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--color-muted)' }} className="text-sm">
              No module groups on this plan. Ask admin to edit the plan and check module groups.
            </p>
          )}
        </div>
      )}

      {groups.length === 0 && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          className="rounded-sm"
        >
          <div className="px-5 py-8 text-center">
            <p style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">No modules in sidebar yet</p>
            <p style={{ color: 'var(--color-muted)' }} className="text-xs mt-2 max-w-md mx-auto">
              Admin: add module groups to the company plan, create modules under those groups, and add module items for dropdown menus.
            </p>
          </div>
        </div>
      )}
    </UserLayout>
  );
};
