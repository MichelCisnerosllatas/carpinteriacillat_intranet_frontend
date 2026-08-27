import { create } from 'zustand'
import { proformaNotesService } from '../services/proforma-notes.service'
import type { ProformaNoteListRequestDto, ProformaNoteApiItem } from '../model/proformanoteget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ProformaNote } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ProformaNote[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ProformaNoteListRequestDto
  currentItem: ProformaNote | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load: (params?: ProformaNoteListRequestDto) => Promise<boolean>
  loadByProforma: (proformaId: number) => Promise<boolean>
  setCurrentItem: (item: ProformaNote | null) => void
  reset: () => void
}

const defaultFilters: ProformaNoteListRequestDto = { page: 1, per_page: 50, search: '', proforma_id: undefined }

const mapFromApi = (item: ProformaNoteApiItem): ProformaNote => ({
  id: item.id,
  proformaId: item.proforma_id,
  text: item.text,
  order: item.order,
  createdAt: item.created_at,
  updatedAt: item.updated_at ?? '',
})

export const useProformaNoteListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),
  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await proformaNotesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: { ...nextFilters, page: response.meta?.current_page ?? nextFilters.page, per_page: response.meta?.per_page ?? nextFilters.per_page },
      })
      return true
    } catch (error: any) {
      set({ hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true, message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.' })
      return false
    }
  },

  // Atajo para traer las notas sueltas de una proforma específica.
  loadByProforma: async (proformaId) => {
    return get().load({ proforma_id: proformaId, page: 1, per_page: 100 })
  },

  reset: () => set({ hasLoaded: false, isInitialLoading: false, isFetching: false, isError: false, message: null, items: [], links: null, meta: null, filters: defaultFilters }),
}))
