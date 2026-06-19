import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UserLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/ui/Button';
import { UserForm, type UserFormValues } from './UserForm';
import { portalUserService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import { departmentService, designationService } from '../../../services/master.service';
import type { PortalRole, PortalUserRecord, PortalMasterRecord } from '../../../shared/types/portal.types';
import { toast } from '../../../shared/utils/toast';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { shiftService } from '../../../services/shift.service';
import type { PortalShiftRecord } from '../../../shared/types/shift.types';
import { ModulePermissionGuard } from '../../../components/common/ModulePermissionGuard';

const emptyForm: UserFormValues = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleId: '',
  departmentId: '',
  designationId: '',
  employeeType: '',
  reportingManagerId: '',
  defaultShiftId: '',
  joiningDate: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  status: 'active',
};

export const UserCreatePage = () => {
  const navigate = useNavigate();
  const { moduleCode, itemCode } = useParams<{ moduleCode: string; itemCode: string }>();
  const listPath = `/${moduleCode}/${itemCode}`;

  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [departments, setDepartments] = useState<PortalMasterRecord[]>([]);
  const [designations, setDesignations] = useState<PortalMasterRecord[]>([]);
  const [managers, setManagers] = useState<PortalUserRecord[]>([]);
  const [shifts, setShifts] = useState<PortalShiftRecord[]>([]);
  const [form, setForm] = useState<UserFormValues>(emptyForm);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(true);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [autoEmployeeCode, setAutoEmployeeCode] = useState(false);

  useEffect(() => {
    roleService
      .getActiveRoles()
      .then(setRoles)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load roles')))
      .finally(() => setIsLoadingRoles(false));

    departmentService
      .getActive()
      .then(setDepartments)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load departments')))
      .finally(() => setIsLoadingDepartments(false));

    designationService
      .getActive()
      .then(setDesignations)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load designations')))
      .finally(() => setIsLoadingDesignations(false));

    portalUserService
      .getUsers()
      .then(setManagers)
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load managers')))
      .finally(() => setIsLoadingManagers(false));

    shiftService
      .getActive()
      .then(setShifts)
      .catch(() => setShifts([]));
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
      const result = await portalUserService.createUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        roleId: form.roleId,
        departmentId: form.departmentId || undefined,
        designationId: form.designationId || undefined,
        employeeType: form.employeeType || undefined,
        reportingManagerId: form.reportingManagerId || undefined,
        defaultShiftId: form.defaultShiftId || undefined,
        joiningDate: form.joiningDate || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address.trim() || undefined,
        employeeCode: autoEmployeeCode ? undefined : form.employeeCode.trim().toUpperCase(),
        autoGenerateEmployeeCode: autoEmployeeCode,
        status: form.status,
      });
      if (result.emailSent) {
        toast.success('User created. Login password has been sent to their email.');
      } else {
        toast.success('User created successfully.');
        toast.warning(
          result.emailWarning
            ? `Welcome email could not be sent: ${result.emailWarning}`
            : 'Welcome email could not be sent. Share login credentials with the user manually.'
        );
      }
      navigate(listPath);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create user'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModulePermissionGuard moduleCode={moduleCode!} itemCode={itemCode} action="create" moduleLabel="Users">
    <UserLayout title="Add User" subtitle="Create a new employee portal account">
      <div className="mb-5">
        <Button type="button" variant="secondary" onClick={() => navigate(listPath)}>
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to users
        </Button>
      </div>

      <UserForm
        mode="create"
        value={form}
        roles={roles}
        departments={departments}
        designations={designations}
        managers={managers}
        shifts={shifts}
        isLoadingRoles={isLoadingRoles}
        isLoadingDepartments={isLoadingDepartments}
        isLoadingDesignations={isLoadingDesignations}
        isLoadingManagers={isLoadingManagers}
        isSubmitting={isSubmitting}
        autoEmployeeCode={autoEmployeeCode}
        isGeneratingCode={isGeneratingCode}
        onChange={setForm}
        onAutoGenerateCode={handleAutoGenerateCode}
        onEmployeeCodeManualChange={() => setAutoEmployeeCode(false)}
        onCancel={() => navigate(listPath)}
        onSubmit={handleSubmit}
        submitLabel="Create user"
      />
    </UserLayout>
    </ModulePermissionGuard>
  );
};
