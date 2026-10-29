import { create } from 'zustand'
import { webWorksService } from '../services/web-works.service'
import type { WebWorkApiItem } from '../model/webworkget.dto'

type State = {
  /** Todos los trabajos (visibles y ocultos), en el orden de la galería. */
  options:   WebWorkApiItem[]
  isLoading: boolean
  isError:   boolean
  /** true = load() ignora el caché y vuelve a pedir los datos al servidor. Por defecto false: solo carga una vez (evita golpear el servidor cada vez que se monta el select). */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: () => Promise<void>
}

export const useWebWorkSelectStore = create<State & Action>((set, get) => ({
  options:     [],
  isLoading:   false,
  isError:     false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async () => {
    if (!get().forceReload && (get().isLoading || get().options.length > 0)) return
    set({ isLoading: true, isError: false })
    try {
      const res = await webWorksService.getForSelect()
      if (res.success) {
        set({ options: res.data, isLoading: false, forceReload: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
