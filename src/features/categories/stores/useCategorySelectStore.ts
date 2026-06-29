import { create } from 'zustand'
import { categoriesService } from '../services/categories.service'
import type { CategoryApiItem } from '../model/categoryget.dto'

type State = {
  options:   CategoryApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useCategorySelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await categoriesService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.category_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
