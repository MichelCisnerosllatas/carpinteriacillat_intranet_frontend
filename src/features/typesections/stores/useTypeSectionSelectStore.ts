import { create } from 'zustand'
import { typesectionsService } from '../services/typesections.service'
import type { TypeSectionApiItem } from '../model/typesectionget.dto'

type State = {
  options:   TypeSectionApiItem[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
}

export const useTypeSectionSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading) return
    set({ isLoading: true, isError: false })
    try {
      const res = await typesectionsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.typesection_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
