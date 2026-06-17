import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalNotificationRecord } from '../shared/types/notification.types';

export const notificationService = {
  async getAll(limit = 30): Promise<{ items: PortalNotificationRecord[]; unreadCount: number }> {
    const response = await axiosClient.get<
      ApiResponse<{ items: PortalNotificationRecord[]; unreadCount: number }>
    >(API_ENDPOINTS.NOTIFICATIONS.LIST, { params: { limit } });
    return response.data.data ?? { items: [], unreadCount: 0 };
  },

  async getUnreadCount(): Promise<number> {
    const response = await axiosClient.get<ApiResponse<{ unreadCount: number }>>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data.data?.unreadCount ?? 0;
  },

  async markAsRead(id: string): Promise<PortalNotificationRecord> {
    const response = await axiosClient.patch<ApiResponse<{ item: PortalNotificationRecord }>>(
      API_ENDPOINTS.NOTIFICATIONS.READ(id)
    );
    return response.data.data!.item;
  },

  async markAllAsRead(): Promise<void> {
    await axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  },
};
