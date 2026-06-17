import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type { PortalAnnouncementRecord } from '../shared/types/announcement.types';
import type {
  AnnouncementAudienceType,
  AnnouncementPriority,
  AnnouncementStatus,
} from '../shared/constants/announcementAudience';

export const announcementService = {
  async getAll(): Promise<PortalAnnouncementRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalAnnouncementRecord[] }>>(
      API_ENDPOINTS.ANNOUNCEMENTS.LIST
    );
    return response.data.data?.items ?? [];
  },

  async getFeed(): Promise<PortalAnnouncementRecord[]> {
    const response = await axiosClient.get<ApiResponse<{ items: PortalAnnouncementRecord[] }>>(
      API_ENDPOINTS.ANNOUNCEMENTS.FEED
    );
    return response.data.data?.items ?? [];
  },

  async create(payload: {
    title: string;
    description?: string;
    audienceType: AnnouncementAudienceType;
    audienceIds?: string[];
    startDate: string;
    endDate: string;
    priority: AnnouncementPriority;
    status: AnnouncementStatus;
  }): Promise<PortalAnnouncementRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalAnnouncementRecord }>>(
      API_ENDPOINTS.ANNOUNCEMENTS.LIST,
      payload
    );
    return response.data.data!.item;
  },

  async update(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      audienceType: AnnouncementAudienceType;
      audienceIds: string[];
      startDate: string;
      endDate: string;
      priority: AnnouncementPriority;
      status: AnnouncementStatus;
    }>
  ): Promise<PortalAnnouncementRecord> {
    const response = await axiosClient.put<ApiResponse<{ item: PortalAnnouncementRecord }>>(
      API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id),
      payload
    );
    return response.data.data!.item;
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
  },
};
