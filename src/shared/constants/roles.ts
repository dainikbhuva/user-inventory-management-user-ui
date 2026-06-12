// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.MANAGER]: 2,
  [USER_ROLES.VIEWER]: 1,
} as const

// Permission levels
export const PERMISSIONS = {
  // User management
  CREATE_USERS: 'create_users',
  READ_USERS: 'read_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  
  // Inventory management
  CREATE_INVENTORY: 'create_inventory',
  READ_INVENTORY: 'read_inventory',
  UPDATE_INVENTORY: 'update_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  ADJUST_STOCK: 'adjust_stock',
  
  // Reports
  READ_REPORTS: 'read_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings
  READ_SETTINGS: 'read_settings',
  UPDATE_SETTINGS: 'update_settings',
  
  // System
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_TENANT: 'manage_tenant',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: [
    // All permissions for admin
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.READ_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.DELETE_INVENTORY,
    PERMISSIONS.ADJUST_STOCK,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_TENANT,
  ],
  
  [USER_ROLES.MANAGER]: [
    // Manager permissions (no user management, no tenant settings)
    PERMISSIONS.READ_USERS,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.DELETE_INVENTORY,
    PERMISSIONS.ADJUST_STOCK,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
  
  [USER_ROLES.VIEWER]: [
    // Viewer permissions (read-only)
    PERMISSIONS.READ_USERS,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.VIEWER]: 'Viewer',
}

// Role colors for UI
export const ROLE_COLORS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: '#dc2626',
  [USER_ROLES.MANAGER]: '#ea580c',
  [USER_ROLES.VIEWER]: '#16a34a',
}
