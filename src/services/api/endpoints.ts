export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/app/auth/login',
    REGISTER: '/app/auth/register',
    LOGOUT: '/app/auth/logout',
    PROFILE: '/app/auth/profile',
    CHANGE_PASSWORD: '/app/auth/change-password',
    FORGOT_PASSWORD: '/app/auth/forgot-password',
    RESEND_OTP: '/app/auth/resend-otp',
    VERIFY_OTP: '/app/auth/verify-otp',
    RESET_PASSWORD: '/app/auth/reset-password',
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
    DOCUMENTS: (userId: string) => `/app/users/${userId}/documents`,
    DOCUMENT_BY_ID: (userId: string, documentId: string) =>
      `/app/users/${userId}/documents/${documentId}`,
    DOCUMENT_VIEW: (userId: string, documentId: string) =>
      `/app/users/${userId}/documents/${documentId}/view`,
    DOCUMENT_DOWNLOAD: (userId: string, documentId: string) =>
      `/app/users/${userId}/documents/${documentId}/download`,
  },
  PERMISSIONS: {
    LIST: '/app/permissions',
    ME: '/app/permissions/me',
    ROLE: (roleId: string) => `/app/permissions/roles/${roleId}`,
  },
  DEPARTMENTS: {
    LIST: '/app/departments',
    ACTIVE: '/app/departments/active',
    BY_ID: (id: string) => `/app/departments/${id}`,
  },
  DESIGNATIONS: {
    LIST: '/app/designations',
    ACTIVE: '/app/designations/active',
    BY_ID: (id: string) => `/app/designations/${id}`,
  },
  LEAVE_TYPES: {
    LIST: '/app/leave-types',
    ACTIVE: '/app/leave-types/active',
    BY_ID: (id: string) => `/app/leave-types/${id}`,
  },
  LEAVE: {
    LIST: '/app/leave',
    BALANCES: '/app/leave/balances',
    BY_ID: (id: string) => `/app/leave/${id}`,
    REVIEW: (id: string) => `/app/leave/${id}/review`,
    CANCEL: (id: string) => `/app/leave/${id}/cancel`,
  },
  ATTENDANCE: {
    LIST: '/app/attendance',
    MY_TODAY: '/app/attendance/my-today',
    CHECK_IN: '/app/attendance/check-in',
    CHECK_OUT: '/app/attendance/check-out',
    DAILY_SHEET: '/app/attendance/daily-sheet',
    MARK: '/app/attendance/mark',
    SETTINGS: '/app/attendance/settings',
    MY_SHIFT: '/app/attendance/my-shift',
    BY_ID: (id: string) => `/app/attendance/${id}`,
  },
  HOLIDAYS: {
    LIST: '/app/holidays',
    ACTIVE: '/app/holidays/active',
    BY_ID: (id: string) => `/app/holidays/${id}`,
  },
  SHIFTS: {
    LIST: '/app/shifts',
    ACTIVE: '/app/shifts/active',
    BY_ID: (id: string) => `/app/shifts/${id}`,
  },
  ANNOUNCEMENTS: {
    LIST: '/app/announcements',
    FEED: '/app/announcements/feed',
    BY_ID: (id: string) => `/app/announcements/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/app/notifications',
    UNREAD_COUNT: '/app/notifications/unread-count',
    READ_ALL: '/app/notifications/read-all',
    READ: (id: string) => `/app/notifications/${id}/read`,
  },
  SUBSCRIPTION: {
    CURRENT: '/app/subscription/current',
    PLANS: '/app/subscription/plans',
    QUOTE_UPGRADE: '/app/subscription/quote/upgrade',
    QUOTE_RENEW: '/app/subscription/quote/renew',
    UPGRADE: '/app/subscription/upgrade',
    RENEW: '/app/subscription/renew',
    AUTO_RENEW: '/app/subscription/auto-renew',
  },
  PAYMENTS: {
    CHECKOUT: '/app/payments/checkout',
    VERIFY: '/app/payments/verify',
    HISTORY: '/app/payments/history',
  },
} as const;

export const QUERY_KEYS = {
  AUTH: 'auth',
  MENU: 'menu',
} as const;
