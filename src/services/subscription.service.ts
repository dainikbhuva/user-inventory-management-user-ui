import axiosClient from './api/axiosClient'
import { API_ENDPOINTS } from './api/endpoints'
import type { ApiResponse } from '../shared/types/api.types'
import type { PlanBillingPeriod } from '../shared/utils/planBilling'

export interface PortalPlanSummary {
  id: string
  name: string
  code: string
  billingPeriod: PlanBillingPeriod
  durationMonths: number
  durationDays?: number
  price: number
  finalPrice: number
  minUsers: number
  description?: string
}

export interface PortalSubscriptionSummary {
  id: string
  status: 'active' | 'expired' | 'cancelled' | 'inactive'
  seatCount: number
  activeUserCount: number
  seatsRemaining: number
  totalPrice: number
  startDate: string
  endDate?: string
  autoRenew: boolean
  isTrial: boolean
  isExpired: boolean
  isExpiringSoon: boolean
  daysRemaining: number
  plan: PortalPlanSummary
}

export interface PortalSubscriptionQuote {
  action: 'upgrade' | 'renew'
  planId: string
  planName: string
  billingPeriod: PlanBillingPeriod
  seatCount: number
  monthlyTotal: number
  periodPrice: number
  amountDue: number
  remainingDays?: number
  remainingFraction?: number
  currentRemainingValue?: number
  nextRemainingValue?: number
  seatDelta?: number
  isPlanChange?: boolean
  newEndDate?: string
}

export const subscriptionService = {
  async getCurrent(signal?: AbortSignal): Promise<ApiResponse<PortalSubscriptionSummary | null>> {
    const response = await axiosClient.get(API_ENDPOINTS.SUBSCRIPTION.CURRENT, { signal })
    return response.data
  },

  async getPlans(signal?: AbortSignal): Promise<ApiResponse<PortalPlanSummary[]>> {
    const response = await axiosClient.get(API_ENDPOINTS.SUBSCRIPTION.PLANS, { signal })
    return response.data
  },

  async quoteUpgrade(payload: { planId: string; seatCount: number }): Promise<ApiResponse<PortalSubscriptionQuote>> {
    const response = await axiosClient.post(API_ENDPOINTS.SUBSCRIPTION.QUOTE_UPGRADE, payload)
    return response.data
  },

  async quoteRenew(payload: { planId: string; seatCount: number }): Promise<ApiResponse<PortalSubscriptionQuote>> {
    const response = await axiosClient.post(API_ENDPOINTS.SUBSCRIPTION.QUOTE_RENEW, payload)
    return response.data
  },

  async upgrade(payload: { planId: string; seatCount: number }): Promise<ApiResponse<PortalSubscriptionSummary>> {
    const response = await axiosClient.post(API_ENDPOINTS.SUBSCRIPTION.UPGRADE, payload)
    return response.data
  },

  async renew(payload: {
    planId: string
    seatCount: number
    autoRenew?: boolean
  }): Promise<ApiResponse<PortalSubscriptionSummary>> {
    const response = await axiosClient.post(API_ENDPOINTS.SUBSCRIPTION.RENEW, payload)
    return response.data
  },

  async setAutoRenew(autoRenew: boolean): Promise<ApiResponse<PortalSubscriptionSummary>> {
    const response = await axiosClient.patch(API_ENDPOINTS.SUBSCRIPTION.AUTO_RENEW, { autoRenew })
    return response.data
  },
}
