import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FormField } from '../../../components/ui/FormField';
import { attendanceService } from '../../../services/attendance.service';
import type { AttendanceSettings } from '../../../shared/types/attendance.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { ShiftDefinitionsPanel } from './ShiftDefinitionsPanel';
import { usePermissions } from '../../../shared/permissions/PermissionContext';
import { PORTAL_PERMISSION_MODULES } from '../../../shared/constants/portalPermissionModules';

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const toggleDay = (days: number[], day: number) =>
  days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort();

export const SettingsAttendancePage = () => {
  const { can, isLoading: permsLoading } = usePermissions();
  const attendance = PORTAL_PERMISSION_MODULES.attendance;
  const shifts = PORTAL_PERMISSION_MODULES.shifts;
  const canViewAttendance = can(attendance.moduleCode, 'view', attendance.itemCode);
  const canEditAttendance = can(attendance.moduleCode, 'edit', attendance.itemCode);
  const canViewShifts = can(shifts.moduleCode, 'view', shifts.itemCode);

  const [form, setForm] = useState<AttendanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!canViewAttendance) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const settings = await attendanceService.getSettings();
      setForm(settings);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load attendance settings'));
    } finally {
      setIsLoading(false);
    }
  }, [canViewAttendance]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !canEditAttendance) return;
    try {
      setIsSaving(true);
      const updated = await attendanceService.updateSettings(form);
      setForm(updated);
      toast.success('Attendance settings saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save attendance settings'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!permsLoading && !canViewAttendance && !canViewShifts) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-base bg-surface text-muted">
        You do not have permission to view attendance or shift settings.
      </div>
    );
  }

  if (canViewAttendance && (isLoading || !form)) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-base bg-surface text-muted">
        Loading attendance settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canViewAttendance && form ? (
      <form onSubmit={handleSubmit} className="rounded-sm border border-base bg-surface shadow-sm">
      <div className="border-b border-base px-6 py-4">
        <h2 className="text-lg font-semibold text-body">Attendance & shifts</h2>
        <p className="mt-1 text-sm text-muted">
          Set company-wide hours or define shift templates. Employees choose their shift on the
          Attendance page when shift mode is enabled.
        </p>
      </div>

      <div className="border-b border-base px-6 py-5">
        <p className="text-sm font-semibold text-body">Schedule mode</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {([
            {
              value: 'company' as const,
              label: 'Company hours',
              hint: 'Same start/end time for all staff (e.g. 9 AM – 6 PM).',
            },
            {
              value: 'shift' as const,
              label: 'Shift-based',
              hint: 'Employees pick from shift templates you define below.',
            },
          ]).map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-sm border p-4 transition ${
                form.scheduleMode === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-base hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="scheduleMode"
                  value={option.value}
                  checked={form.scheduleMode === option.value}
                  onChange={() => setForm((p) => (p ? { ...p, scheduleMode: option.value } : p))}
                  disabled={isSaving}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-body">{option.label}</span>
                  <span className="mt-1 block text-xs text-muted">{option.hint}</span>
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <FormField label="Office start time">
          {form.scheduleMode === 'shift' ? (
            <p className="mb-1 text-xs text-muted">Fallback when no shift is selected.</p>
          ) : null}
          <Input
            type="time"
            value={form.officeStartTime}
            onChange={(e) => setForm((p) => (p ? { ...p, officeStartTime: e.target.value } : p))}
            disabled={isSaving}
          />
        </FormField>
        <FormField label="Office end time">
          {form.scheduleMode === 'shift' ? (
            <p className="mb-1 text-xs text-muted">Fallback when no shift is selected.</p>
          ) : null}
          <Input
            type="time"
            value={form.officeEndTime}
            onChange={(e) => setForm((p) => (p ? { ...p, officeEndTime: e.target.value } : p))}
            disabled={isSaving}
          />
        </FormField>
        <FormField label="Late after (minutes)">
          <Input
            type="number"
            min={0}
            value={form.lateAfterMinutes}
            onChange={(e) =>
              setForm((p) => (p ? { ...p, lateAfterMinutes: Number(e.target.value) || 0 } : p))
            }
            disabled={isSaving}
          />
        </FormField>
        <FormField label="Half day threshold (hours)">
          <Input
            type="number"
            min={0}
            step={0.5}
            value={form.halfDayHours}
            onChange={(e) =>
              setForm((p) => (p ? { ...p, halfDayHours: Number(e.target.value) || 0 } : p))
            }
            disabled={isSaving}
          />
        </FormField>
      </div>

      <div className="space-y-4 border-t border-base px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-body">Working days</p>
          <p className="mt-1 text-xs text-muted">Employees can check in on these days.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                disabled={isSaving}
                onClick={() =>
                  setForm((p) => (p ? { ...p, workingDays: toggleDay(p.workingDays, day.value) } : p))
                }
                className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                  form.workingDays.includes(day.value)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-base text-muted hover:border-primary/40'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-body">Weekly off days</p>
          <p className="mt-1 text-xs text-muted">Check-in is disabled on these days.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                disabled={isSaving}
                onClick={() =>
                  setForm((p) => (p ? { ...p, weeklyOffDays: toggleDay(p.weeklyOffDays, day.value) } : p))
                }
                className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                  form.weeklyOffDays.includes(day.value)
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700'
                    : 'border-base text-muted hover:border-amber-500/40'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-base px-6 py-4">
        {canEditAttendance ? (
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save settings'}
        </Button>
        ) : (
          <p className="text-sm text-muted">You have view-only access to attendance settings.</p>
        )}
      </div>
      </form>
      ) : null}

      {canViewShifts && (form?.scheduleMode === 'shift' || !canViewAttendance) ? (
        <div className="rounded-sm border border-base bg-surface shadow-sm">
          <ShiftDefinitionsPanel />
        </div>
      ) : null}
    </div>
  );
};
