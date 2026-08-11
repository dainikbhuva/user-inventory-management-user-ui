export type UserGender = 'male' | 'female' | 'other';

export type EmployeeType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'intern'
  | 'consultant';

export interface PortalUserManager {
  id: string;
  name: string;
  employeeCode: string;
}

export interface PortalMasterRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortalRole {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  isSystem: boolean;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PortalUserRecord {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  departmentId?: string;
  department?: string;
  designationId?: string;
  designation?: string;
  employeeType?: EmployeeType;
  reportingManager?: PortalUserManager;
  defaultShiftId?: string;
  defaultShift?: { id: string; name: string; code: string };
  joiningDate?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  address?: string;
  status: 'active' | 'inactive';
  role: {
    id: string;
    name: string;
    code: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionOption {
  key: string;
  label: string;
  moduleCode: string;
  moduleName: string;
  itemCode?: string;
  groupName: string;
  linkType: 'module-direct' | 'module-dropdown' | 'dropdown-item';
}

export interface CreatePortalUserResult {
  user: PortalUserRecord;

}

export interface CreatePortalUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: string;
  departmentId?: string;
  designationId?: string;
  employeeType?: EmployeeType;
  reportingManagerId?: string;
  defaultShiftId?: string | null;
  joiningDate?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  address?: string;
  password: string;
  confirmPassword?: string;
  employeeCode?: string;
  autoGenerateEmployeeCode?: boolean;
  status: 'active' | 'inactive';
}

export interface UpdatePortalUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  departmentId?: string | null;
  designationId?: string | null;
  employeeType?: EmployeeType | null;
  reportingManagerId?: string | null;
  defaultShiftId?: string | null;
  joiningDate?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  address?: string;
  status?: 'active' | 'inactive';
}
