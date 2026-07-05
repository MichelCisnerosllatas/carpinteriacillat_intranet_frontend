import { create } from 'zustand'
import { typefontsService } from '../services/typefonts.service'
import type { TypeFontApiItem } from '../model/typefontget.dto'

type State = {
  options:   TypeFontApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useTypeFontSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await typefontsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.typefont_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
