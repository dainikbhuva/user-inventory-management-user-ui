export const ANNOUNCEMENT_AUDIENCE_TYPES = ['all', 'roles', 'departments', 'designations'] as const;
export type AnnouncementAudienceType = (typeof ANNOUNCEMENT_AUDIENCE_TYPES)[number];

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<AnnouncementAudienceType, string> = {
  all: 'All employees',
  roles: 'Specific roles',
  departments: 'Specific departments',
  designations: 'Specific designations',
};

export const ANNOUNCEMENT_PRIORITIES = ['normal', 'important', 'urgent'] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  normal: 'Normal',
  important: 'Important',
  urgent: 'Urgent',
};

export const ANNOUNCEMENT_STATUSES = ['draft', 'active', 'inactive'] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
};

export const ANNOUNCEMENT_PRIORITY_STYLES: Record<AnnouncementPriority, string> = {
  normal: 'bg-slate-500/10 text-slate-600 ring-slate-500/20',
  important: 'bg-amber-500/10 text-amber-700 ring-amber-500/20',
  urgent: 'bg-red-500/10 text-red-600 ring-red-500/20',
};
