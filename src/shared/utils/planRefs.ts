import type { ModuleGroupRef, Plan } from '../types/api.types'
import { getRecordId } from './recordId'

export const getModuleGroupIds = (moduleGroupIds: Plan['moduleGroupIds']): string[] => {
  if (!moduleGroupIds?.length) return []
  if (typeof moduleGroupIds[0] === 'string') return moduleGroupIds as string[]
  return (moduleGroupIds as ModuleGroupRef[]).map((g) => getRecordId(g as ModuleGroupRef & { _id?: string }))
}

export const getModuleGroupNames = (moduleGroupIds: Plan['moduleGroupIds']): string => {
  if (!moduleGroupIds?.length) return '—'
  if (typeof moduleGroupIds[0] === 'string') return `${moduleGroupIds.length} group(s)`
  return (moduleGroupIds as ModuleGroupRef[]).map((g) => g.name).join(', ')
}
