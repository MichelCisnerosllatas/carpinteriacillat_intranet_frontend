import type { RoleType } from '@/entities/role/model/role.type'

export type RolePostRequestDto = {
  role_name: string
  role_description?: string
  role_state: string
  role_created_at: string
}

export type RolePostResponseDto = {
  success: boolean
  status: number
  message: string
  data: RoleType
  errors?: Record<string, string[]>
}
