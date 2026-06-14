import type { RoleType } from '@/entities/role/model/role.type'

export type RolePutRequestDto = {
  role_name: string
  role_description: string
  role_state: number
  role_updated_at: string
}

export type RolePutResponseDto = {
  success: boolean
  status: number
  message: string
  data: RoleType
  errors?: Record<string, string[]>
}
