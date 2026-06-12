import type { FeatureModule, ModuleGroupRef, ModuleItem, ModuleRef } from '../types/api.types'
import { getRecordId } from './recordId'

export const getModuleGroupId = (moduleGroupId: FeatureModule['moduleGroupId']): string => {
  if (typeof moduleGroupId === 'string') return moduleGroupId
  return getRecordId(moduleGroupId as ModuleGroupRef & { _id?: string })
}

export const getModuleGroupName = (moduleGroupId: FeatureModule['moduleGroupId']): string => {
  if (typeof moduleGroupId === 'string') return moduleGroupId
  return moduleGroupId.name
}

export const getModuleId = (moduleId: ModuleItem['moduleId']): string => {
  if (typeof moduleId === 'string') return moduleId
  return getRecordId(moduleId as ModuleRef & { _id?: string })
}

export const getModuleName = (moduleId: ModuleItem['moduleId']): string => {
  if (typeof moduleId === 'string') return moduleId
  return moduleId.name
}
