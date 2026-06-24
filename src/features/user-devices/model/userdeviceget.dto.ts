import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { UserDeviceType } from './userdevice.type'

export type UserDeviceListRequestDto = {
  search?: string
  is_active?: 0 | 1
  platform?: string
  device_type?: string
  os?: string
  user_id?: number
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export type UserDeviceListResponseDto = {
  success: boolean
  status: number
  message: string
  data: UserDeviceType[]
  links: LinksPaginationType
  meta: MetaPaginationType
}

export type UserDeviceGetResponseDto = {
  success: boolean
  status: number
  message: string
  data: UserDeviceType
}
