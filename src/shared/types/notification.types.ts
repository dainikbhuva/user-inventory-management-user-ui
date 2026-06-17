export type PortalNotificationType = 'announcement' | 'leave' | 'attendance' | 'system';

export interface PortalNotificationRecord {
  id: string;
  type: PortalNotificationType;
  title: string;
  message: string;
  link?: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}
