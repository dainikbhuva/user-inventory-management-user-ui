import axiosClient from './api/axiosClient'
import { API_ENDPOINTS } from './api/endpoints'
import type { LoginRequest, LoginResponse, ProfileResponse, ApiResponse } from '../shared/types/api.types'
import type { SignupInput } from '../shared/auth/types'

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },

  async register(input: SignupInput): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, input)
    return response.data
  },

  async getProfile(signal?: AbortSignal): Promise<ApiResponse<ProfileResponse>> {
    const response = await axiosClient.get(API_ENDPOINTS.AUTH.PROFILE, { signal })
    return response.data
  },

  async updateProfile(payload: {
    firstName: string
    lastName: string
    phone?: string
    gender?: 'male' | 'female' | 'other' | null
    dateOfBirth?: string | null
    address?: string
  }): Promise<ApiResponse<ProfileResponse>> {
    const response = await axiosClient.put(API_ENDPOINTS.AUTH.PROFILE, payload)
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

  async forgotPassword(email: string): Promise<ApiResponse<{ message?: string; debugOtp?: string }>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    return response.data
  },

  async resendOtp(email: string): Promise<ApiResponse<{ message?: string; debugOtp?: string }>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email })
    return response.data
  },

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<{ resetToken: string }>> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp })
    return response.data
  },

  async resetPassword(payload: {
    email: string
    resetToken: string
    password: string
  }): Promise<ApiResponse> {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload)
    return response.data
  },
}
