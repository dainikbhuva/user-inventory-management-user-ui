// API response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  details?: any
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    status: string
  }
  token: string
  refreshToken?: string
}

export interface ProfileResponse {
  user: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    name: string
    email: string
    phone?: string
    status: string
    companyId?: string
    companyName?: string
    companyCode?: string
    role?: {
      id: string
      name: string
      code: string
    }
    department?: string
    designation?: string
    employeeType?: string
    reportingManager?: {
      id: string
      name: string
      employeeCode: string
    }
    joiningDate?: string
    gender?: 'male' | 'female' | 'other'
    dateOfBirth?: string
    address?: string
    createdAt?: string
    updatedAt?: string
  }
}

// User types
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

// App User types
export interface AppUser {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateAppUserData {
  name: string
  email: string
  password: string
  status?: 'active' | 'inactive'
}

export interface UpdateAppUserData {
  name?: string
  email?: string
  password?: string
  status?: 'active' | 'inactive'
}

export type AppUserSortField = 'name' | 'email' | 'status' | 'createdAt'

export interface AppUserFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: AppUserSortField
  sortOrder?: 'asc' | 'desc'
}

export interface AppUserStats {
  total: number
  active: number
  inactive: number
}

export interface DashboardCountBreakdown {
  total: number
  active: number
  inactive: number
}

export interface DashboardStats {
  appUsers: DashboardCountBreakdown
  companies: DashboardCountBreakdown
  portalUsers: DashboardCountBreakdown
  subscriptions: { total: number; active: number }
  plans: DashboardCountBreakdown
  inventory: { totalProducts: number; totalQuantity: number }
  revenue: { activeSubscriptionTotal: number }
}

export type DashboardActivityType = 'app_user' | 'company' | 'portal_user' | 'subscription'

export interface DashboardActivityItem {
  id: string
  type: DashboardActivityType
  label: string
  createdAt: string
}

export interface DashboardOverview {
  stats: DashboardStats
  recentActivity: DashboardActivityItem[]
}

// Module Group types
export interface ModuleGroup {
  id: string
  name: string
  code: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateModuleGroupData {
  name: string
  code: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export interface UpdateModuleGroupData {
  name?: string
  code?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export type ModuleGroupSortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt'

export interface ModuleGroupFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: ModuleGroupSortField
  sortOrder?: 'asc' | 'desc'
}

// Module types
export type ModuleLinkType = 'direct' | 'dropdown'

export interface ModuleGroupRef {
  id: string
  name: string
  code?: string
  status?: 'active' | 'inactive'
}

export interface FeatureModule {
  id: string
  moduleGroupId: string | ModuleGroupRef
  name: string
  code: string
  linkType: ModuleLinkType
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateModuleData {
  moduleGroupId: string
  name: string
  code: string
  linkType?: ModuleLinkType
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export interface UpdateModuleData {
  moduleGroupId?: string
  name?: string
  code?: string
  linkType?: ModuleLinkType
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export type ModuleSortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt'

export interface ModuleFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  moduleGroupId?: string
  linkType?: ModuleLinkType | 'all'
  page?: number
  limit?: number
  sortBy?: ModuleSortField
  sortOrder?: 'asc' | 'desc'
}

// Module Item types
export interface ModuleRef {
  id: string
  name: string
  code?: string
  linkType?: ModuleLinkType
  status?: 'active' | 'inactive'
}

export interface ModuleItem {
  id: string
  moduleId: string | ModuleRef
  name: string
  code: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateModuleItemData {
  moduleId: string
  name: string
  code: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export interface UpdateModuleItemData {
  moduleId?: string
  name?: string
  code?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export type ModuleItemSortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt'

export interface ModuleItemFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  moduleId?: string
  page?: number
  limit?: number
  sortBy?: ModuleItemSortField
  sortOrder?: 'asc' | 'desc'
}

// Country types
export interface Country {
  id: string
  name: string
  code: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateCountryData {
  name: string
  code: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export interface UpdateCountryData {
  name?: string
  code?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export type CountrySortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt'

export interface CountryFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: CountrySortField
  sortOrder?: 'asc' | 'desc'
}

// State types
export interface CountryRef {
  id: string
  name: string
  code?: string
  status?: 'active' | 'inactive'
}

export interface State {
  id: string
  countryId: string | CountryRef
  name: string
  code: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateStateData {
  countryId: string
  name: string
  code: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export interface UpdateStateData {
  countryId?: string
  name?: string
  code?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export type StateSortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt'

export interface StateFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  countryId?: string
  page?: number
  limit?: number
  sortBy?: StateSortField
  sortOrder?: 'asc' | 'desc'
}

// City types
export interface StateRef {
  id: string
  name: string
  code?: string
  status?: 'active' | 'inactive'
}

export interface City {
  id: string
  stateId: string | StateRef
  name: string
  code: string
  sortOrder: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateCityData {
  stateId: string
  name: string
  code: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export interface UpdateCityData {
  stateId?: string
  name?: string
  code?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}

export type CitySortField = 'name' | 'code' | 'sortOrder' | 'status' | 'createdAt'

export interface CityFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  stateId?: string
  page?: number
  limit?: number
  sortBy?: CitySortField
  sortOrder?: 'asc' | 'desc'
}

export type PlanBillingPeriod = 'free_trial' | 'monthly' | 'quarterly' | 'six_months' | 'yearly'

export type PlanSortField =
  | 'name'
  | 'code'
  | 'price'
  | 'finalPrice'
  | 'discount'
  | 'billingPeriod'
  | 'durationMonths'
  | 'status'
  | 'createdAt'

export interface Plan {
  id: string
  name: string
  code: string
  description?: string
  billingPeriod: PlanBillingPeriod
  durationDays?: number
  durationMonths: number
  price: number
  discount: number
  finalPrice: number
  minUsers: number
  moduleGroupIds: string[] | ModuleGroupRef[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreatePlanData {
  name: string
  code: string
  description?: string
  billingPeriod: PlanBillingPeriod
  durationDays?: number
  price: number
  discount?: number
  minUsers?: number
  moduleGroupIds?: string[]
  status?: 'active' | 'inactive'
}

export interface UpdatePlanData {
  name?: string
  code?: string
  description?: string
  billingPeriod?: PlanBillingPeriod
  durationDays?: number
  price?: number
  discount?: number
  minUsers?: number
  moduleGroupIds?: string[]
  status?: 'active' | 'inactive'
}

export interface PlanFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: PlanSortField
  sortOrder?: 'asc' | 'desc'
}

export type CompanySortField = 'name' | 'code' | 'email' | 'status' | 'createdAt'

export interface CompanyRef {
  id: string
  name: string
  code: string
}

export interface PlanRef {
  id: string
  name: string
  code: string
  billingPeriod?: PlanBillingPeriod
  durationDays?: number
  price?: number
  finalPrice?: number
  discount?: number
  minUsers?: number
  durationMonths?: number
}

export interface Company {
  id: string
  name: string
  code: string
  email: string
  phone?: string
  address?: string
  countryId?: string | CountryRef
  stateId?: string | StateRef
  cityId?: string | { id: string; name: string; code?: string }
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyData {
  name: string
  code: string
  email: string
  phone?: string
  address?: string
  countryId?: string
  stateId?: string
  cityId?: string
  status?: 'active' | 'inactive'
}

export interface UpdateCompanyData {
  name?: string
  code?: string
  email?: string
  phone?: string
  address?: string
  countryId?: string
  stateId?: string
  cityId?: string
  status?: 'active' | 'inactive'
}

export interface CompanyFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: CompanySortField
  sortOrder?: 'asc' | 'desc'
}

export type PortalRoleCode = 'super_admin' | 'admin' | 'user'

export interface PortalRole {
  id: string
  companyId: string
  name: string
  code: PortalRoleCode
  status: 'active' | 'inactive'
  isSystem?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PortalUser {
  id: string
  companyId: string
  roleId: string | PortalRole
  name: string
  email: string
  phone?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreatePortalUserData {
  name: string
  email: string
  phone?: string
  password: string
  status?: 'active' | 'inactive'
}

export interface UpdatePortalUserData {
  name?: string
  email?: string
  phone?: string
  password?: string
  status?: 'active' | 'inactive'
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'inactive'
export type SubscriptionSortField = 'startDate' | 'endDate' | 'status' | 'createdAt'

export interface Subscription {
  id: string
  companyId: string | CompanyRef
  planId: string | PlanRef
  seatCount: number
  totalPrice: number
  startDate: string
  endDate?: string
  autoRenew: boolean
  status: SubscriptionStatus
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionData {
  companyId: string
  planId: string
  seatCount: number
  startDate: string
  endDate?: string
  autoRenew?: boolean
  status?: SubscriptionStatus
}

export interface UpdateSubscriptionData {
  companyId?: string
  planId?: string
  seatCount?: number
  startDate?: string
  endDate?: string
  autoRenew?: boolean
  status?: SubscriptionStatus
}

export interface SubscriptionFilters {
  search?: string
  status?: SubscriptionStatus | 'all'
  companyId?: string
  planId?: string
  page?: number
  limit?: number
  sortBy?: SubscriptionSortField
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface ApiError {
  success: false
  message: string
  details?: any
  code?: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRange {
  start: string | null
  end: string | null
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  width?: string
  render?: (value: any, record: T) => React.ReactNode
}

export interface TableAction<T = any> {
  key: string
  label: string
  icon?: React.ReactNode
  onClick: (record: T) => void
  disabled?: (record: T) => boolean
  danger?: boolean
}

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
}

export interface ChartSeries {
  name: string
  data: ChartDataPoint[]
  color?: string
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf'
  dateRange?: DateRange
  filters?: Record<string, any>
  columns?: string[]
}
