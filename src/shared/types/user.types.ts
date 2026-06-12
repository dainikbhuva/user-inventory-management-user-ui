// User related types
export interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  role: 'admin' | 'manager' | 'viewer'
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'viewer'
  phone?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: 'admin' | 'manager' | 'viewer'
  status?: 'active' | 'inactive'
  phone?: string
}

export interface UserFilters {
  search: string
  status: 'active' | 'inactive' | 'all'
  role: 'admin' | 'manager' | 'viewer' | 'all'
  dateRange?: {
    start: string | null
    end: string | null
  }
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  managers: number
  viewers: number
  recent: number
}

export interface UserPermissions {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  canManageUsers: boolean
  canManageInventory: boolean
  canViewReports: boolean
  canManageSettings: boolean
}

export interface RolePermissions {
  admin: UserPermissions
  manager: UserPermissions
  viewer: UserPermissions
}
