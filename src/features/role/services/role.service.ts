import apiClient from '@/shared/api/apiClient'
import { ROLE_ENDPOINTS } from './role.endpoint'
import type { RoleGetResponseDto } from '@/entities/role/model/roleget.dto'

export const roleService = {
  get: async (): Promise<RoleGetResponseDto> => {
    const { data } = await apiClient.get<RoleGetResponseDto>(ROLE_ENDPOINTS.v1.get)
    return data
  },
}
