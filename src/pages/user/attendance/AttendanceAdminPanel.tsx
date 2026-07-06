import { useCallback, useEffect, useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { TableExportButton } from '../../../components/common/TableExportButton';
import { attendanceService } from '../../../services/attendance.service';
import type { AttendanceSummary, PortalAttendanceRecord } from '../../../shared/types/attendance.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useModulePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';
import { useCsvExport } from '../../../hooks/useCsvExport';
import { adminAttendanceCsvColumns } from '../../../shared/utils/attendanceCsvExport';

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthStartIso = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
};

const formatTime = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const statusClass = (status: PortalAttendanceRecord['status']) => {
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

export const AttendanceAdminPanel = () => {
  const { canExport } = useModulePermissions(
    PORTAL_PERMISSION_MODULES.attendance.moduleCode,
    PORTAL_PERMISSION_MODULES.attendance.itemCode
  );
  const [from, setFrom] = useState(monthStartIso());
  const [to, setTo] = useState(todayIso());
  const [items, setItems] = useState<PortalAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const [records, summaryData] = await Promise.all([
        attendanceService.getRecords({ from, to }),
        attendanceService.getSummary(to),
      ]);
      setItems(records);
      setSummary(summaryData);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance records'));
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportProps = useCsvExport('All Attendance Records', adminAttendanceCsvColumns, items, canExport);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await attendanceService.deleteRecord(id);
      toast.success('Attendance record deleted');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete record'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {summary ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: 'Employees', value: summary.totalEmployees },
            { label: 'Present today', value: summary.presentToday },
            { label: 'Absent today', value: summary.absentToday },
            { label: 'Late today', value: summary.lateToday },
            { label: 'Half day', value: summary.halfDayToday },
          ].map((card) => (
            <div key={card.label} className="rounded-sm border border-base bg-surface p-4">
              <p className="text-xs text-muted">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-body">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-sm border border-base bg-surface p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">From</span>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">To</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        {exportProps.showExport ? (
          <TableExportButton
            onClick={exportProps.onExport}
            disabled={isLoading || exportProps.exportDisabled}
          />
        ) : null}
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted">Loading records...</div>
      ) : items.length === 0 ? (
        <div className="rounded-sm border border-base bg-surface px-5 py-10 text-center text-sm text-muted">
          No attendance records in this date range.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-base bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base bg-surface-2 text-left">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check in</th>
                <th className="px-4 py-3">Check out</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-base last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-body">{row.user.name}</p>
                    <p className="font-mono text-xs text-muted">{row.user.employeeCode}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.date}</td>
                  <td className="px-4 py-3 text-muted">{formatTime(row.checkIn)}</td>
                  <td className="px-4 py-3 text-muted">{formatTime(row.checkOut)}</td>
                  <td className="px-4 py-3 text-muted">{row.totalWorkingHours ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                      {row.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={deletingId === row.id}
                      onClick={() => void handleDelete(row.id)}
                      className="rounded-sm border border-base px-2 py-1 text-xs text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
