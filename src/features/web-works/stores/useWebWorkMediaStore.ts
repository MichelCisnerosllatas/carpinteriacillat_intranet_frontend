import { create } from 'zustand'
import { webWorksService } from '../services/web-works.service'
import type { WebWorkApiItem, WebWorkListRequestDto } from '../model/webworkget.dto'

/**
 * Trabajos con sus fotos (`include=media`: cada item trae `images` y `pairs`).
 * Pensado para otros módulos que necesitan las fotos de los trabajos (fotos automáticas del
 * carrusel «Muebles a medida», selector "Foto de un trabajo" en Sec. Imágenes, etc.).
 *
 * Mismo patrón "cargar una vez y cachear" que los *SelectStore: `load()` no vuelve a pedir si ya
 * hay datos, salvo `setForceReload(true)` o si cambian los filtros.
 */
type MediaFilters = Omit<WebWorkListRequestDto, 'include' | 'page' | 'per_page'>

type State = {
  items:       WebWorkApiItem[]
  filters:     MediaFilters
  isLoading:   boolean
  isError:     boolean
  hasLoaded:   boolean
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  /** Ej: load({ state: 1 }) → solo publicados; load({ id_category: 3 }) → de esa categoría. */
  load: (filters?: MediaFilters) => Promise<void>
}

const sameFilters = (a: MediaFilters, b: MediaFilters) => JSON.stringify(a) === JSON.stringify(b)

export const useWebWorkMediaStore = create<State & Action>((set, get) => ({
  items:       [],
  filters:     {},
  isLoading:   false,
  isError:     false,
  hasLoaded:   false,
  forceReload: false,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (filters = {}) => {
    const s = get()
    if (s.isLoading) return
    if (!s.forceReload && s.hasLoaded && sameFilters(s.filters, filters)) return
    set({ isLoading: true, isError: false, filters })
    try {
      const res = await webWorksService.getMediaList(filters)
      if (res.success) set({ items: res.data, isLoading: false, hasLoaded: true, forceReload: false })
      else set({ isError: true, isLoading: false })
    } catch {
      set({ isError: true, isLoading: false })
    }
  },
}))
