export type UserGender = 'male' | 'female' | 'other';

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
  department?: string;
  designation?: string;
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
  itemCode?: string;
  groupName: string;
}

export interface CreatePortalUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  address?: string;
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
  department?: string;
  designation?: string;
  joiningDate?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  address?: string;
  status?: 'active' | 'inactive';
}
