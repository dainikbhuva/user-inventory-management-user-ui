import type { CompanyRef, PlanRef, Subscription } from '../types/api.types'
import { getRecordId } from './recordId'

export const getCompanyId = (companyId: Subscription['companyId']): string => {
  if (typeof companyId === 'string') return companyId
  return getRecordId(companyId as CompanyRef & { _id?: string })
}

export const getCompanyName = (companyId: Subscription['companyId']): string => {
  if (typeof companyId === 'string') return companyId
  return companyId.name
}

export const getPlanId = (planId: Subscription['planId']): string => {
  if (typeof planId === 'string') return planId
  return getRecordId(planId as PlanRef & { _id?: string })
}

export const getPlanName = (planId: Subscription['planId']): string => {
  if (typeof planId === 'string') return planId
  return planId.name
}
