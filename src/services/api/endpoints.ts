// API Endpoints - User portal
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/app/auth/login',
    LOGOUT: '/app/auth/logout',
    PROFILE: '/app/auth/profile',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const QUERY_KEYS = {
  AUTH: 'auth',
} as const;
