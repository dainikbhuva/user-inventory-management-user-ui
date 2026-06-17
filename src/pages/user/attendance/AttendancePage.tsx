import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { attendanceService } from '../../../services/attendance.service';
import type { DailyAttendanceRow, MyTodayAttendance } from '../../../shared/types/attendance.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

const todayIso = () => new Date().toISOString().slice(0, 10);

type TabKey = 'my' | 'team';

const formatTime = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const statusLabel = (status: DailyAttendanceRow['status']) => {
  if (status === 'unmarked') return 'Not marked';
  if (status === 'half_day') return 'Half day';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const statusClass = (status: DailyAttendanceRow['status']) => {
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

const MyAttendancePanel = () => {
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
    return <div className="flex h-48 items-center justify-center text-muted">Loading your attendance...</div>;
  }

  if (!data) return null;

  const record = data.record;

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-base bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">Today — {data.date}</p>
            <h3 className="mt-1 text-xl font-semibold text-body">
              {data.isHoliday
                ? data.holidayName ?? 'Holiday'
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
                ? 'Attendance check-in is disabled on company holidays.'
                : data.scheduleMode === 'shift' && !data.hasShiftAssignment
                  ? 'Choose a shift below to enable check-in.'
                  : `Hours: ${data.effectiveStartTime} – ${data.effectiveEndTime}${
                      data.shiftSource === 'employee' ? ' (your shift)' : ''
                    } · Late after ${data.settings.lateAfterMinutes} min`}
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
          <div className="flex flex-wrap gap-2">
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

        {record && (
          <div className="mt-5 grid gap-3 border-t border-base pt-5 sm:grid-cols-4">
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
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(record.status)}`}>
                {statusLabel(record.status)}
              </span>
            </div>
          </div>
        )}

        {!record && data.isWorkingDay && !data.isWeeklyOff && !data.isHoliday && data.hasShiftAssignment && (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Clock className="h-4 w-4" />
            You have not checked in yet today.
          </p>
        )}
      </div>
    </div>
  );
};

const TeamAttendancePanel = () => {
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
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
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance'));
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

  const markedCount = useMemo(
    () => summary.present + summary.absent + summary.late + summary.half_day,
    [summary]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-muted">HR view — daily attendance for all employees</p>
        <div className="w-full max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-body">Date</label>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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
        {summary.total > 0 ? Math.round((markedCount / summary.total) * 100) : 0}% marked for {selectedDate}
      </p>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted">Loading team sheet...</div>
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
                  <th className="px-4 py-3 text-center">HR action</th>
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
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.status !== 'absent' && (
                        <button
                          type="button"
                          disabled={markingUserId === row.user.id}
                          onClick={() => handleMarkAbsent(row.user.id)}
                          className="rounded-sm border border-base px-2 py-1 text-xs text-red-500 transition hover:bg-red-500/10"
                        >
                          Mark absent
                        </button>
                      )}
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

export const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('my');

  return (
    <UserLayout title="Attendance" subtitle="Check in/out and manage team attendance">
      <div className="mb-5 inline-flex rounded-sm border border-base p-0.5">
        {([
          { key: 'my', label: 'My attendance' },
          { key: 'team', label: 'Team attendance' },
        ] as const).map((tab) => (
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

      {activeTab === 'my' ? <MyAttendancePanel /> : <TeamAttendancePanel />}
    </UserLayout>
  );
};
