import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth.store'
import { toast } from '@/shared/utils/toast'
import { API_BASE_URL, API_TIMEOUT } from '@/config/env'
import { isPublicAuthRequest } from '@/utils/authRequest'

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (stored by ApiService)
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Skip user-facing errors for cancelled requests (e.g. React StrictMode cleanup)
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error)
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const requestUrl = originalRequest.url || ''
    const isAuthLogin = isPublicAuthRequest(requestUrl)

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthLogin) {
      originalRequest._retry = true
      
      // Clear auth state and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      useAuthStore.getState().logout()
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    }
    
    // 403 is surfaced by page handlers via getApiErrorMessage — avoid duplicate toasts
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.')
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }
    
    return Promise.reject(error)
  }
)

// Request types
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

// HTTP methods
export const httpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const

export default axiosClient
