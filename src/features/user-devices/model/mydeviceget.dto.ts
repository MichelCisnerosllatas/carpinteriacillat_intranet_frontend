import type { UserDeviceType } from './userdevice.type'

export type MyDeviceListRequestDto = {
  is_active?: 0 | 1
  per_page?: number
}

export type MyDeviceListResponseDto = {
  success: boolean
  status: number
  message: string
  data: UserDeviceType[]
}

export type MyDeviceRevokeResponseDto = {
  success: boolean
  status: number
  message: string
}
