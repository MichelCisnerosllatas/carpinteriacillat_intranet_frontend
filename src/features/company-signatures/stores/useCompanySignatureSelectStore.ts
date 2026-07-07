import { create } from 'zustand'
import { companySignaturesService } from '../services/company-signatures.service'
import type { CompanySignatureApiItem } from '../model/companysignatureget.dto'

type State = {
  options: CompanySignatureApiItem[]
  isLoading: boolean
  isError: boolean
}

type Action = {
  load: () => Promise<void>
}

export const useCompanySignatureSelectStore = create<State & Action>((set, get) => ({
  options: [],
  isLoading: false,
  isError: false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await companySignaturesService.getList({ per_page: 100, status: 1 })
      if (res.success) {
        set({ options: res.data, isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
