import { create } from 'zustand'
import { storageFoldersService } from '../services/storage-folders.service'
import type { StorageFolderListRequestDto, StorageFolderListMeta, StorageFolderBreadcrumbItem } from '../model/storagefolder.get.dto'
import type { StorageFolder } from '../data/schema'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

type State = {
  items:      StorageFolder[]
  links:      LinksPaginationType | null
  meta:       StorageFolderListMeta | null
  filters:    StorageFolderListRequestDto
  breadcrumb: StorageFolderBreadcrumbItem[]
  hasLoaded:  boolean
  isFetching: boolean
  isError:    boolean
  message:    string | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload: boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load:       (params?: StorageFolderListRequestDto) => Promise<boolean>
  navigate:   (path: string | null) => void
  reset:      () => void
}

const defaultFilters: StorageFolderListRequestDto = { page: 1, per_page: 20 }

export const useStorageFolderListStore = create<State & Action>((set, get) => ({
  items: [], links: null, meta: null,
  filters: defaultFilters, breadcrumb: [],
  hasLoaded: false, isFetching: false, isError: false, message: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (params = {}) => {
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const res = await storageFoldersService.getList(nextFilters)
      set({
        hasLoaded:  true,
        isFetching: false,
        items:      res.data ?? [],
        links:      res.links ? { ...res.links, first: res.links.first ?? '', last: res.links.last ?? '' } : null,
        meta:       res.meta ?? null,
        breadcrumb: res.meta?.breadcrumb ?? [],
        filters: {
          ...nextFilters,
          page:     res.meta?.current_page ?? nextFilters.page,
          per_page: res.meta?.per_page     ?? nextFilters.per_page,
        },
      })
      return true
    } catch (error: any) {
      set({
        hasLoaded: true, isFetching: false, isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar carpetas.',
      })
      return false
    }
  },

  navigate: (path) => {
    void get().load({ page: 1, path: path ?? undefined, search: undefined })
  },

  reset: () => set({
    items: [], links: null, meta: null,
    filters: defaultFilters, breadcrumb: [],
    hasLoaded: false, isFetching: false, isError: false, message: null,
  }),
}))
