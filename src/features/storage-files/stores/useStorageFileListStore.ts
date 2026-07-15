import { create } from 'zustand'
import { storageFilesService } from '../services/storage-files.service'
import type { StorageFileListRequestDto, StorageFileListMeta } from '../model/storagefile.get.dto'
import type { StorageFile } from '../data/schema'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

type State = {
  items:         StorageFile[]
  links:         LinksPaginationType | null
  meta:          StorageFileListMeta | null
  filters:       StorageFileListRequestDto
  selectedPaths: Set<string>
  hasLoaded:     boolean
  isFetching:    boolean
  isError:       boolean
  message:       string | null
  /** false = load() reutiliza los datos ya cargados (hasLoaded) en vez de pedirlos de nuevo. Por defecto true: la pantalla vuelve a pedir la lista cada vez que se entra a la ruta. */
  forceReload:   boolean
}

type Action = {
  setForceReload: (value: boolean) => void
  load:          (params?: StorageFileListRequestDto) => Promise<boolean>
  navigate:      (path: string | null) => void
  toggleSelect:  (path: string) => void
  selectAll:     () => void
  clearSelection: () => void
  removeItem:    (path: string) => void
  updateItem:    (oldPath: string, updated: StorageFile) => void
  getSelected:   () => StorageFile[]
  reset:         () => void
}

const defaultFilters: StorageFileListRequestDto = { page: 1, per_page: 20 }

export const useStorageFileListStore = create<State & Action>((set, get) => ({
  items: [], links: null, meta: null,
  filters: defaultFilters, selectedPaths: new Set(),
  hasLoaded: false, isFetching: false, isError: false, message: null,
  forceReload: true,

  setForceReload: (value) => set({ forceReload: value }),

  load: async (params = {}) => {
    if (!get().forceReload && get().hasLoaded) return true
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const res = await storageFilesService.getList(nextFilters)
      set({
        hasLoaded:  true,
        isFetching: false,
        items:      res.data ?? [],
        links:      res.links
          ? { ...res.links, first: res.links.first ?? '', last: res.links.last ?? '' }
          : null,
        meta: res.meta ?? null,
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
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar archivos.',
      })
      return false
    }
  },

  navigate: (path) => {
    set({ selectedPaths: new Set() })
    void get().load({ page: 1, path: path ?? undefined, search: undefined, extension: undefined })
  },

  toggleSelect: (path) => {
    const next = new Set(get().selectedPaths)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    set({ selectedPaths: next })
  },

  selectAll: () => {
    set({ selectedPaths: new Set(get().items.map((i) => i.path)) })
  },

  clearSelection: () => set({ selectedPaths: new Set() }),

  removeItem: (path) => {
    set((s) => ({
      items: s.items.filter((i) => i.path !== path),
      selectedPaths: (() => { const n = new Set(s.selectedPaths); n.delete(path); return n })(),
    }))
  },

  updateItem: (oldPath, updated) => {
    set((s) => ({ items: s.items.map((i) => i.path === oldPath ? updated : i) }))
  },

  getSelected: () => {
    const { items, selectedPaths } = get()
    return items.filter((i) => selectedPaths.has(i.path))
  },

  reset: () => set({
    items: [], links: null, meta: null,
    filters: defaultFilters, selectedPaths: new Set(),
    hasLoaded: false, isFetching: false, isError: false, message: null,
  }),
}))
