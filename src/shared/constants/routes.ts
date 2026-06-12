// Application routes
export const APP_ROUTES = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Users
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  USER_ROLES: '/users/roles',
  CREATE_USER: '/users/create',
  
  // Inventory
  INVENTORY: '/inventory',
  INVENTORY_DETAIL: (id: string) => `/inventory/${id}`,
  STOCK_ADJUST: '/inventory/adjust',
  INVENTORY_CATEGORIES: '/inventory/categories',
  
  // Companies
  COMPANIES: '/companies',
  COMPANY_DETAIL: (id: string) => `/companies/${id}`,
  CREATE_COMPANY: '/companies/create',
  
  // Plans
  PLANS: '/plans',
  PLAN_DETAIL: (id: string) => `/plans/${id}`,
  CREATE_PLAN: '/plans/create',
  
  // Module Groups
  MODULE_GROUPS: '/module-groups',
  MODULE_GROUP_DETAIL: (id: string) => `/module-groups/${id}`,
  CREATE_MODULE_GROUP: '/module-groups/create',
  
  // Reports
  REPORTS: '/reports',
  SALES_REPORTS: '/reports/sales',
  STOCK_REPORTS: '/reports/stock',
  USER_REPORTS: '/reports/users',
  FINANCIAL_REPORTS: '/reports/financial',
  
  // Settings
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  TENANT: '/settings/tenant',
  BILLING: '/settings/billing',
  PREFERENCES: '/settings/preferences',
  
  // Error pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
} as const

// Route groups for navigation
export const ROUTE_GROUPS = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  USERS: 'users',
  INVENTORY: 'inventory',
  COMPANIES: 'companies',
  PLANS: 'plans',
  MODULE_GROUPS: 'module-groups',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'Dashboard',
    route: APP_ROUTES.DASHBOARD,
    group: ROUTE_GROUPS.DASHBOARD,
    permissions: ['view_dashboard'],
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'Users',
    route: APP_ROUTES.USERS,
    group: ROUTE_GROUPS.USERS,
    permissions: ['read_users'],
    children: [
      {
        key: 'user-roles',
        label: 'User Roles',
        route: APP_ROUTES.USER_ROLES,
        permissions: ['read_users'],
      },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: 'Package',
    route: APP_ROUTES.INVENTORY,
    group: ROUTE_GROUPS.INVENTORY,
    permissions: ['read_inventory'],
    children: [
      {
        key: 'stock-adjust',
        label: 'Stock Adjust',
        route: APP_ROUTES.STOCK_ADJUST,
        permissions: ['adjust_stock'],
      },
      {
        key: 'categories',
        label: 'Categories',
        route: APP_ROUTES.INVENTORY_CATEGORIES,
        permissions: ['read_inventory'],
      },
    ],
  },
  {
    key: 'companies',
    label: 'Companies',
    icon: 'Building',
    route: APP_ROUTES.COMPANIES,
    group: ROUTE_GROUPS.COMPANIES,
    permissions: ['read_companies'],
  },
  {
    key: 'plans',
    label: 'Plans',
    icon: 'CreditCard',
    route: APP_ROUTES.PLANS,
    group: ROUTE_GROUPS.PLANS,
    permissions: ['read_plans'],
  },
  {
    key: 'module-groups',
    label: 'Module Groups',
    icon: 'Layers',
    route: APP_ROUTES.MODULE_GROUPS,
    group: ROUTE_GROUPS.MODULE_GROUPS,
    permissions: ['read_module_groups'],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'BarChart',
    route: APP_ROUTES.REPORTS,
    group: ROUTE_GROUPS.REPORTS,
    permissions: ['read_reports'],
    children: [
      {
        key: 'sales-reports',
        label: 'Sales Reports',
        route: APP_ROUTES.SALES_REPORTS,
        permissions: ['read_reports'],
      },
      {
        key: 'stock-reports',
        label: 'Stock Reports',
        route: APP_ROUTES.STOCK_REPORTS,
        permissions: ['read_reports'],
      },
      {
        key: 'user-reports',
        label: 'User Reports',
        route: APP_ROUTES.USER_REPORTS,
        permissions: ['read_reports'],
      },
      {
        key: 'financial-reports',
        label: 'Financial Reports',
        route: APP_ROUTES.FINANCIAL_REPORTS,
        permissions: ['read_reports'],
      },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: APP_ROUTES.SETTINGS,
    group: ROUTE_GROUPS.SETTINGS,
    permissions: ['read_settings'],
    children: [
      {
        key: 'profile',
        label: 'Profile',
        route: APP_ROUTES.PROFILE,
        permissions: ['read_settings'],
      },
      {
        key: 'tenant',
        label: 'Tenant',
        route: APP_ROUTES.TENANT,
        permissions: ['manage_tenant'],
      },
      {
        key: 'billing',
        label: 'Billing',
        route: APP_ROUTES.BILLING,
        permissions: ['read_settings'],
      },
    ],
  },
] as const

// Public routes (no authentication required)
export const PUBLIC_ROUTES = [
  APP_ROUTES.LOGIN,
  APP_ROUTES.REGISTER,
  APP_ROUTES.FORGOT_PASSWORD,
  APP_ROUTES.VERIFY_OTP,
  APP_ROUTES.RESET_PASSWORD,
  APP_ROUTES.NOT_FOUND,
  APP_ROUTES.UNAUTHORIZED,
] as const

// Protected routes (authentication required)
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  APP_ROUTES.USERS,
  APP_ROUTES.USER_DETAIL,
  APP_ROUTES.USER_ROLES,
  APP_ROUTES.INVENTORY,
  APP_ROUTES.INVENTORY_DETAIL,
  APP_ROUTES.STOCK_ADJUST,
  APP_ROUTES.INVENTORY_CATEGORIES,
  APP_ROUTES.COMPANIES,
  APP_ROUTES.COMPANY_DETAIL,
  APP_ROUTES.PLANS,
  APP_ROUTES.PLAN_DETAIL,
  APP_ROUTES.MODULE_GROUPS,
  APP_ROUTES.MODULE_GROUP_DETAIL,
  APP_ROUTES.REPORTS,
  APP_ROUTES.SALES_REPORTS,
  APP_ROUTES.STOCK_REPORTS,
  APP_ROUTES.USER_REPORTS,
  APP_ROUTES.FINANCIAL_REPORTS,
  APP_ROUTES.SETTINGS,
  APP_ROUTES.PROFILE,
  APP_ROUTES.TENANT,
  APP_ROUTES.BILLING,
] as const
