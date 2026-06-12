export type PlanBillingPeriod = 'free_trial' | 'monthly' | 'quarterly' | 'six_months' | 'yearly'

export const PLAN_MIN_USERS = 5

export const BILLING_PERIOD_OPTIONS: Array<{
  value: PlanBillingPeriod
  label: string
  durationMonths: number
  durationDays?: number
  hint: string
}> = [
  { value: 'free_trial', label: 'Free Trial', durationMonths: 0, durationDays: 14, hint: '14 days free access' },
  { value: 'monthly', label: 'Monthly', durationMonths: 1, hint: 'Per user · billed every month' },
  { value: 'quarterly', label: '3 Months', durationMonths: 3, hint: 'Per user · billed every 3 months' },
  { value: 'six_months', label: '6 Months', durationMonths: 6, hint: 'Per user · billed every 6 months' },
  { value: 'yearly', label: 'Yearly', durationMonths: 12, hint: 'Per user · billed every year' },
]

export const computeFinalPrice = (pricePerUser: number, discount: number): number => {
  const safeDiscount = Math.min(100, Math.max(0, discount))
  return Math.round(pricePerUser * (1 - safeDiscount / 100))
}

export const computeMonthlyTotal = (pricePerUserAfterDiscount: number, seatCount: number): number =>
  Math.round(pricePerUserAfterDiscount * seatCount)

export const computeBillingPeriodTotal = (
  pricePerUserAfterDiscount: number,
  seatCount: number,
  durationMonths: number
): number => Math.round(pricePerUserAfterDiscount * seatCount * Math.max(durationMonths, 1))

export const getBillingPeriodConfig = (period: PlanBillingPeriod) =>
  BILLING_PERIOD_OPTIONS.find((o) => o.value === period) ?? BILLING_PERIOD_OPTIONS[1]!

export const getBillingPeriodLabel = (period: PlanBillingPeriod, durationDays?: number): string => {
  if (period === 'free_trial') return `Free trial (${durationDays ?? 14} days)`
  return getBillingPeriodConfig(period).label
}

export const formatPlanPrice = (amount: number): string =>
  amount === 0 ? 'Free' : String(Math.round(amount))
