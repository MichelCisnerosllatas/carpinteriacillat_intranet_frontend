import { create } from 'zustand'
import { proformaTemplatesService } from '../services/proforma-templates.service'
import type { ProformaTemplateApiItem } from '../model/proformatemplateget.dto'

type State = {
  options: ProformaTemplateApiItem[]
  isLoading: boolean
  isError: boolean
}

type Action = {
  load: () => Promise<void>
}

export const useProformaTemplateSelectStore = create<State & Action>((set, get) => ({
  options: [],
  isLoading: false,
  isError: false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await proformaTemplatesService.getForSelect()
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
