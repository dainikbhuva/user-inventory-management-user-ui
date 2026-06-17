export const APP_NAME = 'UserPortal';
export const APP_TAGLINE = 'HR & team management workspace';
export const APP_DESCRIPTION =
  'Manage users, roles, attendance, leave, holidays, and company settings in one secure employee portal.';
export const APP_KEYWORDS =
  'user management, HR portal, employee management, attendance, leave management, company workspace';
export const APP_THEME_COLOR = '#2563eb';

export interface PageMeta {
  title: string;
  description?: string;
  robots?: string;
}

export const DEFAULT_PAGE_META: PageMeta = {
  title: 'Dashboard',
  description: APP_DESCRIPTION,
};

const authDescription = `Sign in to ${APP_NAME} — ${APP_TAGLINE}.`;

export const ROUTE_PAGE_META: Record<string, PageMeta> = {
  '/login': {
    title: 'Sign in',
    description: authDescription,
    robots: 'noindex, nofollow',
  },
  '/signup': {
    title: 'Create company account',
    description: `Register your company and Super Admin on ${APP_NAME}. Start with a free trial.`,
    robots: 'index, follow',
  },
  '/forgot-password': {
    title: 'Forgot password',
    description: `Reset your ${APP_NAME} account password with email verification.`,
    robots: 'noindex, nofollow',
  },
  '/verify-otp': {
    title: 'Verify email',
    description: `Enter the verification code sent to your email to reset your ${APP_NAME} password.`,
    robots: 'noindex, nofollow',
  },
  '/reset-password': {
    title: 'Reset password',
    description: `Create a new password for your ${APP_NAME} account.`,
    robots: 'noindex, nofollow',
  },
  '/plan-expired': {
    title: 'Plan expired',
    description: `Your ${APP_NAME} subscription has ended. Renew your plan to restore access.`,
    robots: 'noindex, nofollow',
  },
  '/dashboard': {
    title: 'Dashboard',
    description: `Overview of announcements, plan, and quick access to your ${APP_NAME} workspace.`,
  },
  '/notifications': {
    title: 'Notifications',
    description: 'Company announcements and updates for your account.',
  },
  '/profile': {
    title: 'My profile',
    description: 'View and update your personal profile information.',
  },
  '/change-password': {
    title: 'Change password',
    description: 'Update your account password.',
  },
  '/settings/general': {
    title: 'Appearance settings',
    description: 'Theme, accent color, and display preferences.',
  },
  '/settings/billing': {
    title: 'Plan & billing',
    description: 'Current subscription, renew, upgrade users, and seat usage.',
  },
  '/settings/attendance': {
    title: 'Attendance & shifts',
    description: 'Office hours, working days, and shift templates.',
  },
  '/settings/departments': {
    title: 'Departments',
    description: 'Manage organizational departments.',
  },
  '/settings/designations': {
    title: 'Designations',
    description: 'Manage job titles and designations.',
  },
  '/settings/leave-types': {
    title: 'Leave types',
    description: 'Configure leave categories and allocations.',
  },
  '/settings/holidays': {
    title: 'Holidays',
    description: 'Company holiday calendar and public holidays.',
  },
  '/settings/announcements': {
    title: 'Announcements',
    description: 'Create and manage company-wide announcements.',
  },
};

const MODULE_META: Record<string, PageMeta> = {
  users: { title: 'Users', description: 'Manage employees, roles, and user accounts.' },
  roles: { title: 'Roles', description: 'Define roles and access levels for your team.' },
  permissions: { title: 'Role permissions', description: 'Configure module permissions per role.' },
  leave: { title: 'Leave', description: 'Apply for leave and manage leave requests.' },
  'leave-types': { title: 'Leave types', description: 'Configure leave categories and allocations.' },
  attendance: { title: 'Attendance', description: 'Track check-in, check-out, and attendance records.' },
  holidays: { title: 'Holidays', description: 'View company holidays.' },
  departments: { title: 'Departments', description: 'Organizational departments.' },
  designations: { title: 'Designations', description: 'Job titles and designations.' },
  announcements: { title: 'Announcements', description: 'Company announcements and updates.' },
  shifts: { title: 'Shifts', description: 'Shift schedules and templates.' },
  notifications: { title: 'Notifications', description: 'Company announcements and updates.' },
};

export const resolvePageMeta = (pathname: string): PageMeta => {
  const exact = ROUTE_PAGE_META[pathname];
  if (exact) return exact;

  if (pathname.startsWith('/settings/')) {
    return ROUTE_PAGE_META[pathname] ?? {
      title: 'Settings',
      description: 'Company configuration and master data.',
    };
  }

  const segments = pathname.split('/').filter(Boolean);
  const moduleKey = segments[0] ?? '';
  const base = MODULE_META[moduleKey];

  if (segments[2] === 'new') {
    return {
      title: base ? `New ${base.title.replace(/s$/, '')}` : 'Create',
      description: base?.description,
    };
  }

  if (segments[2] === 'edit') {
    return {
      title: base ? `Edit ${base.title.replace(/s$/, '')}` : 'Edit',
      description: base?.description,
    };
  }

  if (segments.length >= 3 && segments[2] && segments[2] !== 'new') {
    return {
      title: base ? `${base.title} profile` : 'Details',
      description: base?.description,
    };
  }

  if (base) return base;

  return DEFAULT_PAGE_META;
};

export const formatDocumentTitle = (pageTitle: string) =>
  pageTitle === 'Dashboard' ? `${APP_NAME} — Dashboard` : `${pageTitle} · ${APP_NAME}`;
