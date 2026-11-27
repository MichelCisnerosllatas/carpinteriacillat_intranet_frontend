import apiClient from '@/shared/api/apiClient'
import { PERMISSIONS_ENDPOINTS } from './permissions.endpoint'
import type { PermissionTreeResponseDto } from '../model/permissiontree.dto'
import type {
  RolePermissionsGetResponseDto,
  RolePermissionsPutRequestDto,
  RolePermissionsPutResponseDto,
} from '../model/rolepermissions.dto'

export const permissionsService = {
  /** Árbol completo de módulos y acciones (intranet + móvil). */
  getTree: async (): Promise<PermissionTreeResponseDto> => {
    const { data } = await apiClient.get<PermissionTreeResponseDto>(PERMISSIONS_ENDPOINTS.v1.tree)
    return data
  },

  /** Keys completas que tiene marcadas un rol. */
  getRolePermissions: async (idRole: number): Promise<RolePermissionsGetResponseDto> => {
    const { data } = await apiClient.get<RolePermissionsGetResponseDto>(
      PERMISSIONS_ENDPOINTS.v1.rolePermissions(idRole)
    )
    return data
  },

  /** Guarda los permisos del rol (reemplaza todos los anteriores). */
  putRolePermissions: async (
    idRole: number,
    param: RolePermissionsPutRequestDto
  ): Promise<RolePermissionsPutResponseDto> => {
    const { data } = await apiClient.put<RolePermissionsPutResponseDto>(
      PERMISSIONS_ENDPOINTS.v1.rolePermissions(idRole),
      param
    )
    return data
  },
}
