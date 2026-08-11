import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Briefcase, Eye, EyeOff, KeyRound, RefreshCw, UserRound } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import type { PortalRole, PortalUserRecord, PortalMasterRecord, UserGender, EmployeeType } from '../../../shared/types/portal.types';
import { EMPLOYEE_TYPES, EMPLOYEE_TYPE_LABELS } from '../../../shared/constants/employeeType';
import type { PortalShiftRecord } from '../../../shared/types/shift.types';

export interface UserFormValues {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  departmentId: string;
  designationId: string;
  employeeType: '' | EmployeeType;
  reportingManagerId: string;
  defaultShiftId: string;
  joiningDate: string;
  gender: '' | UserGender;
  dateOfBirth: string;
  address: string;
  password: string;
  confirmPassword: string;
  status: 'active' | 'inactive';
}

interface UserFormProps {
  mode: 'create' | 'edit';
  value: UserFormValues;
  errors?: Partial<Record<keyof UserFormValues, string>>;
  roles: PortalRole[];
  departments: PortalMasterRecord[];
  designations: PortalMasterRecord[];
  managers: PortalUserRecord[];
  shifts?: PortalShiftRecord[];
  excludeManagerId?: string;
  isLoadingRoles?: boolean;
  isLoadingDepartments?: boolean;
  isLoadingDesignations?: boolean;
  isLoadingManagers?: boolean;
  isSubmitting?: boolean;
  autoEmployeeCode?: boolean;
  isGeneratingCode?: boolean;
  onChange: (value: UserFormValues) => void;
  onClearFieldError?: (field: keyof UserFormValues) => void;
  onAutoGenerateCode?: () => void;
  onEmployeeCodeManualChange?: () => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  submitLabel?: string;
}

const SectionCard = ({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="w-full rounded-sm border border-base bg-surface shadow-sm">
    <div className="flex items-start gap-3 border-b border-base px-6 py-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-body">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const fieldGrid = 'grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3';
const fullWidthField = 'sm:col-span-2 xl:col-span-3';

export const UserForm = ({
  mode,
  value,
  errors,
  roles,
  departments,
  designations,
  managers,
  shifts = [],
  excludeManagerId,
  isLoadingRoles = false,
  isLoadingDepartments = false,
  isLoadingDesignations = false,
  isLoadingManagers = false,
  isSubmitting = false,
  autoEmployeeCode = false,
  isGeneratingCode = false,
  onChange,
  onClearFieldError,
  onAutoGenerateCode,
  onEmployeeCodeManualChange,
  onCancel,
  onSubmit,
  submitLabel,
}: UserFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isCreate = mode === 'create';
  const set = <K extends keyof UserFormValues>(key: K, val: UserFormValues[K]) =>
    onChange({ ...value, [key]: val });

  const touch = <K extends keyof UserFormValues>(key: K, val: UserFormValues[K]) => {
    onClearFieldError?.(key);
    set(key, val);
  };

  const fieldError = (key: keyof UserFormValues) => errors?.[key];

  const passwordsMatch = Boolean(
    value.confirmPassword && value.password && value.password === value.confirmPassword
  );
  const passwordsMismatch = Boolean(
    value.confirmPassword && value.password && value.password !== value.confirmPassword
  );
  const confirmPasswordError =
    fieldError('confirmPassword') ||
    (passwordsMismatch ? 'Passwords do not match' : undefined);

  const managerOptions = managers.filter(
    (manager) => manager.status === 'active' && manager.id !== excludeManagerId
  );

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-6">
      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard
            icon={<UserRound className="h-4 w-4" />}
            title="Personal information"
            description="Basic contact and identity details for the employee."
          >
            <div className={fieldGrid}>
              {mode === 'edit' ? (
                <FormField label="Employee code" className={fullWidthField}>
                  <Input value={value.employeeCode} disabled readOnly className="bg-surface-2 font-mono" />
                  <p className="mt-1.5 text-xs text-muted">Employee code cannot be edited after creation.</p>
                </FormField>
              ) : null}

              <FormField label="First name" required error={fieldError('firstName')}>
                <Input
                  value={value.firstName}
                  onChange={(e) => touch('firstName', e.target.value)}
                  placeholder="First name"
                  disabled={isSubmitting}
                  error={Boolean(fieldError('firstName'))}
                />
              </FormField>

              <FormField label="Last name" required error={fieldError('lastName')}>
                <Input
                  value={value.lastName}
                  onChange={(e) => touch('lastName', e.target.value)}
                  placeholder="Last name"
                  disabled={isSubmitting}
                  error={Boolean(fieldError('lastName'))}
                />
              </FormField>

              <FormField label="Email" required error={fieldError('email')}>
                <Input
                  type="email"
                  value={value.email}
                  onChange={(e) => touch('email', e.target.value)}
                  placeholder="user@company.com"
                  disabled={isSubmitting}
                  error={Boolean(fieldError('email'))}
                />
              </FormField>

              <FormField label="Mobile" error={fieldError('phone')}>
                <Input
                  value={value.phone}
                  onChange={(e) => touch('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  disabled={isSubmitting}
                  error={Boolean(fieldError('phone'))}
                />
              </FormField>

              <FormField label="Gender">
                <Select
                  value={value.gender}
                  onChange={(e) => set('gender', e.target.value as UserGender | '')}
                  disabled={isSubmitting}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </FormField>

              <FormField label="Date of birth">
                <Input
                  type="date"
                  value={value.dateOfBirth}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Address" className={fullWidthField} error={fieldError('address')}>
                <Input
                  value={value.address}
                  onChange={(e) => touch('address', e.target.value)}
                  placeholder="Street, city, state, postal code"
                  disabled={isSubmitting}
                  error={Boolean(fieldError('address'))}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Briefcase className="h-4 w-4" />}
            title="Employment details"
            description="Role, department, and joining information."
          >
            <div className={fieldGrid}>
              {isCreate ? (
                <FormField label="Employee code" required className="xl:col-span-2" error={fieldError('employeeCode')}>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={value.employeeCode}
                      onChange={(e) => {
                        onEmployeeCodeManualChange?.();
                        touch('employeeCode', e.target.value.toUpperCase());
                      }}
                      placeholder="EMP-COMP-0001"
                      disabled={isSubmitting || autoEmployeeCode}
                      className="flex-1 font-mono"
                      error={Boolean(fieldError('employeeCode'))}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onAutoGenerateCode}
                      disabled={isSubmitting || isGeneratingCode}
                      className="shrink-0"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                      <span className="ml-2">Auto Generate</span>
                    </Button>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Enter manually or auto-generate. Cannot be changed after the user is created.
                  </p>
                </FormField>
              ) : null}

              <FormField label="Role" required className={isCreate ? '' : 'xl:col-span-2'} error={fieldError('roleId')}>
                <Select
                  value={value.roleId}
                  onChange={(e) => touch('roleId', e.target.value)}
                  disabled={isSubmitting || isLoadingRoles}
                  error={Boolean(fieldError('roleId'))}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                      {role.code === 'super_admin' ? ' (max 2 users)' : ''}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Department">
                <Select
                  value={value.departmentId}
                  onChange={(e) => set('departmentId', e.target.value)}
                  disabled={isSubmitting || isLoadingDepartments}
                >
                  <option value="">Select department</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Designation">
                <Select
                  value={value.designationId}
                  onChange={(e) => set('designationId', e.target.value)}
                  disabled={isSubmitting || isLoadingDesignations}
                >
                  <option value="">Select designation</option>
                  {designations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Employee type">
                <Select
                  value={value.employeeType}
                  onChange={(e) => set('employeeType', e.target.value as EmployeeType | '')}
                  disabled={isSubmitting}
                >
                  <option value="">Select employee type</option>
                  {EMPLOYEE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {EMPLOYEE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Reporting manager">
                <Select
                  value={value.reportingManagerId}
                  onChange={(e) => set('reportingManagerId', e.target.value)}
                  disabled={isSubmitting || isLoadingManagers}
                >
                  <option value="">No reporting manager</option>
                  {managerOptions.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} ({manager.employeeCode})
                    </option>
                  ))}
                </Select>
              </FormField>

              {shifts.length > 0 ? (
                <FormField label="Default shift">
                  <Select
                    value={value.defaultShiftId}
                    onChange={(e) => set('defaultShiftId', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">No default shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime}–{shift.endTime})
                      </option>
                    ))}
                  </Select>
                  <p className="mt-1.5 text-xs text-muted">
                    Optional starting shift in shift mode. Employees can change it anytime on the
                    Attendance page.
                  </p>
                </FormField>
              ) : null}

              <FormField label="Joining date">
                <Input
                  type="date"
                  value={value.joiningDate}
                  onChange={(e) => set('joiningDate', e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </SectionCard>
        </div>

        <aside className="flex flex-col gap-6">
          <SectionCard
            icon={<KeyRound className="h-4 w-4" />}
            title="Account"
            description={isCreate ? 'Login credentials and access status.' : 'Portal access status.'}
          >
            <div className="space-y-5">
              <div className="grid w-full gap-5">
                <FormField label="Password" required={isCreate} error={fieldError('password')}>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={value.password}
                      onChange={(e) => touch('password', e.target.value)}
                      placeholder={isCreate ? 'Enter user password' : 'Leave blank to keep current password'}
                      disabled={isSubmitting}
                      error={Boolean(fieldError('password'))}
                      autoComplete={isCreate ? 'new-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>

                <FormField label="Confirm password" required={isCreate} error={confirmPasswordError}>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={value.confirmPassword}
                      onChange={(e) => touch('confirmPassword', e.target.value)}
                      placeholder={isCreate ? 'Confirm user password' : 'Repeat new password'}
                      disabled={isSubmitting}
                      error={Boolean(confirmPasswordError)}
                      autoComplete={isCreate ? 'new-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordsMatch ? (
                    <p className="mt-1 text-xs text-emerald-600">Passwords match.</p>
                  ) : passwordsMismatch ? (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
                  ) : null}
                </FormField>

                <StatusToggle
                  checked={value.status === 'active'}
                  onChange={(checked) => set('status', checked ? 'active' : 'inactive')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-base pt-6 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel ?? (isCreate ? 'Create user' : 'Update user')}
        </Button>
      </div>
    </form>
  );
};
