import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { useNotifications } from '../../../shared/notifications/NotificationContext';
import { formatNotificationTime } from '../../../shared/utils/notificationTime';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { items, unreadCount, isLoading, refresh, markAsRead, markAllAsRead } = useNotifications();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleOpen = useCallback(
    async (id: string, link?: string) => {
      if (!items.find((item) => item.id === id)?.isRead) {
        await markAsRead(id);
      }
      if (link) {
        navigate(link);
      }
    },
    [items, markAsRead, navigate]
  );

  const handleMarkAll = async () => {
    try {
      setIsMarkingAll(true);
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <UserLayout title="Notifications" subtitle="Your recent updates and announcements">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-body">All notifications</h2>
          <p className="mt-1 text-sm text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button type="button" variant="secondary" disabled={isMarkingAll} onClick={handleMarkAll}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-surface-2">
              <Bell className="h-5 w-5 text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-body">No notifications yet</p>
              <p className="mt-1 text-sm text-muted">
                New announcements and updates will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-base">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => void handleOpen(item.id, item.link)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-surface-2 ${
                    !item.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <span
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                      item.isRead ? 'bg-border' : 'bg-primary'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-body">{item.title}</span>
                      <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                        {item.type}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-muted line-clamp-2">{item.message}</span>
                    <span className="mt-1.5 block text-xs text-muted-2">
                      {formatNotificationTime(item.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserLayout>
  );
};
