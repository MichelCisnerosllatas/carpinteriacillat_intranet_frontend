import { create } from 'zustand'
import { userDevicesService } from '../services/user-devices.service'
import type { UserDevice, DeviceType, DevicePlatform } from '../data/schema'
import type { UserDeviceType } from '../model/userdevice.type'

type State = {
  hasLoaded: boolean
  isLoading: boolean
  isError: boolean
  message: string | null
  devices: UserDevice[]
  isRevoking: number | null
}

type Action = {
  load: (isActive?: 0 | 1) => Promise<boolean>
  revoke: (id: number) => Promise<boolean>
  reset: () => void
}

function normalizeDeviceType(raw: string | null | undefined): DeviceType {
  const valid = ['mobile', 'tablet', 'desktop', 'api', 'unknown'] as const
  return valid.includes(raw as DeviceType) ? (raw as DeviceType) : 'unknown'
}

function normalizePlatform(raw: string | null | undefined): DevicePlatform {
  const valid = ['ios', 'android', 'web', 'desktop', 'unknown'] as const
  return valid.includes(raw as DevicePlatform) ? (raw as DevicePlatform) : 'unknown'
}

function mapDeviceFromApi(d: UserDeviceType): UserDevice {
  return {
    id: d.id,
    userId: d.user_id,
    accessTokenId: d.access_token_id ?? null,
    deviceUuid: d.device_uuid ?? null,
    deviceName: d.device_name ?? null,
    deviceType: normalizeDeviceType(d.device_type),
    platform: normalizePlatform(d.platform),
    os: d.os ?? null,
    osVersion: d.os_version ?? null,
    deviceBrand: d.device_brand ?? null,
    deviceModel: d.device_model ?? null,
    appName: d.app_name ?? null,
    appVersion: d.app_version ?? null,
    browser: d.browser ?? null,
    browserVersion: d.browser_version ?? null,
    ipAddress: d.ip_address ?? null,
    isActive: d.is_active,
    loginAt: d.login_at,
    lastSeenAt: d.last_seen_at ?? null,
    logoutAt: d.logout_at ?? null,
  }
}

export const useMyDevicesStore = create<State & Action>((set, get) => ({
  hasLoaded: false,
  isLoading: false,
  isError: false,
  message: null,
  devices: [],
  isRevoking: null,

  load: async (isActive) => {
    set({ isLoading: true, isError: false, message: null })

    try {
      const response = await userDevicesService.getMyDevices(
        isActive !== undefined ? { is_active: isActive } : undefined
      )

      if (!response.success) {
        throw new Error(response.message || 'No se pudieron cargar tus dispositivos.')
      }

      set({
        hasLoaded: true,
        isLoading: false,
        isError: false,
        devices: response.data.map(mapDeviceFromApi),
      })

      return true
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? 'No se pudieron cargar tus dispositivos.'

      set({ hasLoaded: true, isLoading: false, isError: true, message })
      return false
    }
  },

  revoke: async (id) => {
    set({ isRevoking: id })

    try {
      const response = await userDevicesService.revokeMyDevice(id)

      if (!response.success) {
        throw new Error(response.message || 'No se pudo cerrar la sesión.')
      }

      set((state) => ({
        devices: state.devices.map((d) =>
          d.id === id ? { ...d, isActive: false } : d
        ),
        isRevoking: null,
      }))

      return true
    } catch {
      set({ isRevoking: null })
      return false
    }
  },

  reset: () =>
    set({
      hasLoaded: false,
      isLoading: false,
      isError: false,
      message: null,
      devices: [],
      isRevoking: null,
    }),
}))
