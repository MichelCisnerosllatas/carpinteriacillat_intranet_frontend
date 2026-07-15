import { create } from 'zustand'
import { furnituresService } from '../services/furnitures.service'
import type { FurnitureJoinApiItem } from '../model/furniture-api-item.dto'

/**
 * Store para <ModalSelect /> de muebles. Mismo patrón "cargar una vez y
 * cachear" que el resto de useXModalSelectStore, separado del combobox
 * inline (FurnitureSelect) porque este alimenta al modal.
 *
 * Uso: ver features/furnitures/ui/furniture-modal-select-example.tsx
 */
type State = {
  options:   FurnitureJoinApiItem[]
  isLoading: boolean
  isError:   boolean
  /** true = load() ignora el caché y vuelve a pedir los datos al servidor. Por defecto false: solo carga una vez (evita golpear el servidor cada vez que se abre el modal). */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: () => Promise<void>
}

export const useFurnitureModalSelectStore = create<State & Action>((set, get) => ({
  options:     [],
  isLoading:   false,
  isError:     false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async () => {
    if (!get().forceReload && (get().isLoading || get().options.length > 0)) return
    set({ isLoading: true, isError: false })
    try {
      const res = await furnituresService.getForModalSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.furniture_state === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
