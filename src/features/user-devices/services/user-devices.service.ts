import apiClient from '@/shared/api/apiClient'
import { USER_DEVICES_ENDPOINTS } from './user-devices.endpoint'
import type {
  UserDeviceListRequestDto,
  UserDeviceListResponseDto,
  UserDeviceGetResponseDto,
} from '../model/userdeviceget.dto'
import type { MyDeviceListRequestDto, MyDeviceListResponseDto, MyDeviceRevokeResponseDto } from '../model/mydeviceget.dto'

export const userDevicesService = {
  // ─── Admin ────────────────────────────────────────────────────────────────

  getList: async (params: UserDeviceListRequestDto): Promise<UserDeviceListResponseDto> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<UserDeviceListResponseDto>(
      USER_DEVICES_ENDPOINTS.v1.listJoin,
      { params: cleanParams }
    )
    return data
  },

  getOne: async (id: number): Promise<UserDeviceGetResponseDto> => {
    const { data } = await apiClient.get<UserDeviceGetResponseDto>(
      USER_DEVICES_ENDPOINTS.v1.getJoin(id)
    )
    return data
  },

  revoke: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(USER_DEVICES_ENDPOINTS.v1.revoke(id))
    return data.success
  },

  // ─── My devices ───────────────────────────────────────────────────────────

  getMyDevices: async (params?: MyDeviceListRequestDto): Promise<MyDeviceListResponseDto> => {
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== 0))
      : {}
    const { data } = await apiClient.get<MyDeviceListResponseDto>(
      USER_DEVICES_ENDPOINTS.v1.myDevices,
      { params: cleanParams }
    )
    return data
  },

  revokeMyDevice: async (id: number): Promise<MyDeviceRevokeResponseDto> => {
    const { data } = await apiClient.delete<MyDeviceRevokeResponseDto>(
      USER_DEVICES_ENDPOINTS.v1.revokeMyDevice(id)
    )
    return data
  },
}
