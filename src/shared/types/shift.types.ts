export interface PortalShiftRecord {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  lateAfterMinutes: number;
  halfDayHours: number;
  crossesMidnight: boolean;
  description?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftFormData {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  lateAfterMinutes: string;
  halfDayHours: string;
  description: string;
  status: 'active' | 'inactive';
  sortOrder: string;
}

export interface PortalShiftRosterRecord {
  id: string;
  userId: string;
  userName: string;
  employeeCode: string;
  shiftId: string;
  shiftName: string;
  shiftCode: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RosterAssignFormData {
  userId: string;
  shiftId: string;
  date: string;
}

export interface RosterBulkFormData {
  userId: string;
  shiftId: string;
  fromDate: string;
  toDate: string;
  skipWeeklyOff: boolean;
}
