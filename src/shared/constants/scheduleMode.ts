export const SCHEDULE_MODES = ['company', 'shift'] as const;
export type ScheduleMode = (typeof SCHEDULE_MODES)[number];

export const SCHEDULE_MODE_LABELS: Record<ScheduleMode, string> = {
  company: 'Company hours (same for everyone)',
  shift: 'Shift-based (employees choose their shift)',
};
