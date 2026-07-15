import { create } from 'zustand'
import { proformaTypesService } from '../services/proforma-types.service'
import type { ProformaTypeApiItem } from '../model/proformatypeget.dto'

/**
 * Store para <ModalSelect /> de tipos de proforma. Mismo patrón "cargar una vez y
 * cachear" que useProformaTypeSelectStore, pero separado porque alimenta al modal
 * (que puede necesitar más columnas/uso distinto al Select inline).
 *
 * Uso: ver features/proforma-types/ui/proforma-type-modal-select-example.tsx
 */
type State = {
  options:   ProformaTypeApiItem[]
  isLoading: boolean
  isError:   boolean
  /** true = load() ignora el caché y vuelve a pedir los datos al servidor. Por defecto false: solo carga una vez (evita golpear el servidor cada vez que se abre el modal). */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: () => Promise<void>
}

export const useProformaTypeModalSelectStore = create<State & Action>((set, get) => ({
  options:     [],
  isLoading:   false,
  isError:     false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async () => {
    if (!get().forceReload && (get().isLoading || get().options.length > 0)) return
    set({ isLoading: true, isError: false })
    try {
      const res = await proformaTypesService.getForModalSelect()
      if (res.success) {
        set({ options: res.data.filter((o) => o.status === 1), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
