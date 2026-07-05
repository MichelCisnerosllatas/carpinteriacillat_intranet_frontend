import { create } from 'zustand'
import { companyBankAccountsService } from '../services/company-bank-accounts.service'
import type { CompanyBankAccountPostRequestDto } from '../model/companybankaccountpost.dto'
import type { CompanyBankAccountPutRequestDto } from '../model/companybankaccountput.dto'
import { useCompanyBankAccountListStore } from '@/features/company-bank-accounts/stores/useCompanyBankAccountListStore'

type State = {
  isSubmitting: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  create: (params: CompanyBankAccountPostRequestDto) => Promise<boolean>
  update: (id: number, data: CompanyBankAccountPutRequestDto) => Promise<boolean>
  reset: () => void
}

export const useCompanyBankAccountFormStore = create<State & Action>((set) => ({
  isSubmitting: false, error: null, fieldErrors: null,

  create: async (params) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const res = await companyBankAccountsService.post(params)
      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }

      await useCompanyBankAccountListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al crear.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  update: async (id, data) => {
    set({ isSubmitting: true, error: null, fieldErrors: null })
    try {
      const hasEmpty = Object.values(data).some((v) => v === '' || v === null || v === undefined)
      const res = hasEmpty
        ? await companyBankAccountsService.patch(id, data)
        : await companyBankAccountsService.put(id, data)

      if (!res.success) {
        set({ isSubmitting: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }

      await useCompanyBankAccountListStore.getState().load()
      set({ isSubmitting: false })
      return true
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al actualizar.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },

  reset: () => set({ isSubmitting: false, error: null, fieldErrors: null }),
}))
