import { create } from 'zustand'
import { imagesService } from '../services/images.service'
import type { StorageFileItem, StorageListRequestDto } from '../model/imagestorage.dto'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'

type State = {
  hasLoaded: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: StorageFileItem[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: StorageListRequestDto
}

type Action = {
  load: (params?: StorageListRequestDto) => Promise<boolean>
  deleteFile: (path: string) => Promise<boolean>
  reset: () => void
}

const defaultFilters: StorageListRequestDto = { page: 1, per_page: 24 }

export const useImageStorageStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isFetching: false, isError: false, message: null,
  items: [], links: null, meta: null, filters: defaultFilters,

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await imagesService.storageAll(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isFetching: false, isError: false,
        message: response.message,
        items: response.data,
        links: response.links,
        meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
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

  deleteFile: async (path: string) => {
    try {
      const res = await imagesService.storageDelete(path)
      if (res.success) {
        set((state) => ({ items: state.items.filter((i) => i.path !== path) }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  reset: () => set({
    hasLoaded: false, isFetching: false, isError: false, message: null,
    items: [], links: null, meta: null, filters: defaultFilters,
  }),
}))
