import type { CsvColumnDef } from './tableCsvExport';
import type { PortalLeaveRequestRecord } from '../types/leave.types';

const leaveStatusLabel = (status: PortalLeaveRequestRecord['status']) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const leaveMyCsvColumns: CsvColumnDef<PortalLeaveRequestRecord>[] = [
  { header: 'Leave type', getValue: (row) => row.leaveType.name },
  { header: 'Start date', getValue: (row) => row.startDate },
  { header: 'End date', getValue: (row) => row.endDate },
  { header: 'Days', getValue: (row) => row.totalDays },
  { header: 'Approver', getValue: (row) => row.approver?.name ?? 'Company admin' },
  { header: 'Status', getValue: (row) => leaveStatusLabel(row.status) },
  { header: 'Stage', getValue: (row) => row.approvalStageLabel ?? '' },
  { header: 'Reason', getValue: (row) => row.reason ?? '' },
];

export const leaveTeamCsvColumns: CsvColumnDef<PortalLeaveRequestRecord>[] = [
  { header: 'Employee', getValue: (row) => row.user.name },
  { header: 'Employee code', getValue: (row) => row.user.employeeCode },
  ...leaveMyCsvColumns,
];
