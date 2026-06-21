import { create } from 'zustand'
import { typecolorsService } from '../services/typecolors.service'
import type { TypeColorApiItem } from '../model/typecolorget.dto'

type State = {
  options:   TypeColorApiItem[]
  isLoading: boolean
  isError:   boolean
  hasLoaded: boolean
}

type Action = {
  load: () => Promise<void>
}

export const useTypeColorSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,
  hasLoaded: false,

  load: async () => {
    if (get().isLoading || get().hasLoaded) return
    set({ isLoading: true, isError: false })
    try {
      const res = await typecolorsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.typecolor_state === 1), isLoading: false, hasLoaded: true })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
