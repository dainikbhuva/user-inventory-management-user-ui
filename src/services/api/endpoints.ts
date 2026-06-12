export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/app/auth/login',
    REGISTER: '/app/auth/register',
    LOGOUT: '/app/auth/logout',
    PROFILE: '/app/auth/profile',
    CHANGE_PASSWORD: '/app/auth/change-password',
  },
  MENU: {
    LIST: '/app/menu',
  },
  ROLES: {
    LIST: '/app/roles',
    ACTIVE: '/app/roles/active',
    BY_ID: (id: string) => `/app/roles/${id}`,
  },
  USERS: {
    LIST: '/app/users',
    NEXT_EMPLOYEE_CODE: '/app/users/next-employee-code',
    BY_ID: (id: string) => `/app/users/${id}`,
  },
  PERMISSIONS: {
    LIST: '/app/permissions',
    ROLE: (roleId: string) => `/app/permissions/roles/${roleId}`,
  },
} as const;

export const QUERY_KEYS = {
  AUTH: 'auth',
  MENU: 'menu',
} as const;
