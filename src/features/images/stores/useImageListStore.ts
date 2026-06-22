import { create } from 'zustand'
import { imagesService } from '../services/images.service'
import { getImageUrl } from '../lib/image-url'
import type { ImageListRequestDto, ImageApiItem } from '../model/imageget.dto'
import type { LinksPaginationType } from '@/shared/type/linksPagination.type'
import type { MetaPaginationType } from '@/shared/type/metaPagination.type'
import type { ImageItem } from '../data/schema'

type State = {
  hasLoaded: boolean
  isInitialLoading: boolean
  isFetching: boolean
  isError: boolean
  message: string | null
  items: ImageItem[]
  links: LinksPaginationType | null
  meta: MetaPaginationType | null
  filters: ImageListRequestDto
  currentItem: ImageItem | null
}

type Action = {
  load: (params?: ImageListRequestDto) => Promise<boolean>
  setCurrentItem: (item: ImageItem | null) => void
  reset: () => void
}

const defaultFilters: ImageListRequestDto = { page: 1, per_page: 20 }

const mapFromApi = (item: ImageApiItem): ImageItem => ({
  id: item.id_image,
  name: item.image_name,
  title: item.image_title,
  alt: item.image_alt,
  patch: item.image_patch,
  url: getImageUrl(item.image_patch),
  type: item.image_type,
  size: item.image_size,
  width: item.image_width,
  height: item.image_height,
  createdAt: item.image_created_at,
  updatedAt: item.image_updated_at,
})

export const useImageListStore = create<State & Action>((set, get) => ({
  hasLoaded: false, isInitialLoading: false, isFetching: false,
  isError: false, message: null, items: [], links: null, meta: null,
  filters: defaultFilters, currentItem: null,

  setCurrentItem: (item) => set({ currentItem: item }),

  load: async (params = {}) => {
    const nextFilters = { ...get().filters, ...params }
    set({ filters: nextFilters, isFetching: true, isError: false, message: null })
    try {
      const response = await imagesService.getList(nextFilters)
      if (!response.success) throw new Error(response.message)
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: false,
        message: response.message,
        items: response.data.map(mapFromApi),
        links: response.links, meta: response.meta,
        filters: {
          ...nextFilters,
          page: response.meta?.current_page ?? nextFilters.page,
          per_page: response.meta?.per_page ?? nextFilters.per_page,
        },
      })
      return true
    } catch (error: any) {
      set({
        hasLoaded: true, isInitialLoading: false, isFetching: false, isError: true,
        message: error?.response?.data?.message ?? error?.message ?? 'Error al cargar.',
      })
      return false
    }
  },

  reset: () => set({
    hasLoaded: false, isInitialLoading: false, isFetching: false,
    isError: false, message: null, items: [], links: null, meta: null,
    filters: defaultFilters,
  }),
}))
