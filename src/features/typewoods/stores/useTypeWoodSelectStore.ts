import { create } from 'zustand'
import { typewoodsService } from '../services/typewoods.service'
import type { TypeWoodApiItem } from '../model/typewoodget.dto'

type State = {
  options:   TypeWoodApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useTypeWoodSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await typewoodsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.typewood_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
