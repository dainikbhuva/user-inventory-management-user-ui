import type { City, CountryRef, State, StateRef } from '../types/api.types'
import { getRecordId } from './recordId'

export const getCountryId = (countryId: State['countryId']): string => {
  if (typeof countryId === 'string') return countryId
  return getRecordId(countryId as CountryRef & { _id?: string })
}

export const getCountryName = (countryId: State['countryId']): string => {
  if (typeof countryId === 'string') return countryId
  return countryId.name
}

export const getStateId = (stateId: City['stateId']): string => {
  if (typeof stateId === 'string') return stateId
  return getRecordId(stateId as StateRef & { _id?: string })
}

export const getStateName = (stateId: City['stateId']): string => {
  if (typeof stateId === 'string') return stateId
  return stateId.name
}
