import axiosClient from './api/axiosClient'
import { API_ENDPOINTS } from './api/endpoints'
import type { ApiResponse } from '../shared/types/api.types'
import type { PortalSubscriptionQuote } from './subscription.service'

export interface PaymentCheckoutResponse {
  transactionId: string
  orderId: string
  amount: number
  currency: string
  keyId: string
  quote: PortalSubscriptionQuote
}

export interface VerifyPaymentPayload {
  transactionId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface PaymentHistoryRecord {
  _id: string
  amount: number
  status: string
  createdAt: string
  planId?: { name?: string }
}

export const paymentService = {
  async checkout(payload: {
    action: 'upgrade' | 'renew'
    planId: string
    seatCount: number
    autoRenew?: boolean
  }): Promise<ApiResponse<PaymentCheckoutResponse>> {
    const response = await axiosClient.post(API_ENDPOINTS.PAYMENTS.CHECKOUT, payload)
    return response.data
  },

  async verify(payload: VerifyPaymentPayload): Promise<ApiResponse<{ transactionId: string; status: string }>> {
    const response = await axiosClient.post(API_ENDPOINTS.PAYMENTS.VERIFY, payload)
    return response.data
  },

  async getHistory(): Promise<ApiResponse<PaymentHistoryRecord[]>> {
    const response = await axiosClient.get(API_ENDPOINTS.PAYMENTS.HISTORY)
    return response.data
  },
}
