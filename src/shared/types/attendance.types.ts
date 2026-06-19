import type { ScheduleMode } from '../constants/scheduleMode';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

export interface PortalAttendanceUserRef {
  id: string;
  name: string;
  employeeCode: string;
}

export interface AttendanceSettings {
  scheduleMode: ScheduleMode;
  officeStartTime: string;
  officeEndTime: string;
  lateAfterMinutes: number;
  halfDayHours: number;
  workingDays: number[];
  weeklyOffDays: number[];
}

export interface PortalAttendanceRecord {
  id: string;
  user: PortalAttendanceUserRef;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  totalWorkingHours: number;
  notes?: string;
  workMinutes?: number;
}

export interface MyTodayAttendance {
  date: string;
  settings: AttendanceSettings;
  scheduleMode: ScheduleMode;
  isWeeklyOff: boolean;
  isWorkingDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  hasShiftAssignment: boolean;
  shift?: {
    id: string;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
  };
  shiftSource?: 'company' | 'employee';
  selectedShiftId?: string;
  availableShifts?: Array<{
    id: string;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
  }>;
  effectiveStartTime: string;
  effectiveEndTime: string;
  record?: PortalAttendanceRecord;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

export interface DailyAttendanceRow {
  user: PortalAttendanceUserRef;
  recordId?: string;
  status: AttendanceStatus | 'unmarked';
  checkIn?: string;
  checkOut?: string;
  totalWorkingHours?: number;
}

export interface DailyAttendanceSheet {
  date: string;
  summary: {
    present: number;
    absent: number;
    late: number;
    half_day: number;
    unmarked: number;
    total: number;
  };
  rows: DailyAttendanceRow[];
  meta: {
    scope: 'direct_reports' | 'department' | 'company' | 'none';
    scopeLabel: string;
    canMark: boolean;
  };
}

export interface AttendanceTeamAccess {
  canView: boolean;
  canMark: boolean;
  scope: 'direct_reports' | 'department' | 'company' | 'none';
  scopeLabel: string;
}

export interface MarkAttendancePayload {
  userId: string;
  date: string;
  status: 'present' | 'absent';
}
