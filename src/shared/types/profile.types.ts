import type { UserGender, EmployeeType } from './portal.types';

export interface ProfileRecord {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  companyId: string;
  companyName: string;
  companyCode: string;
  role: {
    id: string;
    name: string;
    code: string;
  };
  department?: string;
  designation?: string;
  employeeType?: EmployeeType;
  reportingManager?: {
    id: string;
    name: string;
    employeeCode: string;
  };
  joiningDate?: string;
  gender?: UserGender;
  dateOfBirth?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: UserGender | null;
  dateOfBirth?: string | null;
  address?: string;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  gender: '' | UserGender;
  dateOfBirth: string;
  address: string;
}

export const profileToFormValues = (profile: ProfileRecord): ProfileFormValues => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  phone: profile.phone ?? '',
  gender: profile.gender ?? '',
  dateOfBirth: profile.dateOfBirth ?? '',
  address: profile.address ?? '',
});

export const formValuesToPayload = (values: ProfileFormValues): UpdateProfilePayload => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  phone: values.phone.trim() || undefined,
  gender: values.gender || null,
  dateOfBirth: values.dateOfBirth || null,
  address: values.address.trim() || undefined,
});
