import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '');

export const UserEditPage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode, userId } = useParams<{
    moduleCode: string;
    itemCode: string;
    userId: string;
  }>();
  const listPath = `/${moduleCode}/${itemCode}`;

  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    employeeCode: '',
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
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const [user, roleList] = await Promise.all([
          portalUserService.getUser(userId),
          roleService.getActiveRoles(),
        ]);
        setRoles(roleList);
        setForm({
          employeeCode: user.employeeCode,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? '',
          roleId: user.role.id,
          department: user.department ?? '',
          designation: user.designation ?? '',
          joiningDate: toDateInput(user.joiningDate),
          gender: user.gender ?? '',
          dateOfBirth: toDateInput(user.dateOfBirth),
          address: user.address ?? '',
          status: user.status,
        });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load user'));
        navigate(listPath);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, listPath, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    try {
      setIsSubmitting(true);
      await portalUserService.updateUser(userId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        roleId: form.roleId,
        department: form.department.trim() || undefined,
        designation: form.designation.trim() || undefined,
        joiningDate: form.joiningDate || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address.trim() || undefined,
        status: form.status,
      });
      toast.success('User updated successfully.');
      navigate(listPath);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <UserLayout title="Edit User" subtitle="Loading user details...">
        <div className="flex h-48 items-center justify-center text-muted">Loading...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Edit User" subtitle="Update employee portal account">
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
            <FormField label="Employee code">
              <Input value={form.employeeCode} disabled readOnly className="bg-surface-2" />
              <p className="mt-1.5 text-xs text-muted">Employee code cannot be edited.</p>
            </FormField>
            <div />
            <FormField label="First name" required>
              <Input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Last name" required>
              <Input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Mobile">
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
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
              disabled={isSubmitting}
            />
          </FormField>
        </section>

        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold text-body">Employment details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Role" required>
              <Select
                value={form.roleId}
                onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Designation">
              <Input
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
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
            {isSubmitting ? 'Saving...' : 'Update user'}
          </Button>
        </div>
      </form>
    </UserLayout>
  );
};
