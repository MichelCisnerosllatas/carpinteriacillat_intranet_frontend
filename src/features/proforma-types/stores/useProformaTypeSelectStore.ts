import { create } from 'zustand'
import { proformaTypesService } from '../services/proforma-types.service'
import type { ProformaTypeApiItem } from '../model/proformatypeget.dto'

type State = {
  options:   ProformaTypeApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useProformaTypeSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await proformaTypesService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.status === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
