import type { CsvColumnDef } from './tableCsvExport';
import type { DailyAttendanceRow, PortalAttendanceRecord } from '../types/attendance.types';

export const formatAttendanceTimeCsv = (iso?: string): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatAttendanceStatusCsv = (
  status: PortalAttendanceRecord['status'] | DailyAttendanceRow['status']
): string => {
  if (status === 'unmarked') return 'Not marked';
  if (status === 'half_day') return 'Half day';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const myAttendanceHistoryCsvColumns: CsvColumnDef<PortalAttendanceRecord>[] = [
  { header: 'Date', getValue: (row) => row.date },
  { header: 'Check in', getValue: (row) => formatAttendanceTimeCsv(row.checkIn) },
  { header: 'Check out', getValue: (row) => formatAttendanceTimeCsv(row.checkOut) },
  { header: 'Hours', getValue: (row) => row.totalWorkingHours },
  { header: 'Status', getValue: (row) => formatAttendanceStatusCsv(row.status) },
];

export const teamAttendanceCsvColumns: CsvColumnDef<DailyAttendanceRow>[] = [
  { header: 'Employee', getValue: (row) => row.user.name },
  { header: 'Employee code', getValue: (row) => row.user.employeeCode },
  { header: 'Check in', getValue: (row) => formatAttendanceTimeCsv(row.checkIn) },
  { header: 'Check out', getValue: (row) => formatAttendanceTimeCsv(row.checkOut) },
  { header: 'Hours', getValue: (row) => row.totalWorkingHours ?? '' },
  { header: 'Status', getValue: (row) => formatAttendanceStatusCsv(row.status) },
];

export const adminAttendanceCsvColumns: CsvColumnDef<PortalAttendanceRecord>[] = [
  { header: 'Employee', getValue: (row) => row.user.name },
  { header: 'Employee code', getValue: (row) => row.user.employeeCode },
  { header: 'Date', getValue: (row) => row.date },
  { header: 'Check in', getValue: (row) => formatAttendanceTimeCsv(row.checkIn) },
  { header: 'Check out', getValue: (row) => formatAttendanceTimeCsv(row.checkOut) },
  { header: 'Hours', getValue: (row) => row.totalWorkingHours ?? '' },
  { header: 'Status', getValue: (row) => formatAttendanceStatusCsv(row.status) },
];
