import { create } from 'zustand'
import { sectionsService } from '../services/sections.service'
import type { SectionApiItem } from '../model/sectionget.dto'

type State = {
  options:   SectionApiItem[]
  isLoading: boolean
  isError:   boolean
  hasLoaded: boolean
}

type Action = {
  load: () => Promise<void>
}

export const useSectionSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,
  hasLoaded: false,

  load: async () => {
    if (get().isLoading || get().hasLoaded) return
    set({ isLoading: true, isError: false })
    try {
      const res = await sectionsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.section_state === 1), isLoading: false, hasLoaded: true })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
