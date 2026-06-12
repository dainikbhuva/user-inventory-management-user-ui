import type { PortalRole, PortalUser } from '../types/api.types'
import { getRecordId } from './recordId'

export const getPortalRoleName = (roleId: PortalUser['roleId']): string => {
  if (typeof roleId === 'string') return roleId
  return roleId.name
}

export const getPortalRoleId = (roleId: PortalUser['roleId']): string => {
  if (typeof roleId === 'string') return roleId
  return getRecordId(roleId as PortalRole & { _id?: string })
}
