import { create } from 'zustand'
import { sectionItemsService } from '../services/sectionitems.service'
import type { SectionItemApiItem } from '../model/sectionitemget.dto'

type State = {
  options:   SectionItemApiItem[]
  isLoading: boolean
  isError:   boolean
  /** true = load() ignora el caché y vuelve a pedir los datos al servidor. Por defecto false: solo carga una vez (evita golpear el servidor cada vez que se monta el select). */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (idSection?: number) => Promise<void>
}

export const useSectionItemSelectStore = create<State & Action>((set, get) => ({
  options:     [],
  isLoading:   false,
  isError:     false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (idSection) => {
    if (!get().forceReload && (get().isLoading || get().options.length > 0)) return
    set({ isLoading: true, isError: false })
    try {
      const res = await sectionItemsService.getForSelect(idSection)
      if (res.success) {
        set({ options: res.data.filter((o) => o.sectionitem_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
