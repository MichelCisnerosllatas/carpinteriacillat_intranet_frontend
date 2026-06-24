import { create } from 'zustand'
import { userDevicesService } from '../services/user-devices.service'
import type { UserDeviceListRequestDto } from '../model/userdeviceget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { UserDevice, DeviceType, DevicePlatform } from '../data/schema'
import type { UserDeviceType } from '../model/userdevice.type'

type Filters = UserDeviceListRequestDto

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  devices: UserDevice[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: Filters
  currentDevice: UserDevice | null
}

type Action = {
  load: (params?: Filters) => Promise<boolean>
  revoke: (id: number) => Promise<boolean>
  deleteDevice: (id: number) => Promise<boolean>
  revokeAllByUser: (userId: number) => Promise<boolean>
  deleteAllByUser: (userId: number) => Promise<boolean>
  setCurrentDevice: (device: UserDevice | null) => void
  reset: () => void
}

const defaultFilters: Filters = {
  page: 1,
  per_page: 15,
  search: '',
  is_active: undefined,
  platform: undefined,
  device_type: undefined,
  os: undefined,
  user_id: undefined,
  date_from: '',
  date_to: '',
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
    user: d.user
      ? {
          id: d.user.id,
          email: d.user.email,
          userState: d.user.user_state,
          personName: d.user.person?.person_name ?? '',
          personLastname: d.user.person?.person_lastname ?? '',
          personNumdoc: d.user.person?.person_numdoc ?? null,
          roleName: d.user.role?.role_name ?? '',
        }
      : undefined,
  }
}

export const useUserDeviceListStore = create<State & Action>((set, get) => ({
  hasLoaded: false,
  isInitialLoading: false,
  isFetching: false,
  isError: false,
  message: null,
  devices: [],
  links: null,
  meta: null,
  filters: defaultFilters,
  currentDevice: null,

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }

    set({ filters: nextFilters, isFetching: true, isError: false, message: null })

    try {
      const response = await userDevicesService.getList(nextFilters)

      if (!response.success) {
        throw new Error(response.message || 'No se pudo cargar la lista de dispositivos.')
      }

      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: false,
        message: response.message,
        devices: response.data.map(mapDeviceFromApi),
        links: response.links,
        meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
        },
      })

      return true
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? 'No se pudo cargar la lista de dispositivos.'

      set({
        hasLoaded: true,
        isInitialLoading: false,
        isFetching: false,
        isError: true,
        message,
      })

      return false
    }
  },

  revoke: async (id) => {
    try {
      const ok = await userDevicesService.revoke(id)
      if (ok) {
        set((state) => ({
          devices: state.devices.map((d) =>
            d.id === id ? { ...d, isActive: false } : d
          ),
        }))
      }
      return ok
    } catch {
      return false
    }
  },

  deleteDevice: async (id) => {
    try {
      const ok = await userDevicesService.revoke(id)
      if (ok) {
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
        }))
      }
      return ok
    } catch {
      return false
    }
  },

  revokeAllByUser: async (userId) => {
    const targets = get().devices.filter((d) => d.userId === userId && d.isActive)
    if (targets.length === 0) return true
    const results = await Promise.all(
      targets.map((d) => userDevicesService.revoke(d.id).catch(() => false))
    )
    set((state) => ({
      devices: state.devices.map((d) =>
        d.userId === userId && d.isActive ? { ...d, isActive: false } : d
      ),
    }))
    return results.every(Boolean)
  },

  deleteAllByUser: async (userId) => {
    const targets = get().devices.filter((d) => d.userId === userId)
    if (targets.length === 0) return true
    const results = await Promise.all(
      targets.map((d) => userDevicesService.revoke(d.id).catch(() => false))
    )
    set((state) => ({
      devices: state.devices.filter((d) => d.userId !== userId),
    }))
    return results.every(Boolean)
  },

  setCurrentDevice: (device) => set({ currentDevice: device }),

  reset: () =>
    set({
      hasLoaded: false,
      isInitialLoading: false,
      isFetching: false,
      isError: false,
      message: null,
      devices: [],
      links: null,
      meta: null,
      filters: defaultFilters,
      currentDevice: null,
    }),
}))
