import { create } from 'zustand'
import { typecolorsService } from '../services/typecolors.service'
import type { TypeColorApiItem } from '../model/typecolorget.dto'

type State = {
  options:   TypeColorApiItem[]
  isLoading: boolean
  isError:   boolean
  /** true = load() ignora el caché y vuelve a pedir los datos al servidor. Por defecto false: solo carga una vez (evita golpear el servidor cada vez que se monta el select). */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: () => Promise<void>
}

export const useTypeColorSelectStore = create<State & Action>((set, get) => ({
  options:     [],
  isLoading:   false,
  isError:     false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async () => {
    if (!get().forceReload && (get().isLoading || get().options.length > 0)) return
    set({ isLoading: true, isError: false })
    try {
      const res = await typecolorsService.getForSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.typecolor_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
