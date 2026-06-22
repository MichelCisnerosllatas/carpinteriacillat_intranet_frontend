import { create } from 'zustand'
import { storageService } from '../services/storage.service'
import { enrichStorageFile } from '../data/schema'
import type { StorageListRequestDto, DbImageRecord } from '../model/storage.dto'
import type { EnrichedStorageFile } from '../data/schema'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

type State = {
  items:         EnrichedStorageFile[]
  dbRecords:     DbImageRecord[]
  folders:       string[]
  links:         LinksPaginationType | null
  meta:          MetaPaginationType | null
  filters:       StorageListRequestDto
  search:        string
  selectedPaths: Set<string>
  hasLoaded:     boolean
  isFetching:    boolean
  isLoadingDb:   boolean
  isError:       boolean
  message:       string | null
}

type Action = {
  load:            (params?: StorageListRequestDto) => Promise<boolean>
  loadDbRecords:   () => Promise<void>
  loadFolders:     () => Promise<void>
  setFolder:       (folder: string) => void
  setSearch:       (q: string) => void
  toggleSelect:    (path: string) => void
  selectAll:       () => void
  clearSelection:  () => void
  removeItem:      (path: string) => void
  updateItem:      (oldPath: string, partial: Partial<EnrichedStorageFile>) => void
  getFilteredItems: () => EnrichedStorageFile[]
  getSelectedItems: () => EnrichedStorageFile[]
  reset:           () => void
}

const defaultFilters: StorageListRequestDto = { page: 1, per_page: 24 }

export const useStorageGalleryStore = create<State & Action>((set, get) => ({
  items: [], dbRecords: [], folders: [], links: null, meta: null,
  filters: defaultFilters, search: '', selectedPaths: new Set(),
  hasLoaded: false, isFetching: false, isLoadingDb: false,
  isError: false, message: null,

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const res = await storageService.getAll(nextFilters)
      if (!res.success && res.data?.length === 0) {
        set({ hasLoaded: true, isFetching: false, items: [], links: res.links ?? null, meta: res.meta ?? null })
        return true
      }
      const dbRecords = get().dbRecords
      const enriched  = (res.data ?? []).map((f) => enrichStorageFile(f, dbRecords))
      set({
        hasLoaded: true, isFetching: false, isError: false,
        message: res.message,
        items: enriched,
        links: res.links ?? null,
        meta:  res.meta ?? null,
        filters: {
          ...nextFilters,
          page:     res.meta?.current_page ?? nextFilters.page,
          per_page: res.meta?.per_page ?? nextFilters.per_page,
        },
      })
      return true
    } catch (error: any) {
      set({
        hasLoaded: true, isFetching: false, isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
      return false
    }
  },

  loadDbRecords: async () => {
    set({ isLoadingDb: true })
    try {
      const res = await storageService.getAllDbImages()
      if (res.success) {
        const dbRecords = res.data
        set({ dbRecords, isLoadingDb: false })
        // Re-enrich current items with the new DB records
        const items = get().items.map((f) => enrichStorageFile(f, dbRecords))
        set({ items })
      } else {
        set({ isLoadingDb: false })
      }
    } catch {
      set({ isLoadingDb: false })
    }
  },

  loadFolders: async () => {
    try {
      const res = await storageService.getAll({ per_page: 500, page: 1 })
      if (res.success && res.data?.length > 0) {
        const folderSet = new Set<string>()
        res.data.forEach((f) => {
          const parts = f.path.split('/')
          // parts[0] = "images", parts[last] = filename
          const segments = parts.slice(1, parts.length - 1)
          if (segments.length === 0) {
            folderSet.add('(raíz)')
          } else {
            // Add every intermediate level so the tree is complete
            for (let i = 1; i <= segments.length; i++) {
              folderSet.add(segments.slice(0, i).join('/'))
            }
          }
        })
        set({ folders: Array.from(folderSet).sort() })
      }
    } catch { /* silent */ }
  },

  setFolder: (folder) => {
    const folderParam = folder === '(raíz)' ? '' : folder === 'all' ? '' : folder
    set({ search: '' })
    void get().load({ page: 1, folder: folderParam || undefined })
  },

  setSearch: (q) => set({ search: q }),

  toggleSelect: (path) => {
    const next = new Set(get().selectedPaths)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    set({ selectedPaths: next })
  },

  selectAll: () => {
    const paths = get().getFilteredItems().map((i) => i.path)
    set({ selectedPaths: new Set(paths) })
  },

  clearSelection: () => set({ selectedPaths: new Set() }),

  removeItem: (path) => {
    set((state) => ({
      items: state.items.filter((i) => i.path !== path),
      selectedPaths: (() => { const s = new Set(state.selectedPaths); s.delete(path); return s })(),
    }))
  },

  updateItem: (oldPath, partial) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.path === oldPath ? { ...i, ...partial } : i
      ),
    }))
  },

  getFilteredItems: () => {
    const { items, search } = get()
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((i) => i.filename.toLowerCase().includes(q) || i.path.toLowerCase().includes(q))
  },

  getSelectedItems: () => {
    const { items, selectedPaths } = get()
    return items.filter((i) => selectedPaths.has(i.path))
  },

  reset: () => set({
    items: [], dbRecords: [], folders: [], links: null, meta: null,
    filters: defaultFilters, search: '', selectedPaths: new Set(),
    hasLoaded: false, isFetching: false, isError: false, message: null,
  }),
}))
