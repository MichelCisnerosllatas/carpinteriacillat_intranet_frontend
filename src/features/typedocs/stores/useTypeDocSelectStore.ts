import { create } from 'zustand'
import { typedocsService } from '../services/typedocs.service'
import type { TypeDocApiItem } from '../model/typedocget.dto'

type State = {
  options:   TypeDocApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useTypeDocSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await typedocsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.typedoc_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
