import apiClient from '@/shared/api/apiClient'
import { ROLES_ENDPOINTS } from './roles.endpoint'
import type { RoleListRequestDto, RoleListResponseDto } from '@/features/roles/model/roleget.dto'
import type { RolePostRequestDto, RolePostResponseDto } from '@/features/roles/model/rolepost.dto'
import type { RolePutRequestDto, RolePutResponseDto } from '@/features/roles/model/roleput.dto'
import { RoleGetResponseDto } from '@/entities/role'

export const rolesService = {
  getList: async (param: RoleListRequestDto): Promise<RoleListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    )
    const { data } = await apiClient.get<RoleListResponseDto>(ROLES_ENDPOINTS.v1.get, { params })
    return data
  },

  getForSelect: async (): Promise<RoleGetResponseDto> => {
    const { data } = await apiClient.get<RoleGetResponseDto>(ROLES_ENDPOINTS.v1.get)
    return data
  },


  post: async (param: RolePostRequestDto): Promise<RolePostResponseDto> => {
    const { data } = await apiClient.post<RolePostResponseDto>(ROLES_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: RolePutRequestDto): Promise<RolePutResponseDto> => {
    const { data } = await apiClient.put<RolePutResponseDto>(ROLES_ENDPOINTS.v1.put(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(ROLES_ENDPOINTS.v1.delete(id))
    return data.success
  },
}
