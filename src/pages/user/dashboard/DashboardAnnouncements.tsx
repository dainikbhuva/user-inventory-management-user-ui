import { useEffect, useState } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { announcementService } from '../../../services/announcement.service';
import type { PortalAnnouncementRecord } from '../../../shared/types/announcement.types';
import { ANNOUNCEMENT_PRIORITY_STYLES } from '../../../shared/constants/announcementAudience';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const formatDisplayDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const DashboardAnnouncements = () => {
  const [items, setItems] = useState<PortalAnnouncementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const M = PORTAL_PERMISSION_MODULES.announcements;
  const { canView } = useModulePermissions(M.moduleCode, M.itemCode);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setItems(await announcementService.getFeed());
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        className="rounded-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5 text-primary" />
          <h3 style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">
            Announcements
          </h3>
        </div>
        <p style={{ color: 'var(--color-muted)' }} className="text-sm">Loading announcements...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
      className="rounded-sm p-5 mb-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: 'var(--color-primary-soft)' }}
            className="flex h-9 w-9 items-center justify-center rounded-sm"
          >
            <Megaphone style={{ color: 'var(--color-primary)' }} className="h-4 w-4" />
          </div>
          <div>
            <h3 style={{ color: 'var(--color-text)' }} className="text-sm font-semibold">
              Announcements
            </h3>
            <p style={{ color: 'var(--color-muted)' }} className="text-xs">
              Updates for you
            </p>
          </div>
        </div>
        {canView ? (
          <Link
            to="/settings/announcements"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
          >
            Manage
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-sm border border-base bg-surface-2/30 px-4 py-3 transition hover:border-primary/30"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p style={{ color: 'var(--color-text)' }} className="font-semibold text-sm">
                    {item.title}
                  </p>
                  {item.priority !== 'normal' ? (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${ANNOUNCEMENT_PRIORITY_STYLES[item.priority]}`}
                    >
                      {item.priorityLabel}
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p style={{ color: 'var(--color-muted)' }} className="mt-1 line-clamp-2 text-sm">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <p
                style={{ color: 'var(--color-muted)' }}
                className="shrink-0 text-xs font-medium tabular-nums sm:text-right"
              >
                {formatDisplayDate(item.startDate)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
