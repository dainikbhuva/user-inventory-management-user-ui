export const HOLIDAY_TYPES = ['national', 'company', 'optional'] as const;

export type HolidayType = (typeof HOLIDAY_TYPES)[number];

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  national: 'National',
  company: 'Company',
  optional: 'Optional',
};
