import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { UserForm, type UserFormValues } from './UserForm';
import { portalUserService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import { departmentService, designationService } from '../../../services/master.service';
import type { PortalRole, PortalUserRecord, PortalMasterRecord, UserGender } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { getUserValidationSchema } from '../../../shared/validation/user.validation';
import { shiftService } from '../../../services/shift.service';
import type { PortalShiftRecord } from '../../../shared/types/shift.types';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

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
  const [departments, setDepartments] = useState<PortalMasterRecord[]>([]);
  const [designations, setDesignations] = useState<PortalMasterRecord[]>([]);
  const [managers, setManagers] = useState<PortalUserRecord[]>([]);
  const [shifts, setShifts] = useState<PortalShiftRecord[]>([]);
  const [form, setForm] = useState<UserFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, clearFieldError, clearErrors, validateFields, applyApiErrors } =
    useFormValidation<UserFormValues>();

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const [user, roleList, deptList, desigList, userList, shiftList] = await Promise.all([
          portalUserService.getUser(userId),
          roleService.getActiveRoles(),
          departmentService.getActive(),
          designationService.getActive(),
          portalUserService.getUsers(),
          shiftService.getActive(),
        ]);
        setRoles(roleList);
        setDepartments(deptList);
        setDesignations(desigList);
        setManagers(userList);
        setShifts(shiftList);
        setForm({
          employeeCode: user.employeeCode,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? '',
          roleId: user.role.id,
          departmentId: user.departmentId ?? '',
          designationId: user.designationId ?? '',
          employeeType: user.employeeType ?? '',
          reportingManagerId: user.reportingManager?.id ?? '',
          defaultShiftId: user.defaultShiftId ?? '',
          joiningDate: toDateInput(user.joiningDate),
          gender: (user.gender ?? '') as '' | UserGender,
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
    if (!userId || !form) return;
    clearErrors();

    if (!validateFields(form, getUserValidationSchema({ requireEmployeeCode: false }))) {
      toast.warning('Please fix the highlighted fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await portalUserService.updateUser(userId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        roleId: form.roleId,
        departmentId: form.departmentId || null,
        designationId: form.designationId || null,
        employeeType: form.employeeType || null,
        reportingManagerId: form.reportingManagerId || null,
        defaultShiftId: form.defaultShiftId || null,
        joiningDate: form.joiningDate || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address.trim() || undefined,
        status: form.status,
      });
      toast.success('User updated successfully.');
      navigate(listPath);
    } catch (err) {
      toast.error(applyApiErrors(err, 'Failed to update user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !form) {
    return (
      <UserLayout title="Edit User" subtitle="Loading user details...">
        <div className="flex h-48 w-full items-center justify-center text-muted">Loading...</div>
      </UserLayout>
    );
  }

  return (
    <ModulePermissionGuard moduleCode={moduleCode!} itemCode={itemCode} action="edit" moduleLabel="Users">
    <UserLayout title="Edit User" subtitle="Update employee portal account">
      <div className="mb-5">
        <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to users
        </Button>
      </div>

      <UserForm
        mode="edit"
        value={form}
        errors={errors}
        roles={roles}
        departments={departments}
        designations={designations}
        managers={managers}
        shifts={shifts}
        excludeManagerId={userId}
        isSubmitting={isSubmitting}
        onChange={setForm}
        onClearFieldError={clearFieldError}
        onCancel={() => navigate(listPath)}
        onSubmit={handleSubmit}
        submitLabel="Update user"
      />
    </UserLayout>
    </ModulePermissionGuard>
  );
};
