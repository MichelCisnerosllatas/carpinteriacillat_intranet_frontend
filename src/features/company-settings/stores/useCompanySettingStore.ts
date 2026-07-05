import { create } from 'zustand'
import { companySettingsService } from '../services/company-settings.service'
import type { CompanySettingApiItem } from '../model/companysettingget.dto'
import type { CompanySettingPatchRequestDto, CompanySettingPutRequestDto } from '../model/companysettingput.dto'
import { getStateOption } from '@/shared/config/entity-states'
import type { CompanySetting } from '../data/schema'

function mapCompanySettingFromApi(item: CompanySettingApiItem): CompanySetting {
  const state = getStateOption(item.status)
  return {
    id: item.id,
    businessName: item.business_name,
    tradeName: item.trade_name,
    taxId: item.tax_id,
    taxAddress: item.tax_address,
    phone: item.phone,
    email: item.email,
    facebook: item.facebook,
    website: item.website,
    logo: item.logo,
    status: item.status,
    statusLabel: state.label,
    statusValue: state.value,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

type State = {
  data: CompanySetting | null
  isLoading: boolean
  isError: boolean
  message: string | null
}

type Action = {
  fetch: () => Promise<boolean>
  update: (payload: CompanySettingPatchRequestDto | CompanySettingPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useCompanySettingStore = create<State & Action>((set) => ({
  data: null,
  isLoading: false,
  isError: false,
  message: null,

  fetch: async () => {
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await companySettingsService.get()
      if (!res.success) {
        set({ isLoading: false, isError: true, message: res.message })
        return false
      }
      set({ isLoading: false, data: mapCompanySettingFromApi(res.data) })
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
      const res = await companySettingsService.patch(payload)
      if (!res.success) {
        set({ isLoading: false, isError: true, message: res.message })
        return false
      }
      set({ isLoading: false, data: mapCompanySettingFromApi(res.data) })
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

  reset: () => set({ data: null, isLoading: false, isError: false, message: null }),
}))
