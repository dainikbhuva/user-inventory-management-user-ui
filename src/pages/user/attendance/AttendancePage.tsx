import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { TableExportButton } from '../../../components/common/TableExportButton';
import { attendanceService } from '../../../services/attendance.service';
import { AttendanceAdminPanel } from './AttendanceAdminPanel';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useCsvExport } from '../../../hooks/useCsvExport';
import {
  myAttendanceHistoryCsvColumns,
  teamAttendanceCsvColumns,
} from '../../../shared/utils/attendanceCsvExport';
import type {
  AttendanceTeamAccess,
  DailyAttendanceRow,
  MyTodayAttendance,
  PortalAttendanceRecord,
} from '../../../shared/types/attendance.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

const todayIso = () => new Date().toISOString().slice(0, 10);

const monthStartIso = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
};

type TabKey = 'today' | 'history' | 'team' | 'admin';

const formatTime = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const statusLabel = (status: DailyAttendanceRow['status'] | PortalAttendanceRecord['status']) => {
  if (status === 'unmarked') return 'Not marked';
  if (status === 'half_day') return 'Half day';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const statusClass = (status: DailyAttendanceRow['status'] | PortalAttendanceRecord['status']) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-500/10 text-emerald-600';
    case 'late':
      return 'bg-amber-500/10 text-amber-700';
    case 'half_day':
      return 'bg-orange-500/10 text-orange-600';
    case 'absent':
      return 'bg-red-500/10 text-red-500';
    default:
      return 'bg-slate-500/10 text-slate-600';
  }
};

const TodayPanel = () => {
  const [data, setData] = useState<MyTodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isSavingShift, setIsSavingShift] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setData(await attendanceService.getMyToday());
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCheckIn = async () => {
    try {
      setIsActing(true);
      await attendanceService.checkIn();
      toast.success('Checked in successfully');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Check-in failed'));
    } finally {
      setIsActing(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsActing(true);
      await attendanceService.checkOut();
      toast.success('Checked out successfully');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Check-out failed'));
    } finally {
      setIsActing(false);
    }
  };

  const handleShiftChange = async (shiftId: string) => {
    if (!shiftId || shiftId === data?.selectedShiftId) return;
    try {
      setIsSavingShift(true);
      const updated = await attendanceService.updateMyShift(shiftId);
      setData(updated);
      toast.success('Shift updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update shift'));
    } finally {
      setIsSavingShift(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-48 items-center justify-center text-muted">Loading today...</div>;
  }

  if (!data) return null;

  const record = data.record;

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-base bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Today — {data.date}</p>
            <h3 className="mt-1 text-xl font-semibold text-body">
              {data.isHoliday
                ? (data.holidayName ?? 'Holiday')
                : data.scheduleMode === 'shift' && !data.hasShiftAssignment
                  ? 'Select your shift'
                  : data.isWeeklyOff
                    ? 'Weekly off'
                    : data.isWorkingDay
                      ? data.shift
                        ? data.shift.name
                        : 'Working day'
                      : 'Non-working day'}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {data.isHoliday
                ? 'Check-in is disabled on holidays.'
                : data.scheduleMode === 'shift' && !data.hasShiftAssignment
                  ? 'Choose a shift to enable check-in.'
                  : `Office hours: ${data.effectiveStartTime} – ${data.effectiveEndTime}`}
            </p>
            {data.scheduleMode === 'shift' && (data.availableShifts?.length ?? 0) > 0 ? (
              <div className="mt-4 max-w-sm">
                <label className="mb-1.5 block text-xs font-medium text-body">My shift</label>
                <Select
                  value={data.selectedShiftId ?? ''}
                  onChange={(e) => void handleShiftChange(e.target.value)}
                  disabled={isSavingShift || isActing}
                >
                  <option value="">Select shift</option>
                  {data.availableShifts!.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime}–{shift.endTime})
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {data.canCheckIn && (
              <Button onClick={handleCheckIn} disabled={isActing}>
                <LogIn className="mr-2 h-4 w-4" />
                Check in
              </Button>
            )}
            {data.canCheckOut && (
              <Button onClick={handleCheckOut} disabled={isActing} variant="secondary">
                <LogOut className="mr-2 h-4 w-4" />
                Check out
              </Button>
            )}
          </div>
        </div>

        {record ? (
          <div className="mt-5 grid gap-3 border-t border-base pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Check in</p>
              <p className="mt-1 font-medium text-body">{formatTime(record.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Check out</p>
              <p className="mt-1 font-medium text-body">{formatTime(record.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Working hours</p>
              <p className="mt-1 font-medium text-body">{record.totalWorkingHours}h</p>
            </div>
            <div>
              <p className="text-xs text-muted">Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(record.status)}`}
              >
                {statusLabel(record.status)}
              </span>
            </div>
          </div>
        ) : (
          data.isWorkingDay &&
          !data.isWeeklyOff &&
          !data.isHoliday &&
          data.hasShiftAssignment && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4" />
              Not checked in yet today.
            </p>
          )
        )}
      </div>
    </div>
  );
};

const HistoryPanel = ({ canExport }: { canExport: boolean }) => {
  const [from, setFrom] = useState(monthStartIso);
  const [to, setTo] = useState(todayIso());
  const [records, setRecords] = useState<PortalAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setRecords(await attendanceService.getMyRecords(from, to));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance history'));
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportProps = useCsvExport('My Attendance History', myAttendanceHistoryCsvColumns, records, canExport);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-body">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-body">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        </div>
        {exportProps.showExport ? (
          <TableExportButton
            onClick={exportProps.onExport}
            disabled={isLoading || exportProps.exportDisabled}
          />
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted">Loading history...</div>
        ) : records.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            No attendance records in this date range.
          </div>
        ) : (
          <div className="theme-scrollbar overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-base bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check in</th>
                  <th className="px-4 py-3">Check out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="border-b border-base last:border-b-0">
                    <td className="px-4 py-3 font-medium text-body">{row.date}</td>
                    <td className="px-4 py-3 text-muted">{formatTime(row.checkIn)}</td>
                    <td className="px-4 py-3 text-muted">{formatTime(row.checkOut)}</td>
                    <td className="px-4 py-3 text-muted">{row.totalWorkingHours}h</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TeamPanel = ({ teamAccess, canExport }: { teamAccess: AttendanceTeamAccess; canExport: boolean }) => {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
  const [scopeLabel, setScopeLabel] = useState(teamAccess.scopeLabel);
  const [canMark, setCanMark] = useState(teamAccess.canMark);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    unmarked: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [markingUserId, setMarkingUserId] = useState<string | null>(null);

  const loadSheet = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      const sheet = await attendanceService.getDailySheet(date);
      setRows(sheet.rows);
      setSummary(sheet.summary);
      setScopeLabel(sheet.meta.scopeLabel);
      setCanMark(sheet.meta.canMark);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load team attendance'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSheet(selectedDate);
  }, [selectedDate, loadSheet]);

  const handleMarkAbsent = async (userId: string) => {
    try {
      setMarkingUserId(userId);
      await attendanceService.markStatus({ userId, date: selectedDate, status: 'absent' });
      await loadSheet(selectedDate);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark absent'));
    } finally {
      setMarkingUserId(null);
    }
  };

  const handleMarkPresent = async (userId: string) => {
    try {
      setMarkingUserId(userId);
      await attendanceService.markStatus({ userId, date: selectedDate, status: 'present' });
      await loadSheet(selectedDate);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark present'));
    } finally {
      setMarkingUserId(null);
    }
  };

  const markedCount = useMemo(
    () => summary.present + summary.absent + summary.late + summary.half_day,
    [summary]
  );

  const exportProps = useCsvExport(
    `Team Attendance ${selectedDate}`,
    teamAttendanceCsvColumns,
    rows,
    canExport
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-muted">
          Showing <span className="font-medium text-body">{scopeLabel}</span> only.
          {!canMark ? ' You can view but not edit team attendance.' : null}
        </p>
        <div className="flex items-end gap-2">
          <div className="w-full max-w-xs">
            <label className="mb-1.5 block text-sm font-medium text-body">Date</label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          {exportProps.showExport ? (
            <TableExportButton
              onClick={exportProps.onExport}
              disabled={isLoading || exportProps.exportDisabled}
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total', value: summary.total },
          { label: 'Present', value: summary.present },
          { label: 'Late', value: summary.late },
          { label: 'Half day', value: summary.half_day },
          { label: 'Absent', value: summary.absent },
          { label: 'Unmarked', value: summary.unmarked },
        ].map((card) => (
          <div key={card.label} className="rounded-sm border border-base bg-surface px-4 py-3">
            <p className="text-xs text-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-body">{card.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted">
        {summary.total > 0 ? Math.round((markedCount / summary.total) * 100) : 0}% marked for{' '}
        {selectedDate}
      </p>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading team sheet...</div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            No team members in your scope for this date.
          </div>
        ) : (
          <div className="theme-scrollbar overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-base bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Check in</th>
                  <th className="px-4 py-3">Check out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Status</th>
                  {canMark ? <th className="px-4 py-3 text-center">Action</th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.user.id} className="border-b border-base last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-body">{row.user.name}</p>
                      <p className="font-mono text-xs text-muted">{row.user.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatTime(row.checkIn)}</td>
                    <td className="px-4 py-3 text-muted">{formatTime(row.checkOut)}</td>
                    <td className="px-4 py-3 text-muted">{row.totalWorkingHours ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    {canMark ? (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {row.status !== 'present' && row.status !== 'late' ? (
                            <button
                              type="button"
                              disabled={markingUserId === row.user.id}
                              onClick={() => handleMarkPresent(row.user.id)}
                              className="rounded-sm border border-base px-2 py-1 text-xs text-emerald-600 transition hover:bg-emerald-500/10"
                            >
                              Mark present
                            </button>
                          ) : null}
                          {row.status !== 'absent' ? (
                            <button
                              type="button"
                              disabled={markingUserId === row.user.id}
                              onClick={() => handleMarkAbsent(row.user.id)}
                              className="rounded-sm border border-base px-2 py-1 text-xs text-red-500 transition hover:bg-red-500/10"
                            >
                              Mark absent
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [teamAccess, setTeamAccess] = useState<AttendanceTeamAccess | null>(null);
  const { canView: canViewAdmin, canExport, isLoading: permsLoading } = useModulePermissions(
    PORTAL_PERMISSION_MODULES.attendance.moduleCode,
    PORTAL_PERMISSION_MODULES.attendance.itemCode
  );

  useEffect(() => {
    const loadTeamAccess = async () => {
      try {
        const access = await attendanceService.getTeamAccess();
        setTeamAccess(access);
      } catch {
        setTeamAccess({
          canView: false,
          canMark: false,
          scope: 'none',
          scopeLabel: '',
        });
      }
    };
    void loadTeamAccess();
  }, []);

  const tabs = useMemo(
    () =>
      [
        { key: 'today' as const, label: 'Today' },
        { key: 'history' as const, label: 'My history' },
        ...(teamAccess?.canView ? [{ key: 'team' as const, label: 'Team attendance' }] : []),
        ...(canViewAdmin ? [{ key: 'admin' as const, label: 'All records' }] : []),
      ],
    [teamAccess?.canView, canViewAdmin]
  );

  useEffect(() => {
    if (activeTab === 'team' && !teamAccess?.canView) {
      setActiveTab('today');
    }
    if (activeTab === 'admin' && !canViewAdmin) {
      setActiveTab('today');
    }
  }, [activeTab, teamAccess?.canView, canViewAdmin]);

  return (
    <UserLayout title="Attendance" subtitle="Check in, view your history, and manage your team">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-body">Attendance</h2>
        <p className="mt-1 text-sm text-muted">
          Use <strong>Today</strong> to check in/out. <strong>My history</strong> shows your past
          records. <strong>Team attendance</strong> is only for managers, HR, or admins.
        </p>
      </div>

      <div className="mb-5 inline-flex flex-wrap rounded-sm border border-base p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-sm px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-primary text-white'
                : 'text-muted hover:bg-surface-2 hover:text-body'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'today' ? <TodayPanel /> : null}
      {activeTab === 'history' ? <HistoryPanel canExport={canExport} /> : null}
      {activeTab === 'team' && teamAccess?.canView ? (
        <TeamPanel teamAccess={teamAccess} canExport={canExport} />
      ) : null}
      {activeTab === 'admin' && canViewAdmin ? (
        permsLoading ? <div className="py-12 text-center text-muted">Loading...</div> : <AttendanceAdminPanel />
      ) : null}
    </UserLayout>
  );
};
