import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusToggle } from '../../../components/common/StatusToggle';
import { portalUserService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import type { PortalRole, UserGender } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';

export const UserCreatePage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode } = useParams<{ moduleCode: string; itemCode: string }>();
  const listPath = `/${moduleCode}/${itemCode}`;

  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [autoEmployeeCode, setAutoEmployeeCode] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    department: '',
    designation: '',
    joiningDate: '',
    gender: '' as '' | UserGender,
    dateOfBirth: '',
    address: '',
    employeeCode: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    roleService
      .getActiveRoles()
      .then(setRoles)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load roles')))
      .finally(() => setIsLoadingRoles(false));
  }, []);

  const handleAutoGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      const code = await portalUserService.getNextEmployeeCode();
      setForm((prev) => ({ ...prev, employeeCode: code }));
      setAutoEmployeeCode(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate employee code'));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.roleId) {
      toast.warning('Please fill all required fields.');
      return;
    }

    if (!autoEmployeeCode && !form.employeeCode.trim()) {
      toast.warning('Enter employee code or click Auto Generate.');
      return;
    }

    try {
      setIsSubmitting(true);
      await portalUserService.createUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        roleId: form.roleId,
        department: form.department.trim() || undefined,
        designation: form.designation.trim() || undefined,
        joiningDate: form.joiningDate || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address.trim() || undefined,
        employeeCode: autoEmployeeCode ? undefined : form.employeeCode.trim().toUpperCase(),
        autoGenerateEmployeeCode: autoEmployeeCode,
        status: form.status,
      });
      toast.success('User created. Login password has been sent to their email.');
      navigate(listPath);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout title="Add User" subtitle="Create a new employee portal account">
      <div className="mb-4">
        <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>
          <ArrowLeft className="mr-2 h-4 w-4 inline" />
          Back to users
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold text-body">Personal information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" required>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="First name"
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Last name" required>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Last name"
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="user@company.com"
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Mobile">
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Mobile number"
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Gender">
              <Select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as UserGender | '' }))}
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
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
          <FormField label="Address">
            <Input
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Full address"
              disabled={isSubmitting}
            />
          </FormField>
        </section>

        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold text-body">Employment details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Employee code" required>
              <div className="flex gap-2">
                <Input
                  value={form.employeeCode}
                  onChange={(e) => {
                    setAutoEmployeeCode(false);
                    setForm((p) => ({ ...p, employeeCode: e.target.value.toUpperCase() }));
                  }}
                  placeholder="EMP-COMP-0001"
                  disabled={isSubmitting || autoEmployeeCode}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAutoGenerateCode}
                  disabled={isSubmitting || isGeneratingCode}
                >
                  <RefreshCw className={`h-4 w-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                  <span className="ml-2 hidden sm:inline">Auto Generate</span>
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-muted">Employee code cannot be changed after the user is created.</p>
            </FormField>
            <FormField label="Role" required>
              <Select
                value={form.roleId}
                onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
                disabled={isSubmitting || isLoadingRoles}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Department">
              <Input
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="Department"
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Designation">
              <Input
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                placeholder="Designation"
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Joining date">
              <Input
                type="date"
                value={form.joiningDate}
                onChange={(e) => setForm((p) => ({ ...p, joiningDate: e.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </section>

        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold text-body">Account</h2>
          <div className="rounded-sm bg-primary-soft border border-primary-soft p-4 text-sm text-primary">
            A secure password will be generated automatically and sent to the user&apos;s email address.
          </div>
          <StatusToggle
            checked={form.status === 'active'}
            onChange={(checked) => setForm((p) => ({ ...p, status: checked ? 'active' : 'inactive' }))}
            disabled={isSubmitting}
          />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate(listPath)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create user'}
          </Button>
        </div>
      </form>
    </UserLayout>
  );
};
