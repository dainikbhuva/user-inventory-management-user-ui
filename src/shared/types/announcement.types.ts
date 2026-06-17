import type {
  AnnouncementAudienceType,
  AnnouncementPriority,
  AnnouncementStatus,
} from '../constants/announcementAudience';

export interface PortalAnnouncementAudienceRef {
  id: string;
  name: string;
}

export interface PortalAnnouncementRecord {
  id: string;
  title: string;
  description?: string;
  audienceType: AnnouncementAudienceType;
  audienceTypeLabel: string;
  audienceIds: string[];
  audienceTargets: PortalAnnouncementAudienceRef[];
  startDate: string;
  endDate: string;
  priority: AnnouncementPriority;
  priorityLabel: string;
  status: AnnouncementStatus;
  statusLabel: string;
  isLive: boolean;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementFormData {
  title: string;
  description: string;
  audienceType: AnnouncementAudienceType;
  audienceIds: string[];
  startDate: string;
  endDate: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
}
