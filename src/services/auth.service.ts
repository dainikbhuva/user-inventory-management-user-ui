import axiosClient from './api/axiosClient'
import { API_ENDPOINTS } from './api/endpoints'
import type { LoginRequest, LoginResponse, ProfileResponse, ApiResponse } from '../shared/types/api.types'

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },

  async register(payload: {
    name: string
    email: string
    password: string
    companyCode: string
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, payload)
    return response.data
  },

  async getProfile(signal?: AbortSignal): Promise<ApiResponse<ProfileResponse>> {
    const response = await axiosClient.get(API_ENDPOINTS.AUTH.PROFILE, { signal })
    return response.data
  },

  async changePassword(payload: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload)
    return response.data
  },

  async logout(): Promise<ApiResponse> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, {})
    return response.data
  },
}
