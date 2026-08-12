import { create } from 'zustand'
import { saleSettingsService } from '../services/sale-settings.service'
import type { SaleSettingApiItem } from '../model/salesettingget.dto'
import type { SaleSettingPatchRequestDto, SaleSettingPutRequestDto } from '../model/salesettingput.dto'
import { getStateOption } from '@/shared/config/entity-states'
import type { SaleSetting } from '../data/schema'

function mapSaleSettingFromApi(item: SaleSettingApiItem): SaleSetting {
  const state = getStateOption(item.status)
  return {
    id: item.id,
    igvRate: Number(item.igv_rate),
    igvEnabledDefault: item.igv_enabled_default,
    igvEnabledDefaultBool: item.igv_enabled_default === 1,
    status: item.status,
    statusLabel: state.label,
    statusValue: state.value,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

type State = {
  data: SaleSetting | null
  hasLoaded: boolean
  isLoading: boolean
  isError: boolean
  message: string | null
}

type Action = {
  fetch: () => Promise<boolean>
  update: (payload: SaleSettingPatchRequestDto | SaleSettingPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useSaleSettingStore = create<State & Action>((set, get) => ({
  data: null,
  hasLoaded: false,
  isLoading: false,
  isError: false,
  message: null,

  fetch: async () => {
    if (get().isLoading) return false
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await saleSettingsService.get()
      if (!res.success) {
        set({ isLoading: false, isError: true, message: res.message })
        return false
      }
      set({ isLoading: false, hasLoaded: true, data: mapSaleSettingFromApi(res.data) })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al obtener la configuración.',
      })
      return false
    }
  },

  update: async (payload) => {
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await saleSettingsService.patch(payload)
      if (!res.success) {
        set({ isLoading: false, isError: true, message: res.message })
        return false
      }
      set({ isLoading: false, data: mapSaleSettingFromApi(res.data) })
      return true
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar la configuración.',
      })
      return false
    }
  },

  reset: () => set({ data: null, hasLoaded: false, isLoading: false, isError: false, message: null }),
}))
