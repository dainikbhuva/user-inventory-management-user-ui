// API interceptor for handling authentication and error responses
import { apiService } from '../services/api'
import { isPublicAuthRequest } from './authRequest'

let interceptorInstalled = false

export const setupApiInterceptor = () => {
  if (interceptorInstalled) return
  interceptorInstalled = true

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url.includes('/api/')) {
      const token = apiService.getToken()

      if (token) {
        const headers = new Headers(init?.headers)
        headers.set('Authorization', `Bearer ${token}`)

        init = {
          ...init,
          headers,
        }
      }
    }

    try {
      const response = await originalFetch(input, init)

      if (response.status === 401 && !isPublicAuthRequest(url)) {
        apiService.clearToken()
        window.location.href = '/login'
        return response
      }

      if (!response.ok) {
        const errorData = await response.clone().json().catch(() => ({}))
        console.error('API Error:', errorData)
      }

      return response
    } catch (error) {
      console.error('Network Error:', error)
      throw error
    }
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}

export const isAuthenticated = (): boolean => !!apiService.getToken()

export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Failed to parse stored user:', error)
    return null
  }
}

export const handleLogout = async () => {
  try {
    await apiService.logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    window.location.href = '/login'
  }
}
