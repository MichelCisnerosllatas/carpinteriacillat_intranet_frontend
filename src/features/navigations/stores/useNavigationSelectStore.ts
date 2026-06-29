import { create } from 'zustand'
import { navigationsService } from '../services/navigations.service'
import type { NavigationApiItem } from '../model/navigationget.dto'

type State = {
  options:   NavigationApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useNavigationSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await navigationsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.navigation_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
